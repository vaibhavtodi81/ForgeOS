import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { guardAuth, ok, parsePagination } from '@/lib/api-helpers'
import type { AuditRow } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 25)
  const action = url.searchParams.get('action')
  const entityType = url.searchParams.get('entityType')
  const actorId = url.searchParams.get('actorId')
  const search = url.searchParams.get('search')?.trim()

  const where: Prisma.AuditLogWhereInput = {}
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  // The audit UI filters by actor name (stats only expose names); match id or name.
  const andClauses: Prisma.AuditLogWhereInput[] = []
  if (actorId) {
    andClauses.push({ OR: [{ actorId }, { actorName: actorId }] })
  }
  if (search) {
    andClauses.push({
      OR: [
        { actorName: { contains: search } },
        { meta: { contains: search } },
        { entityId: { contains: search } },
      ],
    })
  }
  if (andClauses.length > 0) where.AND = andClauses

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: offset, take: limit }),
    db.auditLog.count({ where }),
  ])

  const items: AuditRow[] = logs.map((log) => ({
    id: log.id,
    action: log.action,
    actorId: log.actorId,
    actorName: log.actorName,
    entityType: log.entityType,
    entityId: log.entityId,
    meta: log.meta,
    ip: log.ip,
    createdAt: log.createdAt.toISOString(),
  }))

  return ok({ items, total, page, limit })
}
