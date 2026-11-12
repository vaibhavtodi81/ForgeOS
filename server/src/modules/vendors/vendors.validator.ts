import { z } from 'zod'

const vendorType = z.enum(['MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER'])
const gstin = z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Invalid GSTIN format').optional().nullable()

export const vendorIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const projectVendorParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  vendorId: z.coerce.number().int().positive(),
})
export const vendorSchema = z.object({
  name: z.string().trim().min(1).max(255),
  vendorType: vendorType.default('OTHER'),
  gstin,
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  contactPerson: z.string().trim().max(255).optional().nullable(),
  address: z.string().trim().max(2000).optional().nullable(),
})
export const createVendorSchema = vendorSchema
export const updateVendorSchema = vendorSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one vendor field is required.',
})
export const vendorListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
})

export type VendorInput = z.infer<typeof vendorSchema>
export type VendorUpdateInput = z.infer<typeof updateVendorSchema>
export type VendorListQuery = z.infer<typeof vendorListQuerySchema>
