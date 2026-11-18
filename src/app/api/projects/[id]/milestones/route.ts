import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, parseDay, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { MILESTONE_STATUSES } from '@/lib/forgeos-types'
import type { MilestoneStatus } from '@/lib/forgeos-types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const milestones = await db.milestone.findMany({
    where: { projectId: id },
    orderBy: [{ sequence: 'asc' }, { plannedStartDate: 'asc' }, { createdAt: 'asc' }],
  })

  return ok(
    milestones.map((m) => ({
      ...m,
      status: m.status as MilestoneStatus,
      plannedStartDate: m.plannedStartDate ? m.plannedStartDate.toISOString() : null,
      plannedEndDate: m.plannedEndDate ? m.plannedEndDate.toISOString() : null,
      actualStartDate: m.actualStartDate ? m.actualStartDate.toISOString() : null,
      actualEndDate: m.actualEndDate ? m.actualEndDate.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }))
  )
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 3) return fail('Name must be at least 3 characters', 400)

  const sequence = num(body.sequence)
  if (!(Number.isInteger(sequence) && sequence >= 1)) {
    return fail('Sequence must be a whole number of at least 1', 400)
  }

  const progressPercent = num(body.progressPercent)
  if (!(progressPercent >= 0 && progressPercent <= 100)) {
    return fail('progressPercent must be between 0 and 100', 400)
  }

  const status = typeof body.status === 'string' ? body.status : ''
  if (!MILESTONE_STATUSES.includes(status as MilestoneStatus)) {
    return fail(`Status must be one of: ${MILESTONE_STATUSES.join(', ')}`, 400)
  }

  const plannedStartDate = parseDay(body.plannedStartDate)
  const plannedEndDate = parseDay(body.plannedEndDate)
  const actualStartDate = parseDay(body.actualStartDate)
  const actualEndDate = parseDay(body.actualEndDate)
  if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
    return fail('Planned end date must be on or after planned start date', 400)
  }
  if (actualStartDate && actualEndDate && actualEndDate < actualStartDate) {
    return fail('Actual end date must be on or after actual start date', 400)
  }

  const milestone = await db.milestone.create({
    data: {
      projectId: id,
      name,
      description: optString(body.description),
      sequence,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      status,
      progressPercent,
    },
  })

  await writeAudit({
    action: 'MILESTONE_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'milestone',
    entityId: milestone.id,
    projectId: id,
    meta: { name, sequence, status, progressPercent },
    ip: getClientIp(req),
  })

  return ok({
    ...milestone,
    status: milestone.status as MilestoneStatus,
    plannedStartDate: milestone.plannedStartDate ? milestone.plannedStartDate.toISOString() : null,
    plannedEndDate: milestone.plannedEndDate ? milestone.plannedEndDate.toISOString() : null,
    actualStartDate: milestone.actualStartDate ? milestone.actualStartDate.toISOString() : null,
    actualEndDate: milestone.actualEndDate ? milestone.actualEndDate.toISOString() : null,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  })
}
