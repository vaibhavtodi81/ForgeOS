import type { RequestHandler } from 'express'
import { AppError } from '../utils/errors.js'
import { prisma } from '../utils/prisma.js'
import { verifyAccessToken } from '../utils/jwt.js'

/**
 * Authentication is owned by the identity module. This contract lets feature
 * routes consume its verified request user without implementing JWT logic here.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401))
    return
  }

  try {
    const payload = verifyAccessToken(header.slice(7))
    void prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, role: true, email: true, name: true, isActive: true },
    }).then((user) => {
      if (!user || !user.isActive) {
        next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401))
        return
      }
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name }
      next()
    }).catch(next)
  } catch {
    next(new AppError('UNAUTHENTICATED', 'Invalid or expired authentication token.', 401))
  }
}

export function requireRole(...roles: Array<'ADMIN' | 'PM'>): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401))
    } else if (!roles.includes(req.user.role)) {
      next(new AppError('FORBIDDEN', 'You do not have permission to perform this action.', 403))
    } else {
      next()
    }
  }
}
