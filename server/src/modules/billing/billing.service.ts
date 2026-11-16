import { Prisma, type BillCategory, type BillStatus, type PaymentMode, type Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { projectAccess, type ProjectActor } from '../projects/projects.service.js' // Imports { projectAccess, type ProjectActor } from '../projects/projects.service.js' so this module can reuse that functionality.
import type { BillListQuery, CreateBillInput, DateQuery, PaymentInput, UpdateBillInput } from './billing.validator.js' // Imports type { BillListQuery, CreateBillInput, DateQuery, PaymentInput, UpdateBillInput } from './billing.validator.js' so this module can reuse that functionality.

type Actor = ProjectActor // Defines the `Actor` type so TypeScript can describe the data or behavior used here.
const day = (value: string) => new Date(`${value}T00:00:00.000Z`) // Converts the supplied date into a JavaScript date value and stores it in `day` for consistent comparisons.
const today = () => new Date(new Date().toISOString().slice(0, 10)) // Converts the supplied date into a JavaScript date value and stores it in `today` for consistent comparisons.
const n = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0) // Stores this intermediate `n` value so later lines can use it.
// Round computed bill amounts to cents before storing or returning them.
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100 // Stores this intermediate `money` value so later lines can use it.

function jsonSnapshot(value: { // Defines `jsonSnapshot` to json snapshot, keeping this behavior reusable.
  id: number // Sets `id` to the unique database identifier.
  projectId: number // Sets `projectId` to the project this record belongs to.
  vendorId: number // Sets `vendorId` to the supplier or contractor linked to this record.
  billNumber: string // Sets `billNumber` to the vendor's invoice reference.
  billDate: Date // Sets `billDate` to the date on the vendor's bill.
  dueDate: Date | null // Sets `dueDate` to when payment is due.
  category: string // Sets `category` to the business category used to classify this record.
  description: string | null // Sets `description` to optional details for readers.
  baseAmount: Prisma.Decimal // Sets `baseAmount` to the bill amount before tax.
  gstPercent: Prisma.Decimal // Sets `gstPercent` to the tax rate applied to the bill.
  gstAmount: Prisma.Decimal // Sets `gstAmount` to the calculated tax amount.
  totalAmount: Prisma.Decimal // Sets `totalAmount` to the full amount including tax.
  status: string // Sets `status` to the record's current workflow state.
  submittedById: number // Sets `submittedById` to the user who submitted the bill.
  approvedById: number | null // Sets `approvedById` to the user who approved the bill.
  approvedAt: Date | null // Sets `approvedAt` to the approved at value.
  rejectionReason: string | null // Sets `rejectionReason` to the rejection reason value.
}): Prisma.InputJsonValue { // Opens the object or callback body that groups the settings for this operation.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: value.id, projectId: value.projectId, vendorId: value.vendorId, billNumber: value.billNumber, // Separates this argument or property from the next item in the surrounding call or object.
    billDate: value.billDate.toISOString().slice(0, 10), dueDate: value.dueDate?.toISOString().slice(0, 10) ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    category: value.category, description: value.description, baseAmount: value.baseAmount.toString(), // Separates this argument or property from the next item in the surrounding call or object.
    gstPercent: value.gstPercent.toString(), gstAmount: value.gstAmount.toString(), totalAmount: value.totalAmount.toString(), // Separates this argument or property from the next item in the surrounding call or object.
    status: value.status, submittedById: value.submittedById, approvedById: value.approvedById, // Separates this argument or property from the next item in the surrounding call or object.
    approvedAt: value.approvedAt?.toISOString() ?? null, rejectionReason: value.rejectionReason, // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

async function assertProject(actor: Actor, projectId: number, allowCompleted = false) { // Defines `assertProject` to assert project, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true, status: true } }) // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
  if (!allowCompleted && project.status === 'COMPLETED') throw new AppError('BUSINESS_RULE_VIOLATION', 'Completed projects cannot receive new bills.', 422) // Checks whether the value is missing; the block handles that case before continuing.
  return project // Returns `project` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function getBill(actor: Actor, id: number) { // Defines `getBill` to retrieve bill, keeping this behavior reusable.
  const bill = await prisma.bill.findUnique({ // Looks up one matching database record and stores it in `bill` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { // Sets `include` to loads related records needed alongside the main result.
      vendor: true, // Separates this argument or property from the next item in the surrounding call or object.
      project: { select: { id: true, code: true, name: true, assignedPmId: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      submittedBy: { select: { id: true, name: true, email: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      approvedBy: { select: { id: true, name: true, email: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      payments: { include: { recordedBy: { select: { id: true, name: true } } }, orderBy: { paymentDate: 'asc' } }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!bill || (actor.role === 'PM' && bill.project.assignedPmId !== actor.id)) throw new AppError('NOT_FOUND', 'Bill not found.', 404) // Checks the caller's role before allowing this role-restricted operation.
  const paidAmount = bill.payments.reduce((sum, payment) => sum + n(payment.amount), 0) // Totals the matching values and stores the result in `paidAmount`.
  return { ...bill, paidAmount: money(paidAmount), outstandingAmount: money(n(bill.totalAmount) - paidAmount) } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

function outputBill<T extends { totalAmount: Prisma.Decimal; payments?: Array<{ amount: Prisma.Decimal }> }>(bill: T) { // Defines `outputBill` to output bill, keeping this behavior reusable.
  const paidAmount = bill.payments?.reduce((sum, payment) => sum + n(payment.amount), 0) ?? 0 // Totals the matching values and stores the result in `paidAmount`.
  return { ...bill, paidAmount: money(paidAmount), outstandingAmount: money(n(bill.totalAmount) - paidAmount) } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

export async function createBill(actor: Actor, input: CreateBillInput) { // Defines `createBill` to create bill, keeping this behavior reusable.
  await assertProject(actor, input.projectId) // Waits for this asynchronous operation to finish before using its result.
  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId }, select: { id: true, isActive: true } }) // Looks up one matching database record and stores it in `vendor` so its existence or values can be checked.
  if (!vendor || !vendor.isActive) throw new AppError('NOT_FOUND', 'Active vendor not found.', 404) // Rejects an inactive account so deactivated users cannot continue using the API.
  const billDate = day(input.billDate) // Stores this intermediate `bill date` value so later lines can use it.
  const dueDate = input.dueDate ? day(input.dueDate) : null // Stores this intermediate `due date` value so later lines can use it.
  const gstAmount = money(input.baseAmount * input.gstPercent / 100) // Stores this intermediate `gst amount` value so later lines can use it.
  const totalAmount = money(input.baseAmount + gstAmount) // Stores this intermediate `total amount` value so later lines can use it.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    // Save the bill and its audit record together so a partial write cannot go unnoticed.
    const bill = await tx.bill.create({ // Stores this intermediate `bill` value so later lines can use it.
      data: { // Sets `data` to the values to write to the database.
        projectId: input.projectId, vendorId: input.vendorId, billNumber: input.billNumber, // Separates this argument or property from the next item in the surrounding call or object.
        billDate, dueDate, category: input.category as BillCategory, description: input.description ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        baseAmount: input.baseAmount, gstPercent: input.gstPercent, gstAmount, totalAmount, submittedById: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
      include: { payments: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'CREATE', entityType: 'Bill', entityId: bill.id, newValues: jsonSnapshot(bill) } }) // Waits for this asynchronous operation to finish before using its result.
    return outputBill(bill) // Returns `outputBill(bill)` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function listBills(actor: Actor, query: BillListQuery) { // Defines `listBills` to retrieve a list of bills, keeping this behavior reusable.
  const statuses = query.status?.split(',').filter(Boolean) as BillStatus[] | undefined // Stores this intermediate `statuses` value so later lines can use it.
  const where: Prisma.BillWhereInput = { // Stores this intermediate `prisma.bill where input` value so later lines can use it.
    ...(query.projectId ? { projectId: query.projectId } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.vendorId ? { vendorId: query.vendorId } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(statuses?.length ? { status: { in: statuses } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.category ? { category: query.category } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.search ? { OR: [ // Provides `...(query.search ? { OR: [` as part of list bills.
      { billNumber: { contains: query.search, mode: 'insensitive' } }, // Separates this argument or property from the next item in the surrounding call or object.
      { vendor: { name: { contains: query.search, mode: 'insensitive' } } }, // Separates this argument or property from the next item in the surrounding call or object.
    ] } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(actor.role === 'PM' ? { project: { assignedPmId: actor.id } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  if (query.overdue) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    where.dueDate = { lt: today() } // Provides `where.dueDate = { lt: today() }` as part of list bills.
    where.status = { in: ['APPROVED', 'PARTIALLY_PAID'] } // Provides `where.status = { in: ['APPROVED', 'PARTIALLY_PAID'] }` as part of list bills.
  } // Closes the current block and marks where its grouped work ends.
  const [bills, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `bills,total`.
    prisma.bill.findMany({ // Opens the object or callback body that groups the settings for this operation.
      where, orderBy: [{ billDate: 'desc' }, { id: 'desc' }], // Separates this argument or property from the next item in the surrounding call or object.
      skip: (query.page - 1) * query.pageSize, take: query.pageSize, // Separates this argument or property from the next item in the surrounding call or object.
      include: { vendor: true, project: { select: { id: true, code: true, name: true } }, payments: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.bill.count({ where }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  const rows = bills.map(outputBill) // Transforms the matching items into `rows`, the shape needed by the caller.
  const totals = rows.reduce((acc, bill) => ({ // Totals the matching values and stores the result in `totals`.
    totalAmount: acc.totalAmount + n(bill.totalAmount), // Separates this argument or property from the next item in the surrounding call or object.
    paidAmount: acc.paidAmount + bill.paidAmount, // Separates this argument or property from the next item in the surrounding call or object.
    outstandingAmount: acc.outstandingAmount + bill.outstandingAmount, // Separates this argument or property from the next item in the surrounding call or object.
  }), { totalAmount: 0, paidAmount: 0, outstandingAmount: 0 }) // Provides `}), { totalAmount: 0, paidAmount: 0, outstandingAmount: 0 })` as part of list bills.
  return { bills: rows, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize), totals: { totalAmount: money(totals.totalAmount), paidAmount: money(totals.paidAmount), outstandingAmount: money(totals.outstandingAmount) } } } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

export async function detail(actor: Actor, id: number) { // Defines `detail` to detail, keeping this behavior reusable.
  return getBill(actor, id) // Returns `getBill(actor, id)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function updateBill(actor: Actor, id: number, input: UpdateBillInput) { // Defines `updateBill` to update bill, keeping this behavior reusable.
  const existing = await getBill(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  if (!['PENDING', 'REJECTED'].includes(existing.status)) throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending or rejected bills can be edited.', 422) // Checks whether the value is missing; the block handles that case before continuing.
  if (actor.role === 'PM' && existing.submittedById !== actor.id) throw new AppError('NOT_FOUND', 'Bill not found.', 404) // Checks the caller's role before allowing this role-restricted operation.
  if (input.vendorId !== undefined) { // Checks whether the caller supplied this optional value before validating or applying it.
    const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId }, select: { id: true, isActive: true } }) // Looks up one matching database record and stores it in `vendor` so its existence or values can be checked.
    if (!vendor || !vendor.isActive) throw new AppError('NOT_FOUND', 'Active vendor not found.', 404) // Rejects an inactive account so deactivated users cannot continue using the API.
  } // Closes the current block and marks where its grouped work ends.
  const baseAmount = input.baseAmount ?? n(existing.baseAmount) // Stores this intermediate `base amount` value so later lines can use it.
  const gstPercent = input.gstPercent ?? n(existing.gstPercent) // Stores this intermediate `gst percent` value so later lines can use it.
  const billDate = input.billDate === undefined ? existing.billDate : day(input.billDate) // Stores this intermediate `bill date` value so later lines can use it.
  const dueDate = input.dueDate === undefined ? existing.dueDate : input.dueDate ? day(input.dueDate) : null // Stores this intermediate `due date` value so later lines can use it.
  if (dueDate && dueDate < billDate) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('VALIDATION_ERROR', 'Due date must be on or after bill date.', 400) // Stops this request with `VALIDATION_ERROR` and HTTP 400 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  const data = { // Stores this intermediate `data` value so later lines can use it.
    ...(input.vendorId === undefined ? {} : { vendorId: input.vendorId }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.billNumber === undefined ? {} : { billNumber: input.billNumber }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.billDate === undefined ? {} : { billDate }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.dueDate === undefined ? {} : { dueDate }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.category === undefined ? {} : { category: input.category as BillCategory }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.description === undefined ? {} : { description: input.description }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.baseAmount === undefined ? {} : { baseAmount }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(input.gstPercent === undefined ? {} : { gstPercent }), // Separates this argument or property from the next item in the surrounding call or object.
    gstAmount: money(baseAmount * gstPercent / 100), // Separates this argument or property from the next item in the surrounding call or object.
    totalAmount: money(baseAmount + money(baseAmount * gstPercent / 100)), // Separates this argument or property from the next item in the surrounding call or object.
    ...(existing.status === 'REJECTED' ? { status: 'PENDING' as const, rejectionReason: null } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const updated = await prisma.$transaction(async (tx) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const bill = await tx.bill.update({ where: { id }, data, include: { payments: true } }) // Stores this intermediate `bill` value so later lines can use it.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } }) // Waits for this asynchronous operation to finish before using its result.
    return bill // Returns `bill` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  return outputBill(updated) // Returns `outputBill(updated)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function deleteBill(actor: Actor, id: number) { // Defines `deleteBill` to delete bill, keeping this behavior reusable.
  const existing = await getBill(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  if (existing.status !== 'PENDING' || existing.payments.length > 0) throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills without payments can be deleted.', 422) // Checks whether the collection contains any items that need special handling.
  if (actor.role === 'PM' && existing.submittedById !== actor.id) throw new AppError('NOT_FOUND', 'Bill not found.', 404) // Checks the caller's role before allowing this role-restricted operation.
  await prisma.$transaction(async (tx) => { // Opens the function, callback, or control-flow block that groups the related statements.
    await tx.bill.delete({ where: { id } }) // Waits for this asynchronous operation to finish before using its result.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'DELETE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing) } }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function approveBill(actor: Actor, id: number) { // Defines `approveBill` to approve bill, keeping this behavior reusable.
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can approve bills.', 403) // Checks the caller's role before allowing this role-restricted operation.
  const existing = await getBill(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  if (existing.status !== 'PENDING') throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills can be approved.', 422) // Checks whether the value is missing; the block handles that case before continuing.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const bill = await tx.bill.update({ where: { id }, data: { status: 'APPROVED', approvedById: actor.id, approvedAt: new Date() }, include: { payments: true } }) // Converts the supplied date into a JavaScript date value and stores it in `bill` for consistent comparisons.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'APPROVE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } }) // Waits for this asynchronous operation to finish before using its result.
    return outputBill(bill) // Returns `outputBill(bill)` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function rejectBill(actor: Actor, id: number, reason: string) { // Defines `rejectBill` to reject bill, keeping this behavior reusable.
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can reject bills.', 403) // Checks the caller's role before allowing this role-restricted operation.
  const existing = await getBill(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  if (existing.status !== 'PENDING') throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills can be rejected.', 422) // Checks whether the value is missing; the block handles that case before continuing.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const bill = await tx.bill.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason }, include: { payments: true } }) // Stores this intermediate `bill` value so later lines can use it.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'REJECT', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } }) // Waits for this asynchronous operation to finish before using its result.
    return outputBill(bill) // Returns `outputBill(bill)` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function listPayments(actor: Actor, id: number, query: DateQuery) { // Defines `listPayments` to retrieve a list of payments, keeping this behavior reusable.
  const bill = await getBill(actor, id) // Stores this intermediate `bill` value so later lines can use it.
  return bill.payments.filter((payment) => (!query.from || payment.paymentDate >= day(query.from)) && (!query.to || payment.paymentDate <= day(query.to))) // Returns `bill.payments.filter((payment) => (!query.from || payment.paymentDate >= day(query.from)) && (!query.to || payment.paymentDate <= day(query.to)))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createPayment(actor: Actor, id: number, input: PaymentInput) { // Defines `createPayment` to create payment, keeping this behavior reusable.
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can record payments.', 403) // Checks the caller's role before allowing this role-restricted operation.
  const existing = await getBill(actor, id)
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${id}::int)` // Waits for this asynchronous operation to finish before using its result.
    const current = await tx.bill.findUnique({ where: { id }, include: { payments: true } }) // Stores this intermediate `current` value so later lines can use it.
    if (!current || !['APPROVED', 'PARTIALLY_PAID'].includes(current.status)) { // Checks whether the value is missing; the block handles that case before continuing.
      throw new AppError('BUSINESS_RULE_VIOLATION', 'This bill is not payable.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
    } // Closes the current block and marks where its grouped work ends.
    const currentPaid = current.payments.reduce((sum, payment) => sum + n(payment.amount), 0) // Totals the matching values and stores the result in `currentPaid`.
    const outstanding = money(n(current.totalAmount) - currentPaid) // Stores this intermediate `outstanding` value so later lines can use it.
    const paymentDate = day(input.paymentDate) // Stores this intermediate `payment date` value so later lines can use it.
    if (paymentDate > today() || paymentDate < current.billDate) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      throw new AppError('VALIDATION_ERROR', 'Payment date must be between bill date and today.', 422) // Stops this request with `VALIDATION_ERROR` and HTTP 422 so the client receives a clear failure.
    } // Closes the current block and marks where its grouped work ends.
    if (input.amount > outstanding) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      throw new AppError('BUSINESS_RULE_VIOLATION', 'Payment exceeds the outstanding balance.', 422, { outstanding, requested: input.amount }) // Stops this operation with the error `BUSINESS_RULE_VIOLATION`, so the API reports the failure clearly.
    } // Closes the current block and marks where its grouped work ends.
    const payment = await tx.payment.create({ data: { billId: id, amount: input.amount, paymentDate, mode: input.mode as PaymentMode, referenceNumber: input.referenceNumber ?? null, remarks: input.remarks ?? null, recordedById: actor.id } }) // Stores this intermediate `payment` value so later lines can use it.
    const paid = currentPaid + input.amount // Stores this intermediate `paid` value so later lines can use it.
    const status = money(paid) === money(n(current.totalAmount)) ? 'PAID' : 'PARTIALLY_PAID' // Stores this intermediate `status` value so later lines can use it.
    const bill = await tx.bill.update({ where: { id }, data: { status }, include: { payments: true } }) // Stores this intermediate `bill` value so later lines can use it.
    await tx.auditLog.create({ data: { userId: actor.id, action: 'CREATE', entityType: 'Payment', entityId: payment.id, newValues: { billId: id, amount: input.amount, paymentDate: input.paymentDate, mode: input.mode, status } } }) // Waits for this asynchronous operation to finish before using its result.
    return { payment, bill: outputBill(bill) } // Returns the assembled result object so the caller receives the fields it needs.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function projectExpenses(actor: Actor, projectId: number, query: DateQuery) { // Defines `projectExpenses` to work with expenses, keeping this behavior reusable.
  await assertProject(actor, projectId, true) // Waits for this asynchronous operation to finish before using its result.
  const bills = await prisma.bill.findMany({ where: { projectId, ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}) }, include: { payments: true, vendor: true }, orderBy: { billDate: 'desc' } }) // Fetches matching database records and stores them in `bills` for the response or next calculation.
  return bills.map(outputBill) // Returns `bills.map(outputBill)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function vendorOutstanding(actor: Actor, query: DateQuery) { // Defines `vendorOutstanding` to vendor outstanding, keeping this behavior reusable.
  const where: Prisma.BillWhereInput = { // Stores this intermediate `prisma.bill where input` value so later lines can use it.
    ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(actor.role === 'PM' ? { project: { assignedPmId: actor.id } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const bills = await prisma.bill.findMany({ where, include: { vendor: true, payments: true } }) // Fetches matching database records and stores them in `bills` for the response or next calculation.
  const grouped = new Map<number, { vendorId: number; vendorName: string; totalAmount: number; paidAmount: number; outstandingAmount: number }>() // Creates a lookup map named `grouped` so values can be grouped by key while records are processed.
  for (const bill of bills) { // Repeats the block for each `bill` in `bills` so every item is processed.
    const row = grouped.get(bill.vendorId) ?? { vendorId: bill.vendorId, vendorName: bill.vendor.name, totalAmount: 0, paidAmount: 0, outstandingAmount: 0 } // Stores this intermediate `row` value so later lines can use it.
    const item = outputBill(bill) // Stores this intermediate `item` value so later lines can use it.
    row.totalAmount += n(item.totalAmount); row.paidAmount += item.paidAmount; row.outstandingAmount += item.outstandingAmount // Adds `n(item.totalAmount); row.paidAmount += item.paidAmount; row.outstandingAmount += item.outstandingAmount` to the running `row.totalAmount` total.
    grouped.set(bill.vendorId, row) // Provides `grouped.set(bill.vendorId, row)` as part of vendor outstanding.
  } // Closes the current block and marks where its grouped work ends.
  return [...grouped.values()].map((row) => ({ ...row, totalAmount: money(row.totalAmount), paidAmount: money(row.paidAmount), outstandingAmount: money(row.outstandingAmount) })) // Returns the resulting list so the caller can use the matching records.
} // Closes the current block and marks where its grouped work ends.

export async function paymentHistory(actor: Actor, query: DateQuery) { // Defines `paymentHistory` to payment history, keeping this behavior reusable.
  return prisma.payment.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { // Sets `where` to filters the database records to the requested scope.
      ...(query.from || query.to ? { paymentDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      ...(actor.role === 'PM' ? { bill: { project: { assignedPmId: actor.id } } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    include: { bill: { select: { id: true, billNumber: true, projectId: true, vendor: { select: { id: true, name: true } } } }, recordedBy: { select: { id: true, name: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }], // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements billing business rules and database operations.
