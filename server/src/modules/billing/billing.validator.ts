import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format') // Stores this intermediate `date only` value so later lines can use it.
const billCategory = z.enum(['MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER']) // Stores this intermediate `bill category` value so later lines can use it.
const gstPercent = z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]) // Stores this intermediate `gst percent` value so later lines can use it.
const billFields = { // Stores this intermediate `bill fields` value so later lines can use it.
  projectId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  vendorId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  billNumber: z.string().trim().min(1).max(100), // Separates this argument or property from the next item in the surrounding call or object.
  billDate: dateOnly, // Separates this argument or property from the next item in the surrounding call or object.
  dueDate: dateOnly.optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  category: billCategory, // Separates this argument or property from the next item in the surrounding call or object.
  description: z.string().trim().max(5000).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  baseAmount: z.coerce.number().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  gstPercent, // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.
const dateRange = z.object({ // Stores this intermediate `date range` value so later lines can use it.
  from: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  to: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
}).refine((value) => !value.from || !value.to || value.from <= value.to, { // Opens the object or callback body that groups the settings for this operation.
  message: 'The from date must be on or before the to date.', // Separates this argument or property from the next item in the surrounding call or object.
  path: ['to'], // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

export const billIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }) // Provides `export const billIdParamsSchema = z.object({ id: z.coerce.number().int().positive() })` as part of this server module.
export const createBillSchema = z.object(billFields).refine( // Provides `export const createBillSchema = z.object(billFields).refine(` as part of this server module.
  (value) => !value.dueDate || value.dueDate >= value.billDate, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'Due date must be on or after bill date.', path: ['dueDate'] }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const updateBillSchema = z.object({ ...billFields }).omit({ projectId: true }).partial().refine( // Provides `export const updateBillSchema = z.object({ ...billFields }).omit({ projectId: true }).partial().refine(` as part of this server module.
  (value) => Object.keys(value).length > 0, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'At least one bill field is required.' }, // Separates this argument or property from the next item in the surrounding call or object.
).refine( // Provides `).refine(` as part of this server module.
  (value) => !value.billDate || !value.dueDate || value.dueDate >= value.billDate, // Separates this argument or property from the next item in the surrounding call or object.
  { message: 'Due date must be on or after bill date.', path: ['dueDate'] }, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const rejectBillSchema = z.object({ reason: z.string().trim().min(5).max(1000) }) // Provides `export const rejectBillSchema = z.object({ reason: z.string().trim().min(5).max(1000) })` as part of this server module.
export const paymentSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  amount: z.coerce.number().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  paymentDate: dateOnly, // Separates this argument or property from the next item in the surrounding call or object.
  mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER']), // Separates this argument or property from the next item in the surrounding call or object.
  referenceNumber: z.string().trim().max(255).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
  remarks: z.string().trim().max(1000).optional().nullable(), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const billListQuerySchema = dateRange.extend({ // Opens the object or callback body that groups the settings for this operation.
  projectId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  vendorId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  status: z.string().trim().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  category: billCategory.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  overdue: z.coerce.boolean().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  search: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  page: z.coerce.number().int().min(1).default(1), // Separates this argument or property from the next item in the surrounding call or object.
  pageSize: z.coerce.number().int().min(1).max(100).default(20), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const paymentListQuerySchema = dateRange // Provides `export const paymentListQuerySchema = dateRange` as part of this server module.
export const reportDateQuerySchema = dateRange // Provides `export const reportDateQuerySchema = dateRange` as part of this server module.
export type CreateBillInput = z.infer<typeof createBillSchema> // Defines the `CreateBillInput` type so TypeScript can describe the data or behavior used here.
export type UpdateBillInput = z.infer<typeof updateBillSchema> // Defines the `UpdateBillInput` type so TypeScript can describe the data or behavior used here.
export type PaymentInput = z.infer<typeof paymentSchema> // Defines the `PaymentInput` type so TypeScript can describe the data or behavior used here.
export type BillListQuery = z.infer<typeof billListQuerySchema> // Defines the `BillListQuery` type so TypeScript can describe the data or behavior used here.
export type DateQuery = z.infer<typeof reportDateQuerySchema> // Defines the `DateQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the billing API.
