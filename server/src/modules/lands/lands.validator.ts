import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const landFields = { // Stores this intermediate `land fields` value so later lines can use it.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  addressLine: z.string().trim().max(500).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  city: z.string().trim().min(1).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  state: z.string().trim().min(1).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  pincode: z.string().trim().max(20).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  areaValue: z.coerce.number().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  areaUnit: z.enum(['SQFT', 'SQYD', 'SQM', 'ACRE']), // Separates this argument or property from the next item in the surrounding call or object.
  surveyNumber: z.string().trim().max(100).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  ownerName: z.string().trim().max(255).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  purchaseDate: z.coerce.date().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  purchaseCost: z.coerce.number().nonnegative().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  notes: z.string().trim().max(2000).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

export const landIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const landIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const landListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  pageSize: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const createLandSchema = z.object(landFields) // Provides `export const createLandSchema = z.object(landFields)` as part of this server module.
export const updateLandSchema = z.object(landFields).partial() // Provides `export const updateLandSchema = z.object(landFields).partial()` as part of this server module.
// File purpose: Defines runtime request validation schemas for the lands API.
