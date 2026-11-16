import { Prisma, type Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { projectAccess } from '../projects/projects.service.js' // Imports { projectAccess } from '../projects/projects.service.js' so this module can reuse that functionality.
import type { CreateTransactionInput, TransactionListQuery } from './inventory.validator.js' // Imports type { CreateTransactionInput, TransactionListQuery } from './inventory.validator.js' so this module can reuse that functionality.

type Actor = { id: number; role: Role } // Defines the `Actor` type so TypeScript can describe the data or behavior used here.
const dateAtUtcMidnight = (value: string) => new Date(`${value}T00:00:00.000Z`) // Converts the supplied date into a JavaScript date value and stores it in `dateAtUtcMidnight` for consistent comparisons.
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10)) // Converts the supplied date into a JavaScript date value and stores it in `todayUtc` for consistent comparisons.
const decimal = (value: Prisma.Decimal | number | string | null | undefined) => Number(value ?? 0) // Stores this intermediate `decimal` value so later lines can use it.

async function assertProject(actor: Actor, projectId: number, requireActive = false) { // Defines `assertProject` to assert project, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true, status: true } }) // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
  if (requireActive && project.status !== 'ACTIVE') { // Checks whether the value is missing; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Stock can only be posted to an active project.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  return project // Returns `project` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function transactionSnapshot(transaction: { // Defines `transactionSnapshot` to transaction snapshot, keeping this behavior reusable.
  id: number // Sets `id` to the unique database identifier.
  projectId: number // Sets `projectId` to the project this record belongs to.
  materialId: number // Sets `materialId` to the material referenced by this record.
  txnType: string // Sets `txnType` to whether stock is entering, leaving, or being adjusted.
  quantity: Prisma.Decimal // Sets `quantity` to the amount of material involved.
  txnDate: Date // Sets `txnDate` to the date the stock movement occurred.
  unitRate: Prisma.Decimal | null // Sets `unitRate` to the price for one unit.
  outReason: string | null // Sets `outReason` to the out reason value.
  adjustmentDirection: string | null // Sets `adjustmentDirection` to the adjustment direction value.
  dailyLogId: number | null // Sets `dailyLogId` to the daily report associated with this entry.
  remarks: string | null // Sets `remarks` to the remarks value.
}) { // Opens the object or callback body that groups the settings for this operation.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: transaction.id, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: transaction.projectId, // Separates this argument or property from the next item in the surrounding call or object.
    materialId: transaction.materialId, // Separates this argument or property from the next item in the surrounding call or object.
    txnType: transaction.txnType, // Separates this argument or property from the next item in the surrounding call or object.
    quantity: transaction.quantity.toString(), // Separates this argument or property from the next item in the surrounding call or object.
    txnDate: transaction.txnDate.toISOString().slice(0, 10), // Separates this argument or property from the next item in the surrounding call or object.
    unitRate: transaction.unitRate?.toString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    outReason: transaction.outReason, // Separates this argument or property from the next item in the surrounding call or object.
    adjustmentDirection: transaction.adjustmentDirection, // Separates this argument or property from the next item in the surrounding call or object.
    dailyLogId: transaction.dailyLogId, // Separates this argument or property from the next item in the surrounding call or object.
    remarks: transaction.remarks, // Separates this argument or property from the next item in the surrounding call or object.
  } satisfies Prisma.InputJsonValue // Provides `} satisfies Prisma.InputJsonValue` as part of transaction snapshot.
} // Closes the current block and marks where its grouped work ends.

