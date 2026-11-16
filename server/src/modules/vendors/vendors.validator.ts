import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const vendorType = z.enum(['MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER']) // Stores this intermediate `vendor type` value so later lines can use it.
const gstin = z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Invalid GSTIN format').optional().nullable() // Stores this intermediate `gstin` value so later lines can use it.

export const vendorIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const vendorIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const projectVendorParamsSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  projectId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  vendorId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const vendorSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  vendorType: vendorType.default('OTHER'), // Separates this argument or property from the next item in the surrounding call or object.
  gstin, // Separates this argument or property from the next item in the surrounding call or object.
  phone: z.string().trim().max(30).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  email: z.string().trim().email().max(255).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  contactPerson: z.string().trim().max(255).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  address: z.string().trim().max(2000).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const createVendorSchema = vendorSchema // Provides `export const createVendorSchema = vendorSchema` as part of this server module.
export const updateVendorSchema = vendorSchema.partial().refine((value) => Object.keys(value).length > 0, { // Opens the object or callback body that groups the settings for this operation.
  message: 'At least one vendor field is required.', // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const vendorListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  isActive: z.coerce.boolean().optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export type VendorInput = z.infer<typeof vendorSchema> // Defines the `VendorInput` type so TypeScript can describe the data or behavior used here.
export type VendorUpdateInput = z.infer<typeof updateVendorSchema> // Defines the `VendorUpdateInput` type so TypeScript can describe the data or behavior used here.
export type VendorListQuery = z.infer<typeof vendorListQuerySchema> // Defines the `VendorListQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the vendors API.
