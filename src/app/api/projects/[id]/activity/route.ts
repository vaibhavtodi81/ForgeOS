import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, guardAuth, ok, pageMeta, parsePagination, pmOwns } from '@/lib/api-helpers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)

  const where: Prisma.AuditLogWhereInput = {
    OR: [{ projectId: id }, { entityId: id, entityType: 'project' }],
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: offset,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ])

  return ok(
    logs.map((log) => {
      let newData: unknown = null
      if (log.meta) {
        try {
          newData = JSON.parse(log.meta)
        } catch {
          newData = null
        }
      }
      return {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.actorId,
        userName: log.actorName,
        oldData: null,
        newData,
        createdAt: log.createdAt.toISOString(),
      }
    }),
    pageMeta(page, limit, total)
  )
}
