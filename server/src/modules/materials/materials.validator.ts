import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const materialFields = { // Stores this intermediate `material fields` value so later lines can use it.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  category: z.enum(['CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER', 'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER']), // Separates this argument or property from the next item in the surrounding call or object.
  unit: z.string().trim().min(1).max(30), // Separates this argument or property from the next item in the surrounding call or object.
  description: z.string().trim().max(1000).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

export const materialIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const materialIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const createMaterialSchema = z.object(materialFields) // Provides `export const createMaterialSchema = z.object(materialFields)` as part of this server module.
export const updateMaterialSchema = z.object(materialFields).partial().refine( // Provides `export const updateMaterialSchema = z.object(materialFields).partial().refine(` as part of this server module.
  (value) => Object.keys(value).length > 0, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'At least one material field is required.' }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const materialListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  category: materialFields.category.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  isActive: z.coerce.boolean().optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export type CreateMaterialInput = z.infer<typeof createMaterialSchema> // Defines the `CreateMaterialInput` type so TypeScript can describe the data or behavior used here.
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema> // Defines the `UpdateMaterialInput` type so TypeScript can describe the data or behavior used here.
export type MaterialListQuery = z.infer<typeof materialListQuerySchema> // Defines the `MaterialListQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the materials API.
