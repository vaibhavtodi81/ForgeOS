import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, parseDay, pmOwns, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { MILESTONE_STATUSES } from '@/lib/forgeos-types'
import type { MilestoneStatus } from '@/lib/forgeos-types'

function toJson(m: Prisma.MilestoneGetPayload<Record<string, never>>) {
  return {
    ...m,
    status: m.status as MilestoneStatus,
    plannedStartDate: m.plannedStartDate ? m.plannedStartDate.toISOString() : null,
    plannedEndDate: m.plannedEndDate ? m.plannedEndDate.toISOString() : null,
    actualStartDate: m.actualStartDate ? m.actualStartDate.toISOString() : null,
    actualEndDate: m.actualEndDate ? m.actualEndDate.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'milestones:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const existing = await db.milestone.findUnique({ where: { id } })
  if (!existing) return fail('Milestone not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const data: Prisma.MilestoneUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 3) return fail('Name must be at least 3 characters', 400)
    data.name = name
    changes.name = name
  }
  if (body.description !== undefined) {
    const description = optString(body.description)
    data.description = description
    changes.description = description
  }
  if (body.sequence !== undefined) {
    const sequence = num(body.sequence)
    if (!(Number.isInteger(sequence) && sequence >= 1)) {
      return fail('Sequence must be a whole number of at least 1', 400)
    }
    data.sequence = sequence
    changes.sequence = sequence
  }
  if (body.progressPercent !== undefined) {
    const progressPercent = num(body.progressPercent)
    if (!(progressPercent >= 0 && progressPercent <= 100)) {
      return fail('progressPercent must be between 0 and 100', 400)
    }
    data.progressPercent = progressPercent
    changes.progressPercent = progressPercent
  }
  if (body.status !== undefined) {
    const status = typeof body.status === 'string' ? body.status : ''
    if (!MILESTONE_STATUSES.includes(status as MilestoneStatus)) {
      return fail(`Status must be one of: ${MILESTONE_STATUSES.join(', ')}`, 400)
    }
    data.status = status
    changes.status = status
  }

  const dateFields = ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'] as const
  for (const field of dateFields) {
    if (body[field] === undefined) continue
    if (body[field] === null || body[field] === '') {
      data[field] = null
      changes[field] = null
      continue
    }
    const parsed = parseDay(body[field])
    if (!parsed) return fail(`${field} must be a YYYY-MM-DD date`, 400)
    data[field] = parsed
    changes[field] = parsed.toISOString()
  }

  const plannedStart = (data.plannedStartDate as Date | null | undefined) ?? existing.plannedStartDate
  const plannedEnd = (data.plannedEndDate as Date | null | undefined) ?? existing.plannedEndDate
  const actualStart = (data.actualStartDate as Date | null | undefined) ?? existing.actualStartDate
  const actualEnd = (data.actualEndDate as Date | null | undefined) ?? existing.actualEndDate
  if (plannedStart && plannedEnd && plannedEnd < plannedStart) {
    return fail('Planned end date must be on or after planned start date', 400)
  }
  if (actualStart && actualEnd && actualEnd < actualStart) {
    return fail('Actual end date must be on or after actual start date', 400)
  }

  const updated = await db.milestone.update({ where: { id }, data })

  await writeAudit({
    action: 'MILESTONE_UPDATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'milestone',
    entityId: id,
    projectId: existing.projectId,
    meta: changes,
    ip: getClientIp(req),
  })

  return ok(toJson(updated))
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'milestones:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const existing = await db.milestone.findUnique({ where: { id } })
  if (!existing) return fail('Milestone not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  await db.milestone.delete({ where: { id } })

  await writeAudit({
    action: 'MILESTONE_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'milestone',
    entityId: id,
    projectId: existing.projectId,
    meta: { name: existing.name, sequence: existing.sequence },
    ip: getClientIp(req),
  })

  return ok(null)
}
