import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const milestoneDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format') // Stores this intermediate `milestone date` value so later lines can use it.
const milestoneFields = { // Stores this intermediate `milestone fields` value so later lines can use it.
  name: z.string().trim().min(1).max(255), // Separates this argument or property from the next item in the surrounding call or object.
  description: z.string().trim().max(5000).nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  sequence: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  plannedStartDate: milestoneDate.nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  plannedEndDate: milestoneDate.nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  actualStartDate: milestoneDate.nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  actualEndDate: milestoneDate.nullable().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']), // Separates this argument or property from the next item in the surrounding call or object.
  progressPercent: z.coerce.number().min(0).max(100), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.
const milestoneDateRules = (value: { // Stores this intermediate `milestone date rules` value so later lines can use it.
  plannedStartDate?: string | null // Provides `plannedStartDate?: string | null` as part of this server module.
  plannedEndDate?: string | null // Provides `plannedEndDate?: string | null` as part of this server module.
  actualStartDate?: string | null // Provides `actualStartDate?: string | null` as part of this server module.
  actualEndDate?: string | null // Provides `actualEndDate?: string | null` as part of this server module.
}) => ( // Provides `}) => (` as part of this server module.
  (!value.plannedStartDate || !value.plannedEndDate || value.plannedStartDate <= value.plannedEndDate) // Provides `(!value.plannedStartDate || !value.plannedEndDate || value.plannedStartDate <= value.plannedEndDate)` as part of this server module.
  && (!value.actualStartDate || !value.actualEndDate || value.actualStartDate <= value.actualEndDate) // Provides `&& (!value.actualStartDate || !value.actualEndDate || value.actualStartDate <= value.actualEndDate)` as part of this server module.
) // Closes the current call, object, or collection so the surrounding expression can continue.
const milestoneDateMessage = { // Stores this intermediate `milestone date message` value so later lines can use it.
  message: 'Milestone end dates must be on or after their start dates.', // Separates this argument or property from the next item in the surrounding call or object.
  path: ['plannedEndDate'], // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

export const createMilestoneSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  ...milestoneFields, // Separates this argument or property from the next item in the surrounding call or object.
  status: milestoneFields.status.default('PLANNED'), // Separates this argument or property from the next item in the surrounding call or object.
  progressPercent: milestoneFields.progressPercent.default(0), // Separates this argument or property from the next item in the surrounding call or object.
}).refine(milestoneDateRules, milestoneDateMessage) // Provides `}).refine(milestoneDateRules, milestoneDateMessage)` as part of this server module.

export const updateMilestoneSchema = z.object(milestoneFields).partial() // Provides `export const updateMilestoneSchema = z.object(milestoneFields).partial()` as part of this server module.
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one milestone field is required.' }) // Provides `.refine((value) => Object.keys(value).length > 0, { message: 'At least one milestone field is required.' })` as part of this server module.
  .refine(milestoneDateRules, milestoneDateMessage) // Provides `.refine(milestoneDateRules, milestoneDateMessage)` as part of this server module.

export const milestoneIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const milestoneIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema> // Defines the `CreateMilestoneInput` type so TypeScript can describe the data or behavior used here.
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema> // Defines the `UpdateMilestoneInput` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the milestones API.
