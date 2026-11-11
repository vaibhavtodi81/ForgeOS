import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')
const labourEntry = z.object({
  trade: z.string().trim().min(1).max(100),
  contractorName: z.string().trim().max(150).optional(),
  headCount: z.number().int().positive(),
  hoursWorked: z.number().min(0).max(24).default(8),
  remarks: z.string().trim().max(500).optional(),
})
const machineryEntry = z.object({
  machineName: z.string().trim().min(1).max(150),
  operatorName: z.string().trim().max(150).optional(),
  hoursUsed: z.number().min(0).max(24),
  fuelLitres: z.number().min(0).optional(),
  remarks: z.string().trim().max(500).optional(),
})

export const dailyLogBodySchema = z.object({
  logDate: dateOnly,
  progressPercent: z.number().min(0).max(100),
  workSummary: z.string().trim().min(1).max(5000),
  weather: z.string().trim().max(150).optional(),
  issues: z.string().trim().max(5000).optional(),
  labourEntries: z.array(labourEntry).optional(),
  machineryEntries: z.array(machineryEntry).optional(),
})

export const dailyLogPatchSchema = dailyLogBodySchema.partial()

export const dailyLogListQuerySchema = z.object({
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
  (value) => !value.from || !value.to || value.from <= value.to,
  { message: 'The from date must be on or before the to date.', path: ['to'] },
)

export const projectIdParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
})

export const dailyLogIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type DailyLogInput = z.infer<typeof dailyLogBodySchema>
export type DailyLogPatch = z.infer<typeof dailyLogPatchSchema>
export type DailyLogListQuery = z.infer<typeof dailyLogListQuerySchema>
