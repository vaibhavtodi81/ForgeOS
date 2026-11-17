import { z } from 'zod'

const landFields = {
  name: z.string().trim().min(1).max(255),
  addressLine: z.string().trim().max(500).nullable().optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().max(20).nullable().optional(),
  areaValue: z.coerce.number().positive(),
  areaUnit: z.enum(['SQFT', 'SQYD', 'SQM', 'ACRE']),
  surveyNumber: z.string().trim().max(100).nullable().optional(),
  ownerName: z.string().trim().max(255).nullable().optional(),
  purchaseDate: z.coerce.date().nullable().optional(),
  purchaseCost: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
}

export const landIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const landListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
})
export const createLandSchema = z.object(landFields)
export const updateLandSchema = z.object(landFields).partial()
