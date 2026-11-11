import { z } from 'zod'

const projectFields = {
  landId: z.coerce.number().int().positive(),
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']),
  startDate: z.coerce.date().nullable().optional(),
  expectedEndDate: z.coerce.date().nullable().optional(),
  actualEndDate: z.coerce.date().nullable().optional(),
  totalBudget: z.coerce.number().nonnegative(),
  wastageThresholdPct: z.coerce.number().min(0).max(100),
  assignedPmId: z.coerce.number().int().positive().nullable().optional(),
}
const projectSchema = z.object(projectFields)
const dates = projectSchema.refine((value) => !value.startDate || !value.expectedEndDate || value.expectedEndDate >= value.startDate, { message: 'Expected end date must be on or after start date.', path: ['expectedEndDate'] })
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')
export const projectIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const projectScopedIdParamsSchema = z.object({ projectId: z.coerce.number().int().positive() })
export const projectActivityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export const projectDateRangeQuerySchema = z.object({
  from: dateOnly.optional(),
  to: dateOnly.optional(),
}).refine(
  (value) => !value.from || !value.to || value.from <= value.to,
  { message: 'The from date must be on or before the to date.', path: ['to'] },
)
export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
  search: z.string().trim().max(100).optional(),
})
export const projectProgressHistoryQuerySchema = z.object({
  from: dateOnly.optional(),
  to: dateOnly.optional(),
}).refine(
  (value) => !value.from || !value.to || value.from <= value.to,
  { message: 'The from date must be on or before the to date.', path: ['to'] },
)
export const createProjectSchema = dates
export const updateProjectSchema = projectSchema.partial().refine((value) => !value.startDate || !value.expectedEndDate || value.expectedEndDate >= value.startDate, { message: 'Expected end date must be on or after start date.', path: ['expectedEndDate'] })
export type ProjectProgressHistoryQuery = z.infer<typeof projectProgressHistoryQuerySchema>
export type ProjectActivityQuery = z.infer<typeof projectActivityQuerySchema>
export type ProjectDateRangeQuery = z.infer<typeof projectDateRangeQuerySchema>
