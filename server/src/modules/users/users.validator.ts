import { z } from 'zod'

const role = z.enum(['ADMIN', 'PM'])
const base = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(200),
  role,
  phone: z.string().trim().max(50).nullable().optional(),
})

export const userIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
})
export const createUserSchema = base
export const updateUserSchema = base.partial().omit({ password: true }).extend({
  password: z.string().min(8).max(200).optional(),
})
export const userStatusSchema = z.object({ isActive: z.boolean() })
