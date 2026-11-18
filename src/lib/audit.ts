import { db } from '@/lib/db'

interface AuditEntry {
  actorId?: string | null
  actorName?: string | null
  action: string
  entityType?: string | null
  entityId?: string | null
  meta?: Record<string, unknown> | null
  ip?: string | null
  createdAt?: Date
}

/**
 * Writes an audit log row. Never throws — auditing must not break the request path.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorName: entry.actorName ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        meta: entry.meta ? JSON.stringify(entry.meta) : null,
        ip: entry.ip ?? null,
        createdAt: entry.createdAt ?? new Date(),
      },
    })
  } catch (err) {
    console.error('[audit] failed to write entry:', err)
  }
}
