import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { ROLES } from '@/lib/forgeos-types'
import type { Role, UserRow } from '@/lib/forgeos-types'

const ACTIVE_PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD']

function toUserRow(
  u: { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: Date },
  activeProjects: number
): UserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    activeProjects,
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await readJson<{ isActive?: unknown; role?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const hasActive = body.isActive !== undefined
  const hasRole = body.role !== undefined
  if (!hasActive && !hasRole) return fail('Provide isActive or role to update', 400)
  if (hasActive && typeof body.isActive !== 'boolean') {
    return fail('isActive must be a boolean', 400)
  }
  if (hasRole && (typeof body.role !== 'string' || !ROLES.includes(body.role as Role))) {
    return fail(`Role must be one of: ${ROLES.join(', ')}`, 400)
  }

  const target = await db.user.findUnique({ where: { id } })
  if (!target) return fail('User not found', 404)

  const isSelf = target.id === auth.user.id
  if (isSelf && hasActive && body.isActive === false) {
    return fail('You cannot deactivate your own account', 403)
  }
  if (isSelf && hasRole) {
    return fail('You cannot change your own role', 403)
  }

  const deactivating = hasActive && body.isActive === false
  if (deactivating && target.role === 'PROJECT_MANAGER') {
    const activeProjects = await db.project.count({
      where: { pmId: target.id, status: { in: ACTIVE_PROJECT_STATUSES } },
    })
    if (activeProjects > 0) {
      return fail('This manager still has active projects. Reassign or complete them first.', 409)
    }
  }

  const updates: { isActive?: boolean; role?: Role } = {}
  if (hasActive) updates.isActive = body.isActive as boolean
  if (hasRole) updates.role = body.role as Role

  const updated = await db.user.update({
    where: { id },
    data: updates,
    include: {
      managedProjects: {
        where: { status: { in: ACTIVE_PROJECT_STATUSES } },
        select: { id: true },
      },
    },
  })

  const ip = getClientIp(req)
  if (hasActive && body.isActive !== target.isActive) {
    await writeAudit({
      action: body.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      actorId: auth.user.id,
      actorName: auth.user.name,
      entityType: 'user',
      entityId: updated.id,
      meta: { email: updated.email },
      ip,
    })
  }
  if (hasRole && updates.role !== target.role) {
    await writeAudit({
      action: 'ROLE_CHANGE',
      actorId: auth.user.id,
      actorName: auth.user.name,
      entityType: 'user',
      entityId: updated.id,
      meta: { from: target.role, to: updated.role },
      ip,
    })
  }

  return ok({ user: toUserRow(updated, updated.managedProjects.length) })
}
