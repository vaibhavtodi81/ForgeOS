import type { Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { hashPassword } from '../../utils/password.js'
import { safeUser } from '../auth/auth.service.js'
import { logAudit, snapshot, stripSensitive } from '../../shared/audit.js'

type Actor = { id: number; role: Role }

export async function listUsers(page: number, pageSize: number, search?: string) {
  const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {}
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.user.count({ where }),
  ])
  return { users: users.map(safeUser), meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

export async function getUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError('NOT_FOUND', 'User not found.', 404)
  return safeUser(user)
}

export async function createUser(actor: Actor, input: { name: string; email: string; password: string; role: Role; phone?: string | null }) {
  const { password, ...userData } = input
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, passwordHash: hashPassword(password), phone: input.phone ?? null },
    })
    await logAudit(tx, {
      userId: actor.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      newValues: stripSensitive(snapshot(user)),
    })
    return safeUser(user)
  })
}

export async function updateUser(actor: Actor, id: number, input: { name?: string; email?: string; password?: string; role?: Role; phone?: string | null }) {
  if (actor.id === id && input.role && input.role !== 'ADMIN') {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'You cannot remove your own administrator role.', 400)
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new AppError('NOT_FOUND', 'User not found.', 404)

  const { password, ...rest } = input
  const data = password ? { ...rest, passwordHash: hashPassword(password) } : rest

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id }, data })
    await logAudit(tx, {
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      oldValues: stripSensitive(snapshot(existing)),
      newValues: stripSensitive(snapshot(updated)),
    })
    return safeUser(updated)
  })
}

export async function updateUserStatus(actor: Actor, id: number, isActive: boolean) {
  if (actor.id === id && !isActive) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'You cannot deactivate your own account.', 400)
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new AppError('NOT_FOUND', 'User not found.', 404)

  if (!isActive && existing.role === 'PM') {
    const activeProjects = await prisma.project.count({
      where: { assignedPmId: id, status: 'ACTIVE' },
    })
    if (activeProjects > 0) {
      throw new AppError(
        'BUSINESS_RULE_VIOLATION',
        `Cannot deactivate a PM with ${activeProjects} active project(s). Reassign the project(s) to another PM first.`,
        422,
        { activeProjectCount: activeProjects },
      )
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id }, data: { isActive } })
    await logAudit(tx, {
      userId: actor.id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'User',
      entityId: id,
      oldValues: { isActive: existing.isActive },
      newValues: { isActive },
    })
    return safeUser(updated)
  })
}
