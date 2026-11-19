import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, pageMeta, parseDay, parsePagination, pmOwns, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'

const LOG_INCLUDE = {
  labourEntries: true,
  machineryEntries: true,
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.DailyLogInclude

type LogWithEntries = Prisma.DailyLogGetPayload<{ include: { labourEntries: true; machineryEntries: true; createdBy: { select: { id: true; name: true } } } }>

function toLogJson(log: LogWithEntries, withTotals = false) {
  const base = {
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
    createdBy: log.createdBy,
  }
  if (!withTotals) return base
  return {
    ...base,
    labourHeadCountTotal: log.labourEntries.reduce((sum, e) => sum + e.headCount, 0),
    machineryHoursTotal: log.machineryEntries.reduce((sum, e) => sum + e.hoursUsed, 0),
  }
}

interface LabourInput {
  trade: string
  contractorName?: string | null
  headCount: number
  hoursWorked: number
  remarks?: string | null
}

interface MachineryInput {
  machineName: string
  operatorName?: string | null
  hoursUsed: number
  fuelLitres?: number | null
  remarks?: string | null
}

function parseEntries(body: Record<string, unknown>) {
  const labourErrors: string[] = []
  const machineryErrors: string[] = []

  const labourRaw = Array.isArray(body.labourEntries) ? body.labourEntries : []
  if (!Array.isArray(body.labourEntries) && body.labourEntries !== undefined) {
    labourErrors.push('labourEntries must be an array')
  }
  const labour: LabourInput[] = labourRaw.map((raw) => {
    const entry = raw as Record<string, unknown>
    const trade = typeof entry.trade === 'string' ? entry.trade.trim() : ''
    const headCount = num(entry.headCount)
    const hoursWorked = num(entry.hoursWorked)
    if (trade.length < 2) labourErrors.push('Each labour entry needs a trade of at least 2 characters')
    if (!(Number.isInteger(headCount) && headCount >= 1)) labourErrors.push('Labour headCount must be a whole number of at least 1')
    if (!(hoursWorked > 0 && hoursWorked <= 24)) labourErrors.push('Labour hoursWorked must be greater than 0 and at most 24')
    return {
      trade,
      contractorName: typeof entry.contractorName === 'string' && entry.contractorName.trim() ? entry.contractorName.trim() : null,
      headCount,
      hoursWorked,
      remarks: typeof entry.remarks === 'string' && entry.remarks.trim() ? entry.remarks.trim() : null,
    }
  })

  const machineryRaw = Array.isArray(body.machineryEntries) ? body.machineryEntries : []
  if (!Array.isArray(body.machineryEntries) && body.machineryEntries !== undefined) {
    machineryErrors.push('machineryEntries must be an array')
  }
  const machinery: MachineryInput[] = machineryRaw.map((raw) => {
    const entry = raw as Record<string, unknown>
    const machineName = typeof entry.machineName === 'string' ? entry.machineName.trim() : ''
    const hoursUsed = num(entry.hoursUsed)
    const fuelRaw = entry.fuelLitres
    const fuelLitres =
      fuelRaw === undefined || fuelRaw === null || fuelRaw === ''
        ? null
        : num(fuelRaw)
    if (machineName.length < 2) machineryErrors.push('Each machinery entry needs a machine name of at least 2 characters')
    if (!(hoursUsed > 0 && hoursUsed <= 24)) machineryErrors.push('Machinery hoursUsed must be greater than 0 and at most 24')
    if (fuelLitres !== null && !(fuelLitres >= 0)) machineryErrors.push('Machinery fuelLitres must be zero or more')
    return {
      machineName,
      operatorName: typeof entry.operatorName === 'string' && entry.operatorName.trim() ? entry.operatorName.trim() : null,
      hoursUsed,
      fuelLitres,
      remarks: typeof entry.remarks === 'string' && entry.remarks.trim() ? entry.remarks.trim() : null,
    }
  })

  return { labour, machinery, labourErrors, machineryErrors }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)
  const from = parseDay(url.searchParams.get('from'))
  const to = parseDay(url.searchParams.get('to'))

  const where: Prisma.DailyLogWhereInput = {
    projectId: id,
    ...(from || to
      ? { logDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
  }

  const [logs, total] = await Promise.all([
    db.dailyLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
      skip: offset,
      take: limit,
      include: LOG_INCLUDE,
    }),
    db.dailyLog.count({ where }),
  ])

  return ok(logs.map((log) => toLogJson(log, true)), pageMeta(page, limit, total))
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'logs:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }
  if (project.status !== 'ACTIVE') {
    return fail('Daily logs can only be recorded for active projects', 422)
  }

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const logDate = parseDay(body.logDate)
  if (!logDate) return fail('logDate is required (YYYY-MM-DD)', 400)
  const todayUtc = new Date(new Date().toISOString().slice(0, 10))
  if (logDate.getTime() > todayUtc.getTime()) {
    return fail('logDate cannot be in the future', 422)
  }

  const progressPercent = num(body.progressPercent)
  if (!(progressPercent >= 0 && progressPercent <= 100)) {
    return fail('progressPercent must be between 0 and 100', 400)
  }

  const workSummary = typeof body.workSummary === 'string' ? body.workSummary.trim() : ''
  if (workSummary.length < 3) return fail('workSummary must be at least 3 characters', 400)

  const { labour, machinery, labourErrors, machineryErrors } = parseEntries(body)
  if (labourErrors.length > 0) return fail(labourErrors[0], 400)
  if (machineryErrors.length > 0) return fail(machineryErrors[0], 400)

  const duplicate = await db.dailyLog.findUnique({
    where: { projectId_logDate: { projectId: id, logDate } },
    select: { id: true },
  })
  if (duplicate) return fail('A log for this date already exists', 409)

  const [prevLog, nextLog] = await Promise.all([
    db.dailyLog.findFirst({
      where: { projectId: id, logDate: { lt: logDate } },
      orderBy: { logDate: 'desc' },
      select: { progressPercent: true },
    }),
    db.dailyLog.findFirst({
      where: { projectId: id, logDate: { gt: logDate } },
      orderBy: { logDate: 'asc' },
      select: { progressPercent: true },
    }),
  ])
  if (prevLog && progressPercent < prevLog.progressPercent) {
    return fail('Progress cannot decrease from the previous log.', 422)
  }
  if (nextLog && progressPercent > nextLog.progressPercent) {
    return fail('Progress cannot exceed the following log.', 422)
  }

  const weather = typeof body.weather === 'string' && body.weather.trim() ? body.weather.trim() : null
  const issues = typeof body.issues === 'string' && body.issues.trim() ? body.issues.trim() : null

  const created = await db.$transaction(async (tx) => {
    const log = await tx.dailyLog.create({
      data: {
        projectId: id,
        logDate,
        progressPercent,
        workSummary,
        weather,
        issues,
        createdById: user.id,
        labourEntries: { create: labour },
        machineryEntries: { create: machinery },
      },
      include: LOG_INCLUDE,
    })
    return log
  })

  await writeAudit({
    action: 'LOG_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'daily-log',
    entityId: created.id,
    projectId: id,
    meta: { logDate: logDate.toISOString().slice(0, 10), progressPercent, workSummary },
    ip: getClientIp(req),
  })

  return ok(toLogJson(created, true))
}
