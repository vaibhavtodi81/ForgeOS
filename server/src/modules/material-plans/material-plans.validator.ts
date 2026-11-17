import { z } from 'zod'

export const projectPlanParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
})

export const planIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const createPlanSchema = z.object({
  materialId: z.coerce.number().int().positive(),
  openingQuantity: z.coerce.number().nonnegative().default(0),
  plannedQuantity: z.coerce.number().positive(),
  plannedUnitRate: z.coerce.number().nonnegative().optional(),
  lowStockThreshold: z.coerce.number().nonnegative().optional(),
  wastageThresholdPct: z.coerce.number().min(0).max(100).optional(),
})

export const updatePlanSchema = z.object({
  openingQuantity: z.coerce.number().nonnegative().optional(),
  plannedQuantity: z.coerce.number().positive().optional(),
  plannedUnitRate: z.coerce.number().nonnegative().optional(),
  lowStockThreshold: z.coerce.number().nonnegative().optional(),
  wastageThresholdPct: z.coerce.number().min(0).max(100).optional(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
