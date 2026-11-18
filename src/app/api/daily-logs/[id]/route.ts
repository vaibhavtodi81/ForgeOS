import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, parseDay, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { NextResponse } from 'next/server'

const LOG_INCLUDE = {
  labourEntries: true,
  machineryEntries: true,
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, code: true, name: true } },
  transactions: {
    select: {
      id: true,
      txnType: true,
      quantity: true,
      unitRate: true,
      txnDate: true,
      remarks: true,
      voidedAt: true,
      material: { select: { id: true, name: true, unit: true } },
    },
  },
} satisfies Prisma.DailyLogInclude

type LogWithEntries = Prisma.DailyLogGetPayload<{ include: typeof LOG_INCLUDE }>

function toLogJson(log: LogWithEntries) {
  return {
    id: log.id,
    projectId: log.projectId,
    logDate: log.logDate.toISOString(),
    progressPercent: log.progressPercent,
    workSummary: log.workSummary,
    weather: log.weather,
    issues: log.issues,
    createdById: log.createdById,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    labourEntries: log.labourEntries,
    machineryEntries: log.machineryEntries,
    stockTransactions: log.transactions,
    createdBy: log.createdBy,
    project: log.project,
    labourHeadCountTotal: log.labourEntries.reduce((sum, e) => sum + e.headCount, 0),
    machineryHoursTotal: log.machineryEntries.reduce((sum, e) => sum + e.hoursUsed, 0),
  }
}

interface LabourInput {
  trade: string
  contractorName: string | null
  headCount: number
  hoursWorked: number
  remarks: string | null
}

interface MachineryInput {
  machineName: string
  operatorName: string | null
  hoursUsed: number
  fuelLitres: number | null
  remarks: string | null
}

