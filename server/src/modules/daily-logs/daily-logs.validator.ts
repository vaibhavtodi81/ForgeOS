import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format') // Stores this intermediate `date only` value so later lines can use it.
const labourEntry = z.object({ // Stores this intermediate `labour entry` value so later lines can use it.
  trade: z.string().trim().min(1).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  contractorName: z.string().trim().max(150).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  headCount: z.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  hoursWorked: z.number().min(0).max(24).default(8), // Separates this argument or property from the next item in the surrounding call or object.
  remarks: z.string().trim().max(500).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
const machineryEntry = z.object({ // Stores this intermediate `machinery entry` value so later lines can use it.
  machineName: z.string().trim().min(1).max(150), // Separates this argument or property from the next item in the surrounding call or object.
  operatorName: z.string().trim().max(150).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  hoursUsed: z.number().min(0).max(24), // Separates this argument or property from the next item in the surrounding call or object.
  fuelLitres: z.number().min(0).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  remarks: z.string().trim().max(500).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export const dailyLogBodySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  logDate: dateOnly, // Separates this argument or property from the next item in the surrounding call or object.
  progressPercent: z.number().min(0).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  workSummary: z.string().trim().min(1).max(5000), // Separates this argument or property from the next item in the surrounding call or object.
  weather: z.string().trim().max(150).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  issues: z.string().trim().max(5000).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  labourEntries: z.array(labourEntry).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  machineryEntries: z.array(machineryEntry).optional(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export const dailyLogPatchSchema = dailyLogBodySchema.partial() // Provides `export const dailyLogPatchSchema = dailyLogBodySchema.partial()` as part of this server module.

export const dailyLogListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  from: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  to: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  limit: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
}).refine( // Provides `}).refine(` as part of this server module.
  (value) => !value.from || !value.to || value.from <= value.to, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'The from date must be on or before the to date.', path: ['to'] }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.

export const projectIdParamsSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  projectId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export const dailyLogIdParamsSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  id: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export type DailyLogInput = z.infer<typeof dailyLogBodySchema> // Defines the `DailyLogInput` type so TypeScript can describe the data or behavior used here.
export type DailyLogPatch = z.infer<typeof dailyLogPatchSchema> // Defines the `DailyLogPatch` type so TypeScript can describe the data or behavior used here.
export type DailyLogListQuery = z.infer<typeof dailyLogListQuerySchema> // Defines the `DailyLogListQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the daily logs API.
