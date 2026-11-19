import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { ALLOWED_PROJECT_TRANSITIONS, PROJECT_STATUSES } from '@/lib/forgeos-types'
import type { ProjectStatus } from '@/lib/forgeos-types'

const INCLUDE = {
  land: { select: { id: true, name: true, addressLine: true, city: true, state: true, pincode: true } },
  assignedPm: { select: { id: true, name: true, email: true } },
  _count: { select: { logs: true, transactions: true, plans: true, milestones: true, invoices: true } },
} satisfies Prisma.ProjectInclude

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'projects:status')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const status = body.status
  if (typeof status !== 'string' || !PROJECT_STATUSES.includes(status as ProjectStatus)) {
    return fail('Invalid status', 400)
  }

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  const current = project.status as ProjectStatus
  const allowed = ALLOWED_PROJECT_TRANSITIONS[current]
  if (!allowed.includes(status as ProjectStatus)) {
    const targets = allowed.length > 0 ? allowed.join(', ') : 'none (terminal status)'
    return fail(`Invalid status transition from ${current} to ${status}. Allowed: ${targets}`, 422)
  }

  const data: Prisma.ProjectUncheckedUpdateInput = { status }
  if (status === 'COMPLETED') data.actualEndDate = new Date()

  const updated = await db.project.update({ where: { id }, data, include: INCLUDE })

  await writeAudit({
    action: 'STATUS_CHANGE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'project',
    entityId: id,
    projectId: id,
    meta: { from: current, to: status, actualEndDate: status === 'COMPLETED' ? updated.actualEndDate : null },
    ip: getClientIp(req),
  })

  return ok({ project: { ...updated, status: updated.status as ProjectStatus } })
}