function parseEntries(body: Record<string, unknown>): { error: NextResponse | null; labour: LabourInput[]; machinery: MachineryInput[] } {
  const errors: string[] = []

  const labourRaw = Array.isArray(body.labourEntries) ? body.labourEntries : []
  if (body.labourEntries !== undefined && !Array.isArray(body.labourEntries)) {
    errors.push('labourEntries must be an array')
  }
  const labour: LabourInput[] = labourRaw.map((raw) => {
    const entry = raw as Record<string, unknown>
    const trade = typeof entry.trade === 'string' ? entry.trade.trim() : ''
    const headCount = num(entry.headCount)
    const hoursWorked = num(entry.hoursWorked)
    if (trade.length < 2) errors.push('Each labour entry needs a trade of at least 2 characters')
    if (!(Number.isInteger(headCount) && headCount >= 1)) errors.push('Labour headCount must be a whole number of at least 1')
    if (!(hoursWorked > 0 && hoursWorked <= 24)) errors.push('Labour hoursWorked must be greater than 0 and at most 24')
    return {
      trade,
      contractorName: optString(entry.contractorName),
      headCount,
      hoursWorked,
      remarks: optString(entry.remarks),
    }
  })

  const machineryRaw = Array.isArray(body.machineryEntries) ? body.machineryEntries : []
  if (body.machineryEntries !== undefined && !Array.isArray(body.machineryEntries)) {
    errors.push('machineryEntries must be an array')
  }
  const machinery: MachineryInput[] = machineryRaw.map((raw) => {
    const entry = raw as Record<string, unknown>
    const machineName = typeof entry.machineName === 'string' ? entry.machineName.trim() : ''
    const hoursUsed = num(entry.hoursUsed)
    const fuelLitres =
      entry.fuelLitres === undefined || entry.fuelLitres === null || entry.fuelLitres === ''
        ? null
        : num(entry.fuelLitres)
    if (machineName.length < 2) errors.push('Each machinery entry needs a machine name of at least 2 characters')
    if (!(hoursUsed > 0 && hoursUsed <= 24)) errors.push('Machinery hoursUsed must be greater than 0 and at most 24')
    if (fuelLitres !== null && !(fuelLitres >= 0)) errors.push('Machinery fuelLitres must be zero or more')
    return {
      machineName,
      operatorName: optString(entry.operatorName),
      hoursUsed,
      fuelLitres,
      remarks: optString(entry.remarks),
    }
  })

  return { error: errors.length > 0 ? fail(errors[0], 400) : null, labour, machinery }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const log = await db.dailyLog.findUnique({ where: { id }, include: LOG_INCLUDE })
  if (!log) return fail('Daily log not found', 404)
  const project = await db.project.findUnique({ where: { id: log.projectId }, select: { assignedPmId: true } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) return fail('You are not assigned to this project', 403)

  return ok(toLogJson(log))
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const existing = await db.dailyLog.findUnique({ where: { id }, include: LOG_INCLUDE })
  if (!existing) return fail('Daily log not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId }, select: { assignedPmId: true } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) return fail('You are not assigned to this project', 403)

  if (user.role === 'PM') {
    const ageHours = (Date.now() - existing.createdAt.getTime()) / 3_600_000
    if (ageHours > 48) {
      return fail('Project Managers can edit logs only within 48 hours of creation.', 422)
    }
  }

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const data: Prisma.DailyLogUncheckedUpdateInput = {}

  let logDate = existing.logDate
  if (body.logDate !== undefined) {
    const parsed = parseDay(body.logDate)
    if (!parsed) return fail('logDate must be a YYYY-MM-DD date', 400)
    logDate = parsed
    data.logDate = parsed
  }
  if (body.progressPercent !== undefined) {
    const progressPercent = num(body.progressPercent)
    if (!(progressPercent >= 0 && progressPercent <= 100)) {
      return fail('progressPercent must be between 0 and 100', 400)
    }
    data.progressPercent = progressPercent
  }
  if (body.workSummary !== undefined) {
    const workSummary = typeof body.workSummary === 'string' ? body.workSummary.trim() : ''
    if (workSummary.length < 3) return fail('workSummary must be at least 3 characters', 400)
    data.workSummary = workSummary
  }
  if (body.weather !== undefined) data.weather = optString(body.weather)
  if (body.issues !== undefined) data.issues = optString(body.issues)

  const todayUtc = new Date(new Date().toISOString().slice(0, 10))
  if (logDate.getTime() > todayUtc.getTime()) {
    return fail('logDate cannot be in the future', 422)
  }

  if (logDate.getTime() !== existing.logDate.getTime()) {
    const duplicate = await db.dailyLog.findFirst({
      where: { projectId: existing.projectId, logDate, id: { not: id } },
      select: { id: true },
    })
    if (duplicate) return fail('A log for this date already exists', 409)
  }

  const nextProgress = body.progressPercent !== undefined ? num(body.progressPercent) : existing.progressPercent
  const [prevLog, nextLog] = await Promise.all([
    db.dailyLog.findFirst({
      where: { projectId: existing.projectId, logDate: { lt: logDate }, id: { not: id } },
      orderBy: { logDate: 'desc' },
      select: { progressPercent: true },
    }),
    db.dailyLog.findFirst({
      where: { projectId: existing.projectId, logDate: { gt: logDate }, id: { not: id } },
      orderBy: { logDate: 'asc' },
      select: { progressPercent: true },
    }),
  ])
  if (prevLog && nextProgress < prevLog.progressPercent) {
    return fail('Progress cannot decrease from the previous log.', 422)
  }
  if (nextLog && nextProgress > nextLog.progressPercent) {
    return fail('Progress cannot exceed the following log.', 422)
  }

  const replaceLabour = body.labourEntries !== undefined
  const replaceMachinery = body.machineryEntries !== undefined
  const { error, labour, machinery } = parseEntries(body)
  if (error) return error

  if (replaceLabour) data.labourEntries = { create: labour }
  if (replaceMachinery) data.machineryEntries = { create: machinery }

  const updated = await db.$transaction(async (tx) => {
    if (replaceLabour) await tx.labourEntry.deleteMany({ where: { dailyLogId: id } })
    if (replaceMachinery) await tx.machineryEntry.deleteMany({ where: { dailyLogId: id } })
    return tx.dailyLog.update({ where: { id }, data, include: LOG_INCLUDE })
  })

  await writeAudit({
    action: 'LOG_UPDATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'daily-log',
    entityId: id,
    projectId: updated.projectId,
    meta: { logDate: logDate.toISOString().slice(0, 10), progressPercent: updated.progressPercent },
    ip: getClientIp(req),
  })

  return ok(toLogJson(updated))
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const existing = await db.dailyLog.findUnique({ where: { id } })
  if (!existing) return fail('Daily log not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId }, select: { assignedPmId: true } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) return fail('You are not assigned to this project', 403)

  if (user.role === 'PM') {
    const ageHours = (Date.now() - existing.createdAt.getTime()) / 3_600_000
    if (ageHours > 48) {
      return fail('Project Managers can delete logs only within 48 hours of creation.', 422)
    }
  }

  await db.$transaction([
    db.labourEntry.deleteMany({ where: { dailyLogId: id } }),
    db.machineryEntry.deleteMany({ where: { dailyLogId: id } }),
    db.dailyLog.delete({ where: { id } }),
  ])

  await writeAudit({
    action: 'LOG_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'daily-log',
    entityId: id,
    projectId: existing.projectId,
    meta: { logDate: existing.logDate.toISOString().slice(0, 10) },
    ip: getClientIp(req),
  })

  return ok(null)
}
