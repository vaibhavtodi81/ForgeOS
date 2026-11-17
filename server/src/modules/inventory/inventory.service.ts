import { Prisma, type Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { projectAccess } from '../projects/projects.service.js'
import type { CreateTransactionInput, TransactionListQuery } from './inventory.validator.js'

type Actor = { id: number; role: Role }
const dateAtUtcMidnight = (value: string) => new Date(`${value}T00:00:00.000Z`)
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10))
const decimal = (value: Prisma.Decimal | number | string | null | undefined) => Number(value ?? 0)

async function assertProject(actor: Actor, projectId: number, requireActive = false) {
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true, status: true } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  if (requireActive && project.status !== 'ACTIVE') {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Stock can only be posted to an active project.', 422)
  }
  return project
}

function transactionSnapshot(transaction: {
  id: number
  projectId: number
  materialId: number
  txnType: string
  quantity: Prisma.Decimal
  txnDate: Date
  unitRate: Prisma.Decimal | null
  outReason: string | null
  adjustmentDirection: string | null
  dailyLogId: number | null
  remarks: string | null
}) {
  return {
    id: transaction.id,
    projectId: transaction.projectId,
    materialId: transaction.materialId,
    txnType: transaction.txnType,
    quantity: transaction.quantity.toString(),
    txnDate: transaction.txnDate.toISOString().slice(0, 10),
    unitRate: transaction.unitRate?.toString() ?? null,
    outReason: transaction.outReason,
    adjustmentDirection: transaction.adjustmentDirection,
    dailyLogId: transaction.dailyLogId,
    remarks: transaction.remarks,
  } satisfies Prisma.InputJsonValue
}

async function getBalance(tx: Prisma.TransactionClient, projectId: number, materialId: number, openingQuantity: Prisma.Decimal) {
  const rows = await tx.stockTransaction.findMany({
    where: { projectId, materialId, isVoided: false },
    select: { txnType: true, quantity: true, adjustmentDirection: true },
  })
  return rows.reduce((balance, row) => {
    if (row.txnType === 'IN' || (row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'INCREASE')) return balance + decimal(row.quantity)
    return balance - decimal(row.quantity)
  }, decimal(openingQuantity))
}

export async function listInventory(actor: Actor, projectId: number) {
  await assertProject(actor, projectId)
  const plans = await prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true }, orderBy: { material: { name: 'asc' } } })
  const transactions = await prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, adjustmentDirection: true } })
  return plans.map((plan) => {
    const materialTxns = transactions.filter((item) => item.materialId === plan.materialId)
    const totalIn = materialTxns.filter((item) => item.txnType === 'IN').reduce((sum, item) => sum + decimal(item.quantity), 0)
    const totalOut = materialTxns.filter((item) => item.txnType === 'OUT').reduce((sum, item) => sum + decimal(item.quantity), 0)
    const adjustmentsIn = materialTxns.filter((item) => item.txnType === 'ADJUSTMENT' && item.adjustmentDirection === 'INCREASE').reduce((sum, item) => sum + decimal(item.quantity), 0)
    const adjustmentsOut = materialTxns.filter((item) => item.txnType === 'ADJUSTMENT' && item.adjustmentDirection === 'DECREASE').reduce((sum, item) => sum + decimal(item.quantity), 0)
    const available = decimal(plan.openingQuantity) + totalIn - totalOut + adjustmentsIn - adjustmentsOut
    return {
      materialId: plan.materialId, materialName: plan.material.name, category: plan.material.category, unit: plan.material.unit,
      openingStock: decimal(plan.openingQuantity), totalIn, totalOut, adjustmentIn: adjustmentsIn, adjustmentOut: adjustmentsOut,
      availableStock: available, plannedQuantity: decimal(plan.plannedQuantity), lowStockThreshold: decimal(plan.lowStockThreshold),
      isLowStock: plan.lowStockThreshold !== null && available <= decimal(plan.lowStockThreshold),
    }
  })
}

