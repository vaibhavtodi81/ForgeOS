import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const projectFields = { // Stores this intermediate `project fields` value so later lines can use it.
  landId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  code: z.string().trim().min(1).max(50), // Separates this argument or property from the next item in the surrounding call or object.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  description: z.string().trim().max(5000).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']), // Separates this argument or property from the next item in the surrounding call or object.
  startDate: z.coerce.date().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  expectedEndDate: z.coerce.date().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  actualEndDate: z.coerce.date().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  totalBudget: z.coerce.number().nonnegative(), // Separates this argument or property from the next item in the surrounding call or object.
  wastageThresholdPct: z.coerce.number().min(0).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  assignedPmId: z.coerce.number().int().positive().nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.
const projectSchema = z.object(projectFields) // Stores this intermediate `project schema` value so later lines can use it.
const dates = projectSchema.refine((value) => !value.startDate || !value.expectedEndDate || value.expectedEndDate >= value.startDate, { message: 'Expected end date must be on or after start date.', path: ['expectedEndDate'] }) // Stores this intermediate `dates` value so later lines can use it.
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format') // Stores this intermediate `date only` value so later lines can use it.
export const projectIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const projectIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const projectScopedIdParamsSchema = z.object({ projectId: z.coerce.number().int().positive() }) // Provides `export const projectScopedIdParamsSchema = z.object({ projectId: z.coerce.number().int().positive() })` as part of this server module.
export const projectActivityQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  limit: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const projectDateRangeQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  from: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  to: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
}).refine( // Provides `}).refine(` as part of this server module.
  (value) => !value.from || !value.to || value.from <= value.to, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'The from date must be on or before the to date.', path: ['to'] }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const projectListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  pageSize: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const projectProgressHistoryQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  from: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  to: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
}).refine( // Provides `}).refine(` as part of this server module.
  (value) => !value.from || !value.to || value.from <= value.to, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'The from date must be on or before the to date.', path: ['to'] }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const createProjectSchema = dates // Provides `export const createProjectSchema = dates` as part of this server module.
export const updateProjectSchema = projectSchema.partial().refine((value) => !value.startDate || !value.expectedEndDate || value.expectedEndDate >= value.startDate, { message: 'Expected end date must be on or after start date.', path: ['expectedEndDate'] }) // Provides `export const updateProjectSchema = projectSchema.partial().refine((value) => !value.startDate || !value.expectedEndDate || value.expectedEndDate >= value.startDate, { message: 'Expected end date must be on or after start date.', path: ['expectedEndDate'] })` as part of this server module.
export type ProjectProgressHistoryQuery = z.infer<typeof projectProgressHistoryQuerySchema> // Defines the `ProjectProgressHistoryQuery` type so TypeScript can describe the data or behavior used here.
export type ProjectActivityQuery = z.infer<typeof projectActivityQuerySchema> // Defines the `ProjectActivityQuery` type so TypeScript can describe the data or behavior used here.
export type ProjectDateRangeQuery = z.infer<typeof projectDateRangeQuerySchema> // Defines the `ProjectDateRangeQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the projects API.
