import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD format')
const transactionType = z.enum(['IN', 'OUT', 'ADJUSTMENT'])
const baseTransaction = {
  materialId: z.coerce.number().int().positive(),
  txnType: transactionType,
  quantity: z.coerce.number().positive(),
  txnDate: dateOnly,
  unitRate: z.coerce.number().nonnegative().optional(),
  vendorId: z.coerce.number().int().positive().optional(),
  billId: z.coerce.number().int().positive().optional(),
  challanNumber: z.string().trim().max(100).optional(),
  outReason: z.enum(['USED', 'DAMAGED', 'LOST']).optional(),
  adjustmentDirection: z.enum(['INCREASE', 'DECREASE']).optional(),
  dailyLogId: z.coerce.number().int().positive().optional(),
  remarks: z.string().trim().max(1000).optional(),
}

export const projectInventoryParamsSchema = z.object({ projectId: z.coerce.number().int().positive() })
export const createTransactionSchema = z.object(baseTransaction).superRefine((value, context) => {
  if (value.txnType === 'IN' && (value.outReason || value.adjustmentDirection)) {
    context.addIssue({ code: 'custom', path: ['outReason'], message: 'IN transactions cannot include OUT or adjustment fields.' })
  }
  if (value.txnType === 'OUT' && (!value.outReason || value.vendorId || value.billId || value.unitRate || value.adjustmentDirection)) {
    context.addIssue({ code: 'custom', path: ['outReason'], message: 'OUT requires outReason and cannot include IN or adjustment fields.' })
  }
  if (value.txnType === 'ADJUSTMENT' && (!value.adjustmentDirection || value.outReason || value.vendorId || value.billId || value.unitRate)) {
    context.addIssue({ code: 'custom', path: ['adjustmentDirection'], message: 'ADJUSTMENT requires adjustmentDirection and cannot include IN or OUT fields.' })
  }
})
export const transactionListQuerySchema = z.object({
  materialId: z.coerce.number().int().positive().optional(),
  txnType: transactionType.optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  includeVoided: z.coerce.boolean().default(false),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: 'The from date must be on or before the to date.',
  path: ['to'],
})
export const wastageQuerySchema = z.object({}).strict()
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