export async function createTransaction(actor: Actor, projectId: number, input: CreateTransactionInput) {
  await assertProject(actor, projectId, true)
  const txnDate = dateAtUtcMidnight(input.txnDate)
  if (txnDate > todayUtc()) throw new AppError('VALIDATION_ERROR', 'Transaction date cannot be in the future.', 422)

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${projectId}::int, ${input.materialId}::int)`
    const plan = await tx.projectMaterialPlan.findUnique({ where: { projectId_materialId: { projectId, materialId: input.materialId } }, include: { material: true } })
    if (!plan) throw new AppError('BUSINESS_RULE_VIOLATION', 'A project material plan is required before posting stock.', 422)
    if (!plan.material.isActive) throw new AppError('BUSINESS_RULE_VIOLATION', 'The material is inactive.', 422)
    const available = await getBalance(tx, projectId, input.materialId, plan.openingQuantity)
    const decreases = input.txnType === 'OUT' || (input.txnType === 'ADJUSTMENT' && input.adjustmentDirection === 'DECREASE')
    if (decreases && input.quantity > available) {
      throw new AppError('INSUFFICIENT_STOCK', 'Insufficient stock available.', 422, { available, requested: input.quantity })
    }
    const transaction = await tx.stockTransaction.create({
      data: {
        projectId, materialId: input.materialId, txnType: input.txnType,
        quantity: input.quantity, txnDate, unitRate: input.unitRate ?? null, vendorId: input.vendorId ?? null,
        billId: input.billId ?? null, challanNumber: input.challanNumber ?? null, outReason: input.outReason ?? null,
        adjustmentDirection: input.adjustmentDirection ?? null, dailyLogId: input.dailyLogId ?? null,
        remarks: input.remarks ?? null, createdById: actor.id,
      },
    })
    await tx.auditLog.create({
      data: { userId: actor.id, action: 'CREATE', entityType: 'StockTransaction', entityId: transaction.id, newValues: transactionSnapshot(transaction) },
    })
    return transaction
  })
}

export async function listTransactions(actor: Actor, projectId: number, query: TransactionListQuery) {
  await assertProject(actor, projectId)
  return prisma.stockTransaction.findMany({
    where: {
      projectId, ...(query.materialId ? { materialId: query.materialId } : {}),
      ...(query.txnType ? { txnType: query.txnType } : {}), ...(query.includeVoided ? {} : { isVoided: false }),
      ...(query.from || query.to ? { txnDate: { ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}), ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}) } } : {}),
    },
    include: { material: { select: { name: true, unit: true } }, createdBy: { select: { id: true, name: true } } },
    orderBy: [{ txnDate: 'desc' }, { id: 'desc' }],
  })
}

export async function getSummary(actor: Actor, projectId: number) {
  await assertProject(actor, projectId)
  const plans = await prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true } })
  const transactions = await prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, adjustmentDirection: true } })
  return plans.map((plan) => {
    const rows = transactions.filter((row) => row.materialId === plan.materialId)
    const totalIn = rows.filter((row) => row.txnType === 'IN').reduce((sum, row) => sum + decimal(row.quantity), 0)
    const totalOut = rows.filter((row) => row.txnType === 'OUT').reduce((sum, row) => sum + decimal(row.quantity), 0)
    const adjustmentIn = rows.filter((row) => row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'INCREASE').reduce((sum, row) => sum + decimal(row.quantity), 0)
    const adjustmentOut = rows.filter((row) => row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'DECREASE').reduce((sum, row) => sum + decimal(row.quantity), 0)
    return { materialId: plan.materialId, materialName: plan.material.name, unit: plan.material.unit, openingStock: decimal(plan.openingQuantity), totalReceived: totalIn, totalConsumed: totalOut, adjustmentIn, adjustmentOut, availableStock: decimal(plan.openingQuantity) + totalIn - totalOut + adjustmentIn - adjustmentOut, transactionCount: rows.length }
  })
}

export async function getWastage(actor: Actor, projectId: number) {
  await assertProject(actor, projectId)
  const [plans, latestLog, transactions] = await Promise.all([
    prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true } }),
    prisma.dailyLog.findFirst({ where: { projectId }, orderBy: { logDate: 'desc' }, select: { progressPercent: true } }),
    prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, outReason: true } }),
  ])
  const progressPercent = decimal(latestLog?.progressPercent)
  const items = plans.map((plan) => {
    const rows = transactions.filter((row) => row.materialId === plan.materialId && row.txnType === 'OUT')
    const consumed = rows.reduce((sum, row) => sum + decimal(row.quantity), 0)
    const recordedWastage = rows.filter((row) => row.outReason === 'DAMAGED' || row.outReason === 'LOST').reduce((sum, row) => sum + decimal(row.quantity), 0)
    const expected = decimal(plan.plannedQuantity) * progressPercent / 100
    const overrun = Math.max(consumed - expected, 0)
    const overrunPercent = expected > 0 ? overrun / expected * 100 : 0
    const threshold = decimal(plan.wastageThresholdPct)
    const status = progressPercent === 0 && consumed > 0 ? 'NO_BASELINE' : overrunPercent > threshold ? 'OVERRUN' : 'OK'
    return { materialId: plan.materialId, materialName: plan.material.name, unit: plan.material.unit, plannedQuantity: decimal(plan.plannedQuantity), expectedQuantity: expected, consumedQuantity: consumed, overrunQuantity: overrun, overrunPercent, thresholdPercent: threshold, recordedWastageQuantity: recordedWastage, estimatedLoss: recordedWastage * decimal(plan.plannedUnitRate), status }
  }).sort((a, b) => (a.status === b.status ? b.estimatedLoss - a.estimatedLoss : a.status === 'OVERRUN' ? -1 : b.status === 'OVERRUN' ? 1 : 0))
  return { progressPercent, items }
}
