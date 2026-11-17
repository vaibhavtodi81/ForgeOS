import { prisma } from '../../utils/prisma.js'
import type { AuditAction } from '@prisma/client'

export async function listAuditLogs(query: {
  page: number
  limit: number
  entityType?: string
  action?: string
  userId?: number
  from?: string
  to?: string
}) {
  const where = {
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.action ? { action: query.action as AuditAction } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
            ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getAuditLogStats() {
  const [byAction, byEntityType, recent] = await Promise.all([
    prisma.auditLog.groupBy({ by: ['action'], _count: { action: true }, orderBy: { _count: { action: 'desc' } } }),
    prisma.auditLog.groupBy({ by: ['entityType'], _count: { entityType: true }, orderBy: { _count: { entityType: 'desc' } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ])

  return {
    byAction: byAction.map((r) => ({ action: r.action, count: r._count.action })),
    byEntityType: byEntityType.map((r) => ({ entityType: r.entityType, count: r._count.entityType })),
    recentCount: recent,
  }
}
