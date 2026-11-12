import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')
const billCategory = z.enum(['MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER'])
const gstPercent = z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)])
const billFields = {
  projectId: z.coerce.number().int().positive(),
  vendorId: z.coerce.number().int().positive(),
  billNumber: z.string().trim().min(1).max(100),
  billDate: dateOnly,
  dueDate: dateOnly.optional().nullable(),
  category: billCategory,
  description: z.string().trim().max(5000).optional().nullable(),
  baseAmount: z.coerce.number().positive(),
  gstPercent,
}
const dateRange = z.object({
  from: dateOnly.optional(),
  to: dateOnly.optional(),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: 'The from date must be on or before the to date.',
  path: ['to'],
})

export const billIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })
export const createBillSchema = z.object(billFields).refine(
  (value) => !value.dueDate || value.dueDate >= value.billDate,
  { message: 'Due date must be on or after bill date.', path: ['dueDate'] },
)
export const updateBillSchema = z.object({ ...billFields }).omit({ projectId: true }).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one bill field is required.' },
).refine(
  (value) => !value.billDate || !value.dueDate || value.dueDate >= value.billDate,
  { message: 'Due date must be on or after bill date.', path: ['dueDate'] },
)
export const rejectBillSchema = z.object({ reason: z.string().trim().min(5).max(1000) })
export const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentDate: dateOnly,
  mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER']),
  referenceNumber: z.string().trim().max(255).optional().nullable(),
  remarks: z.string().trim().max(1000).optional().nullable(),
})
export const billListQuerySchema = dateRange.extend({
  projectId: z.coerce.number().int().positive().optional(),
  vendorId: z.coerce.number().int().positive().optional(),
  status: z.string().trim().optional(),
  category: billCategory.optional(),
  overdue: z.coerce.boolean().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
export const paymentListQuerySchema = dateRange
export const reportDateQuerySchema = dateRange
export type CreateBillInput = z.infer<typeof createBillSchema>
export type UpdateBillInput = z.infer<typeof updateBillSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type BillListQuery = z.infer<typeof billListQuerySchema>
export type DateQuery = z.infer<typeof reportDateQuerySchema>
