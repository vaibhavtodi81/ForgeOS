import { z } from 'zod'

export const dateRangeQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (v) => !v.from || !v.to || v.from <= v.to,
  { message: 'from must be on or before to', path: ['to'] },
)

export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>
