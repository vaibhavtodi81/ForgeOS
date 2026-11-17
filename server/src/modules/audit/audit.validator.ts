import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.string().trim().optional(),
  action: z.string().trim().optional(),
  userId: z.coerce.number().int().positive().optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
}).refine(
  (v) => !v.from || !v.to || v.from <= v.to,
  { message: 'from must be on or before to', path: ['to'] },
)

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>
