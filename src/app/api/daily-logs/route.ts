import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, pmOwns, parsePagination, readJson, parseDate } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { LogRow } from '@/lib/forgeos-types'

type LogWithRefs = Prisma.DailyLogGetPayload<{ include: { project: true; createdBy: true } }>

function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

function toLogRow(l: LogWithRefs): LogRow {
  return {
    id: l.id,
    projectId: l.projectId,
    projectName: l.project.name,
    logDate: l.logDate.toISOString(),
    workDone: l.workDone,
    headcount: l.headcount,
    notes: l.notes,
    createdByName: l.createdBy.name,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth

  const url = new URL(req.url)
  const { limit } = parsePagination(url, 30)

  const where: Prisma.DailyLogWhereInput = {}
  const projectId = url.searchParams.get('projectId')
  if (projectId) where.projectId = projectId
  if (user.role === 'PROJECT_MANAGER') where.project = { pmId: user.id }

  const logs = await db.dailyLog.findMany({
    where,
    include: { project: true, createdBy: true },
    orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })

  return ok({ items: logs.map(toLogRow) })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN', 'PROJECT_MANAGER'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  const project = projectId ? await db.project.findUnique({ where: { id: projectId } }) : null
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.pmId)) return fail('You can only access your own projects', 403)

  const logDate = parseDate(body.logDate)
  if (!logDate) return fail('Valid log date is required')

  const workDone = typeof body.workDone === 'string' ? body.workDone.trim() : ''
  if (workDone.length < 3) return fail('Work done must be at least 3 characters')

  const headcount = num(body.headcount)
  if (!Number.isInteger(headcount) || headcount < 1) {
    return fail('Headcount must be at least 1')
  }

  const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null

  const log = await db.dailyLog.create({
    data: { projectId, logDate, workDone, headcount, notes, createdById: user.id },
    include: { project: true, createdBy: true },
  })

  await writeAudit({
    action: 'DAILY_LOG_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'DAILY_LOG',
    entityId: log.id,
    meta: { project: project.name, headcount },
  })

  return ok({ log: toLogRow(log) })
}
