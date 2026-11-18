import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, optString, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { INVITE_ROLES } from '@/lib/forgeos-types'
import type { Role } from '@/lib/forgeos-types'

const ACTIVE_PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const hasRole = body.role !== undefined
  const hasActive = body.isActive !== undefined
  const hasPhone = body.phone !== undefined
  if (!hasRole && !hasActive && !hasPhone) {
    return fail('Provide role, isActive or phone to update', 400)
  }

  const target = await db.user.findUnique({ where: { id } })
  if (!target) return fail('User not found', 404)

  const isSelf = target.id === user.id
  if (isSelf && hasActive && body.isActive === false) {
    return fail('You cannot deactivate your own account', 403)
  }
  if (isSelf && hasRole) {
    const nextRole = body.role
    if (typeof nextRole !== 'string' || nextRole !== 'ADMIN') {
      return fail('You cannot remove your own administrator role', 403)
    }
  }

  if (hasRole && (typeof body.role !== 'string' || !INVITE_ROLES.includes(body.role as Role))) {
    return fail(`Role must be one of: ${INVITE_ROLES.join(', ')}`, 400)
  }
  if (hasActive && typeof body.isActive !== 'boolean') {
    return fail('isActive must be a boolean', 400)
  }

  const deactivating = hasActive && body.isActive === false
  if (deactivating && target.role === 'PM') {
    const activeProjects = await db.project.count({
      where: { assignedPmId: target.id, status: { in: ACTIVE_PROJECT_STATUSES } },
    })
    if (activeProjects > 0) {
      return fail(
        `Cannot deactivate a PM with ${activeProjects} active project(s). Reassign the project(s) to another PM first.`,
        409
      )
    }
  }

  const data: { role?: string; isActive?: boolean; phone?: string | null } = {}
  if (hasRole && body.role !== target.role) data.role = body.role as string
  if (hasActive && body.isActive !== target.isActive) data.isActive = body.isActive as boolean
  if (hasPhone) data.phone = optString(body.phone)

  const updated = await db.user.update({
    where: { id },
    data,
    include: { _count: { select: { managedProjects: true } } },
  })

  const ip = getClientIp(req)
  if (hasActive && body.isActive !== target.isActive) {
    await writeAudit({
      action: body.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'user',
      entityId: id,
      meta: { email: updated.email },
      ip,
    })
  }
  if (hasRole && data.role) {
    await writeAudit({
      action: 'ROLE_CHANGE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'user',
      entityId: id,
      meta: { from: target.role, to: updated.role },
      ip,
    })
  }
  if (hasPhone && data.phone !== undefined && data.phone !== target.phone) {
    await writeAudit({
      action: 'USER_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'user',
      entityId: id,
      meta: { phone: updated.phone },
      ip,
    })
  }

  return ok({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role as Role,
    phone: updated.phone,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    managedProjects: updated._count.managedProjects,
  })
}
