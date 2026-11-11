import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { verifyPassword } from '../../utils/password.js'
import { createAccessToken } from '../../utils/jwt.js'

export function safeUser(user: { id: number; name: string; email: string; role: 'ADMIN' | 'PM'; phone: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }) {
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

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401)
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })
  return { token: createAccessToken(user), user: safeUser(updated) }
}

export async function getCurrentUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !user.isActive) throw new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)
  return safeUser(user)
}
