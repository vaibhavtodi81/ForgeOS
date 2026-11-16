import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format') // Stores this intermediate `date only` value so later lines can use it.
const transactionType = z.enum(['IN', 'OUT', 'ADJUSTMENT']) // Stores this intermediate `transaction type` value so later lines can use it.
const baseTransaction = { // Stores this intermediate `base transaction` value so later lines can use it.
  materialId: z.coerce.number().int().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  txnType: transactionType, // Separates this argument or property from the next item in the surrounding call or object.
  quantity: z.coerce.number().positive(), // Separates this argument or property from the next item in the surrounding call or object.
  txnDate: dateOnly, // Separates this argument or property from the next item in the surrounding call or object.
  unitRate: z.coerce.number().nonnegative().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  vendorId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  billId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  challanNumber: z.string().trim().max(100).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  outReason: z.enum(['USED', 'DAMAGED', 'LOST']).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  adjustmentDirection: z.enum(['INCREASE', 'DECREASE']).optional(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  remarks: z.string().trim().max(1000).optional(), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

export const projectInventoryParamsSchema = z.object({ projectId: z.coerce.number().int().positive() }) // Provides `export const projectInventoryParamsSchema = z.object({ projectId: z.coerce.number().int().positive() })` as part of this server module.
export const createTransactionSchema = z.object(baseTransaction).superRefine((value, context) => { // Opens the function, callback, or control-flow block that groups the related statements.
  if (value.txnType === 'IN' && (value.outReason || value.adjustmentDirection)) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    context.addIssue({ code: 'custom', path: ['outReason'], message: 'IN transactions cannot include OUT or adjustment fields.' }) // Provides `context.addIssue({ code: 'custom', path: ['outReason'], message: 'IN transactions cannot include OUT or adjustment fields.' })` as part of this server module.
  } // Closes the current block and marks where its grouped work ends.
  if (value.txnType === 'OUT' && (!value.outReason || value.vendorId || value.billId || value.unitRate || value.adjustmentDirection)) { // Checks whether the value is missing; the block handles that case before continuing.
    context.addIssue({ code: 'custom', path: ['outReason'], message: 'OUT requires outReason and cannot include IN or adjustment fields.' }) // Provides `context.addIssue({ code: 'custom', path: ['outReason'], message: 'OUT requires outReason and cannot include IN or adjustment fields.' })` as part of this server module.
  } // Closes the current block and marks where its grouped work ends.
  if (value.txnType === 'ADJUSTMENT' && (!value.adjustmentDirection || value.outReason || value.vendorId || value.billId || value.unitRate)) { // Checks whether the value is missing; the block handles that case before continuing.
    context.addIssue({ code: 'custom', path: ['adjustmentDirection'], message: 'ADJUSTMENT requires adjustmentDirection and cannot include IN or OUT fields.' }) // Provides `context.addIssue({ code: 'custom', path: ['adjustmentDirection'], message: 'ADJUSTMENT requires adjustmentDirection and cannot include IN or OUT fields.' })` as part of this server module.
  } // Closes the current block and marks where its grouped work ends.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const transactionListQuerySchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  materialId: z.coerce.number().int().positive().optional(), // Separates this argument or property from the next item in the surrounding call or object.
  txnType: transactionType.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  from: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  to: dateOnly.optional(), // Separates this argument or property from the next item in the surrounding call or object.
  includeVoided: z.coerce.boolean().default(false), // Separates this argument or property from the next item in the surrounding call or object.
}).refine((value) => !value.from || !value.to || value.from <= value.to, { // Opens the object or callback body that groups the settings for this operation.
  message: 'The from date must be on or before the to date.', // Separates this argument or property from the next item in the surrounding call or object.
  path: ['to'], // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
export const wastageQuerySchema = z.object({}).strict() // Provides `export const wastageQuerySchema = z.object({}).strict()` as part of this server module.
export type CreateTransactionInput = z.infer<typeof createTransactionSchema> // Defines the `CreateTransactionInput` type so TypeScript can describe the data or behavior used here.
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema> // Defines the `TransactionListQuery` type so TypeScript can describe the data or behavior used here.
// File purpose: Defines runtime request validation schemas for the inventory API.
