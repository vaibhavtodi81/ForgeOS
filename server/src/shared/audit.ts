import type { Prisma, PrismaClient } from '@prisma/client'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'VOID'
  | 'LOGIN'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'PASSWORD_CHANGE'
  | 'ASSIGN'
  | 'STATUS_CHANGE'

export type AuditEntry = {
  userId: number
  action: AuditAction
  entityType: string
  entityId?: number
  oldValues?: unknown
  newValues?: unknown
  ipAddress?: string
}

type Transaction = PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export function logAudit(tx: Transaction, entry: AuditEntry) {
  return tx.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValues: (entry.oldValues ?? undefined) as Prisma.InputJsonValue | undefined,
      newValues: (entry.newValues ?? undefined) as Prisma.InputJsonValue | undefined,
      ipAddress: entry.ipAddress,
    },
  })
}

export function snapshot(entity: unknown): unknown {
  if (!entity) return undefined
  return JSON.parse(
    JSON.stringify(entity, (_k, v) => {
      if (typeof v === 'bigint') return v.toString()
      if (v instanceof Date) return v.toISOString()
      return v
    }),
  )
}

export function stripSensitive(entity: unknown, keys: string[] = ['passwordHash', 'password']): unknown {
  if (!entity || typeof entity !== 'object') return entity
  const clone = { ...(entity as Record<string, unknown>) }
  for (const key of keys) delete clone[key]
  return clone
}
