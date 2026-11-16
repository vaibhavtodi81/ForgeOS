import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const role = z.enum(['ADMIN', 'PM']) // Stores this intermediate `role` value so later lines can use it.
const base = z.object({ // Stores this intermediate `base` value so later lines can use it.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  email: z.string().email().transform((value) => value.toLowerCase()), // Separates this argument or property from the next item in the surrounding call or object.
  password: z.string().min(8).max(200), // Separates this argument or property from the next item in the surrounding call or object.
  role, // Separates this argument or property from the next item in the surrounding call or object.
  phone: z.string().trim().max(50).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export const userIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const userIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const userListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  pageSize: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const createUserSchema = base // Provides `export const createUserSchema = base` as part of this server module.
export const updateUserSchema = base.partial().omit({ password: true }).extend({ // Opens the object or callback body that groups the settings for this operation.
  password: z.string().min(8).max(200).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const userStatusSchema = z.object({ isActive: z.boolean() }) // Provides `export const userStatusSchema = z.object({ isActive: z.boolean() })` as part of this server module.
// File purpose: Defines runtime request validation schemas for the users API.