async function getBalance(tx: Prisma.TransactionClient, projectId: number, materialId: number, openingQuantity: Prisma.Decimal) { // Defines `getBalance` to retrieve balance, keeping this behavior reusable.
  const rows = await tx.stockTransaction.findMany({ // Stores this intermediate `rows` value so later lines can use it.
    where: { projectId, materialId, isVoided: false }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { txnType: true, quantity: true, adjustmentDirection: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  return rows.reduce((balance, row) => { // Opens the function, callback, or control-flow block that groups the related statements.
    if (row.txnType === 'IN' || (row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'INCREASE')) return balance + decimal(row.quantity) // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    return balance - decimal(row.quantity) // Returns `balance - decimal(row.quantity)` to the caller so the next layer can use the result.
  }, decimal(openingQuantity)) // Provides `}, decimal(openingQuantity))` as part of get balance.
} // Closes the current block and marks where its grouped work ends.

export async function listInventory(actor: Actor, projectId: number) { // Defines `listInventory` to retrieve a list of inventory, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const plans = await prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true }, orderBy: { material: { name: 'asc' } } }) // Fetches matching database records and stores them in `plans` for the response or next calculation.
  const transactions = await prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, adjustmentDirection: true } }) // Fetches matching database records and stores them in `transactions` for the response or next calculation.
  return plans.map((plan) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const materialTxns = transactions.filter((item) => item.materialId === plan.materialId) // Stores this intermediate `material txns` value so later lines can use it.
    const totalIn = materialTxns.filter((item) => item.txnType === 'IN').reduce((sum, item) => sum + decimal(item.quantity), 0) // Totals the matching values and stores the result in `totalIn`.
    const totalOut = materialTxns.filter((item) => item.txnType === 'OUT').reduce((sum, item) => sum + decimal(item.quantity), 0) // Totals the matching values and stores the result in `totalOut`.
    const adjustmentsIn = materialTxns.filter((item) => item.txnType === 'ADJUSTMENT' && item.adjustmentDirection === 'INCREASE').reduce((sum, item) => sum + decimal(item.quantity), 0) // Totals the matching values and stores the result in `adjustmentsIn`.
    const adjustmentsOut = materialTxns.filter((item) => item.txnType === 'ADJUSTMENT' && item.adjustmentDirection === 'DECREASE').reduce((sum, item) => sum + decimal(item.quantity), 0) // Totals the matching values and stores the result in `adjustmentsOut`.
    const available = decimal(plan.openingQuantity) + totalIn - totalOut + adjustmentsIn - adjustmentsOut // Stores this intermediate `available` value so later lines can use it.
    return { // Returns the assembled result object so the caller receives the fields it needs.
      materialId: plan.materialId, materialName: plan.material.name, category: plan.material.category, unit: plan.material.unit, // Separates this argument or property from the next item in the surrounding call or object.
      openingStock: decimal(plan.openingQuantity), totalIn, totalOut, adjustmentIn: adjustmentsIn, adjustmentOut: adjustmentsOut, // Separates this argument or property from the next item in the surrounding call or object.
      availableStock: available, plannedQuantity: decimal(plan.plannedQuantity), lowStockThreshold: decimal(plan.lowStockThreshold), // Separates this argument or property from the next item in the surrounding call or object.
      isLowStock: plan.lowStockThreshold !== null && available <= decimal(plan.lowStockThreshold), // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function createTransaction(actor: Actor, projectId: number, input: CreateTransactionInput) { // Defines `createTransaction` to create transaction, keeping this behavior reusable.
  await assertProject(actor, projectId, true) // Waits for this asynchronous operation to finish before using its result.
  const txnDate = dateAtUtcMidnight(input.txnDate) // Stores this intermediate `txn date` value so later lines can use it.
  if (txnDate > todayUtc()) throw new AppError('VALIDATION_ERROR', 'Transaction date cannot be in the future.', 422) // Checks whether the supplied values meet this condition; the block handles that case before continuing.

  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    // Serialize balance-checking writes for this project/material pair to prevent concurrent overspending.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${projectId}::int, ${input.materialId}::int)` // Waits for this asynchronous operation to finish before using its result.
    const plan = await tx.projectMaterialPlan.findUnique({ where: { projectId_materialId: { projectId, materialId: input.materialId } }, include: { material: true } }) // Stores this intermediate `plan` value so later lines can use it.
    if (!plan) throw new AppError('BUSINESS_RULE_VIOLATION', 'A project material plan is required before posting stock.', 422) // Checks whether the value is missing; the block handles that case before continuing.
    if (!plan.material.isActive) throw new AppError('BUSINESS_RULE_VIOLATION', 'The material is inactive.', 422) // Rejects an inactive account so deactivated users cannot continue using the API.
    const available = await getBalance(tx, projectId, input.materialId, plan.openingQuantity) // Stores this intermediate `available` value so later lines can use it.
    const decreases = input.txnType === 'OUT' || (input.txnType === 'ADJUSTMENT' && input.adjustmentDirection === 'DECREASE') // Stores this intermediate `decreases` value so later lines can use it.
    if (decreases && input.quantity > available) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      throw new AppError('INSUFFICIENT_STOCK', 'Insufficient stock available.', 422, { available, requested: input.quantity }) // Stops this operation with the error `INSUFFICIENT_STOCK`, so the API reports the failure clearly.
    } // Closes the current block and marks where its grouped work ends.
    const transaction = await tx.stockTransaction.create({ // Stores this intermediate `transaction` value so later lines can use it.
      data: { // Sets `data` to the values to write to the database.
        projectId, materialId: input.materialId, txnType: input.txnType, // Separates this argument or property from the next item in the surrounding call or object.
        quantity: input.quantity, txnDate, unitRate: input.unitRate ?? null, vendorId: input.vendorId ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        billId: input.billId ?? null, challanNumber: input.challanNumber ?? null, outReason: input.outReason ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        adjustmentDirection: input.adjustmentDirection ?? null, dailyLogId: input.dailyLogId ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        remarks: input.remarks ?? null, createdById: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { userId: actor.id, action: 'CREATE', entityType: 'StockTransaction', entityId: transaction.id, newValues: transactionSnapshot(transaction) }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return transaction // Returns `transaction` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function listTransactions(actor: Actor, projectId: number, query: TransactionListQuery) { // Defines `listTransactions` to retrieve a list of transactions, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  return prisma.stockTransaction.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { // Sets `where` to filters the database records to the requested scope.
      projectId, ...(query.materialId ? { materialId: query.materialId } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      ...(query.txnType ? { txnType: query.txnType } : {}), ...(query.includeVoided ? {} : { isVoided: false }), // Separates this argument or property from the next item in the surrounding call or object.
      ...(query.from || query.to ? { txnDate: { ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}), ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}) } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    include: { material: { select: { name: true, unit: true } }, createdBy: { select: { id: true, name: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: [{ txnDate: 'desc' }, { id: 'desc' }], // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getSummary(actor: Actor, projectId: number) { // Defines `getSummary` to retrieve summary, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const plans = await prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true } }) // Fetches matching database records and stores them in `plans` for the response or next calculation.
  const transactions = await prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, adjustmentDirection: true } }) // Fetches matching database records and stores them in `transactions` for the response or next calculation.
  return plans.map((plan) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const rows = transactions.filter((row) => row.materialId === plan.materialId) // Stores this intermediate `rows` value so later lines can use it.
    const totalIn = rows.filter((row) => row.txnType === 'IN').reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `totalIn`.
    const totalOut = rows.filter((row) => row.txnType === 'OUT').reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `totalOut`.
    const adjustmentIn = rows.filter((row) => row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'INCREASE').reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `adjustmentIn`.
    const adjustmentOut = rows.filter((row) => row.txnType === 'ADJUSTMENT' && row.adjustmentDirection === 'DECREASE').reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `adjustmentOut`.
    return { materialId: plan.materialId, materialName: plan.material.name, unit: plan.material.unit, openingStock: decimal(plan.openingQuantity), totalReceived: totalIn, totalConsumed: totalOut, adjustmentIn, adjustmentOut, availableStock: decimal(plan.openingQuantity) + totalIn - totalOut + adjustmentIn - adjustmentOut, transactionCount: rows.length } // Returns the requested data together with pagination or summary metadata for the client.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getWastage(actor: Actor, projectId: number) { // Defines `getWastage` to retrieve wastage, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const [plans, latestLog, transactions] = await Promise.all([ // Stores this intermediate `transactions` value so later lines can use it.
    prisma.projectMaterialPlan.findMany({ where: { projectId }, include: { material: true } }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.dailyLog.findFirst({ where: { projectId }, orderBy: { logDate: 'desc' }, select: { progressPercent: true } }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.stockTransaction.findMany({ where: { projectId, isVoided: false }, select: { materialId: true, txnType: true, quantity: true, outReason: true } }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  const progressPercent = decimal(latestLog?.progressPercent) // Stores this intermediate `progress percent` value so later lines can use it.
  const items = plans.map((plan) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const rows = transactions.filter((row) => row.materialId === plan.materialId && row.txnType === 'OUT') // Stores this intermediate `rows` value so later lines can use it.
    const consumed = rows.reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `consumed`.
    const recordedWastage = rows.filter((row) => row.outReason === 'DAMAGED' || row.outReason === 'LOST').reduce((sum, row) => sum + decimal(row.quantity), 0) // Totals the matching values and stores the result in `recordedWastage`.
    // Compare consumption with the portion of the plan expected at the latest project progress.
    const expected = decimal(plan.plannedQuantity) * progressPercent / 100 // Stores this intermediate `expected` value so later lines can use it.
    const overrun = Math.max(consumed - expected, 0) // Stores this intermediate `overrun` value so later lines can use it.
    const overrunPercent = expected > 0 ? overrun / expected * 100 : 0 // Stores this intermediate `overrun percent` value so later lines can use it.
    const threshold = decimal(plan.wastageThresholdPct) // Stores this intermediate `threshold` value so later lines can use it.
    const status = progressPercent === 0 && consumed > 0 ? 'NO_BASELINE' : overrunPercent > threshold ? 'OVERRUN' : 'OK' // Stores this intermediate `status` value so later lines can use it.
    return { materialId: plan.materialId, materialName: plan.material.name, unit: plan.material.unit, plannedQuantity: decimal(plan.plannedQuantity), expectedQuantity: expected, consumedQuantity: consumed, overrunQuantity: overrun, overrunPercent, thresholdPercent: threshold, recordedWastageQuantity: recordedWastage, estimatedLoss: recordedWastage * decimal(plan.plannedUnitRate), status } // Returns the assembled result object so the caller receives the fields it needs.
  }).sort((a, b) => (a.status === b.status ? b.estimatedLoss - a.estimatedLoss : a.status === 'OVERRUN' ? -1 : b.status === 'OVERRUN' ? 1 : 0)) // Provides `}).sort((a, b) => (a.status === b.status ? b.estimatedLoss - a.estimatedLoss : a.status === 'OVERRUN' ? -1 : b.status === 'OVERRUN' ? 1 : 0))` as part of get wastage.
  return { progressPercent, items } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements inventory business rules and database operations.
