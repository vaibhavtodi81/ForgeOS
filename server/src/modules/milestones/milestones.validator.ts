import { z } from 'zod'

const milestoneDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')
const milestoneFields = {
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  sequence: z.coerce.number().int().positive(),
  plannedStartDate: milestoneDate.nullable().optional(),
  plannedEndDate: milestoneDate.nullable().optional(),
  actualStartDate: milestoneDate.nullable().optional(),
  actualEndDate: milestoneDate.nullable().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
  progressPercent: z.coerce.number().min(0).max(100),
}
const milestoneDateRules = (value: {
  plannedStartDate?: string | null
  plannedEndDate?: string | null
  actualStartDate?: string | null
  actualEndDate?: string | null
}) => (
  (!value.plannedStartDate || !value.plannedEndDate || value.plannedStartDate <= value.plannedEndDate)
  && (!value.actualStartDate || !value.actualEndDate || value.actualStartDate <= value.actualEndDate)
)
const milestoneDateMessage = {
  message: 'Milestone end dates must be on or after their start dates.',
  path: ['plannedEndDate'],
}

export const createMilestoneSchema = z.object({
  ...milestoneFields,
  status: milestoneFields.status.default('PLANNED'),
  progressPercent: milestoneFields.progressPercent.default(0),
}).refine(milestoneDateRules, milestoneDateMessage)

export const updateMilestoneSchema = z.object(milestoneFields).partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one milestone field is required.' })
  .refine(milestoneDateRules, milestoneDateMessage)

export const milestoneIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
