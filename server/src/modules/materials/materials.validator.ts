import { z } from 'zod'

const materialFields = {
  name: z.string().trim().min(1).max(255),
  category: z.enum(['CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER', 'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER']),
  unit: z.string().trim().min(1).max(30),
  description: z.string().trim().max(1000).nullable().optional(),
}

export const materialIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const createMaterialSchema = z.object(materialFields)
export const updateMaterialSchema = z.object(materialFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one material field is required.' },
)
export const materialListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: materialFields.category.optional(),
  isActive: z.coerce.boolean().optional(),
})

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>
export type MaterialListQuery = z.infer<typeof materialListQuerySchema>
