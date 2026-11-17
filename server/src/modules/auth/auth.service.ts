import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { verifyPassword, hashPassword } from '../../utils/password.js'
import { createAccessToken } from '../../utils/jwt.js'
import { logAudit, snapshot, stripSensitive } from '../../shared/audit.js'

export function safeUser(user: {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'PM'
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function login(email: string, password: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401)
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    await logAudit(tx, {
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      newValues: { loginAt: new Date().toISOString() },
      ipAddress,
    })
  })

  return { token: createAccessToken(user), user: safeUser(user) }
}

export async function getCurrentUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !user.isActive) throw new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)
  return safeUser(user)
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) {
    throw new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect.', 401)
  }

  const newHash = hashPassword(newPassword)
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    })
    await logAudit(tx, {
      userId,
      action: 'PASSWORD_CHANGE',
      entityType: 'User',
      entityId: userId,
      oldValues: stripSensitive(snapshot(user)),
      newValues: { passwordChangedAt: new Date().toISOString() },
    })
  })
}
