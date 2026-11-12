import { Prisma, type BillCategory, type BillStatus, type PaymentMode, type Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { projectAccess, type ProjectActor } from '../projects/projects.service.js'
import type { BillListQuery, CreateBillInput, DateQuery, PaymentInput, UpdateBillInput } from './billing.validator.js'

type Actor = ProjectActor
const day = (value: string) => new Date(`${value}T00:00:00.000Z`)
const today = () => new Date(new Date().toISOString().slice(0, 10))
const n = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0)
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

function jsonSnapshot(value: {
  id: number
  projectId: number
  vendorId: number
  billNumber: string
  billDate: Date
  dueDate: Date | null
  category: string
  description: string | null
  baseAmount: Prisma.Decimal
  gstPercent: Prisma.Decimal
  gstAmount: Prisma.Decimal
  totalAmount: Prisma.Decimal
  status: string
  submittedById: number
  approvedById: number | null
  approvedAt: Date | null
  rejectionReason: string | null
}): Prisma.InputJsonValue {
  return {
    id: value.id, projectId: value.projectId, vendorId: value.vendorId, billNumber: value.billNumber,
    billDate: value.billDate.toISOString().slice(0, 10), dueDate: value.dueDate?.toISOString().slice(0, 10) ?? null,
    category: value.category, description: value.description, baseAmount: value.baseAmount.toString(),
    gstPercent: value.gstPercent.toString(), gstAmount: value.gstAmount.toString(), totalAmount: value.totalAmount.toString(),
    status: value.status, submittedById: value.submittedById, approvedById: value.approvedById,
    approvedAt: value.approvedAt?.toISOString() ?? null, rejectionReason: value.rejectionReason,
  }
}

async function assertProject(actor: Actor, projectId: number, allowCompleted = false) {
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true, status: true } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  if (!allowCompleted && project.status === 'COMPLETED') throw new AppError('BUSINESS_RULE_VIOLATION', 'Completed projects cannot receive new bills.', 422)
  return project
}

async function getBill(actor: Actor, id: number) {
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      vendor: true,
      project: { select: { id: true, code: true, name: true, assignedPmId: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      payments: { include: { recordedBy: { select: { id: true, name: true } } }, orderBy: { paymentDate: 'asc' } },
    },
  })
  if (!bill || (actor.role === 'PM' && bill.project.assignedPmId !== actor.id)) throw new AppError('NOT_FOUND', 'Bill not found.', 404)
  const paidAmount = bill.payments.reduce((sum, payment) => sum + n(payment.amount), 0)
  return { ...bill, paidAmount: money(paidAmount), outstandingAmount: money(n(bill.totalAmount) - paidAmount) }
}

function outputBill<T extends { totalAmount: Prisma.Decimal; payments?: Array<{ amount: Prisma.Decimal }> }>(bill: T) {
  const paidAmount = bill.payments?.reduce((sum, payment) => sum + n(payment.amount), 0) ?? 0
  return { ...bill, paidAmount: money(paidAmount), outstandingAmount: money(n(bill.totalAmount) - paidAmount) }
}

export async function createBill(actor: Actor, input: CreateBillInput) {
  await assertProject(actor, input.projectId)
  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId }, select: { id: true, isActive: true } })
  if (!vendor || !vendor.isActive) throw new AppError('NOT_FOUND', 'Active vendor not found.', 404)
  const billDate = day(input.billDate)
  const dueDate = input.dueDate ? day(input.dueDate) : null
  const gstAmount = money(input.baseAmount * input.gstPercent / 100)
  const totalAmount = money(input.baseAmount + gstAmount)
  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.create({
      data: {
        projectId: input.projectId, vendorId: input.vendorId, billNumber: input.billNumber,
        billDate, dueDate, category: input.category as BillCategory, description: input.description ?? null,
        baseAmount: input.baseAmount, gstPercent: input.gstPercent, gstAmount, totalAmount, submittedById: actor.id,
      },
      include: { payments: true },
    })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'CREATE', entityType: 'Bill', entityId: bill.id, newValues: jsonSnapshot(bill) } })
    return outputBill(bill)
  })
}

export async function listBills(actor: Actor, query: BillListQuery) {
  const statuses = query.status?.split(',').filter(Boolean) as BillStatus[] | undefined
  const where: Prisma.BillWhereInput = {
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.vendorId ? { vendorId: query.vendorId } : {}),
    ...(statuses?.length ? { status: { in: statuses } } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}),
    ...(query.search ? { OR: [
      { billNumber: { contains: query.search, mode: 'insensitive' } },
      { vendor: { name: { contains: query.search, mode: 'insensitive' } } },
    ] } : {}),
    ...(actor.role === 'PM' ? { project: { assignedPmId: actor.id } } : {}),
  }
  if (query.overdue) {
    where.dueDate = { lt: today() }
    where.status = { in: ['APPROVED', 'PARTIALLY_PAID'] }
  }
  const [bills, total] = await prisma.$transaction([
    prisma.bill.findMany({
      where, orderBy: [{ billDate: 'desc' }, { id: 'desc' }],
      skip: (query.page - 1) * query.pageSize, take: query.pageSize,
      include: { vendor: true, project: { select: { id: true, code: true, name: true } }, payments: true },
    }),
    prisma.bill.count({ where }),
  ])
  const rows = bills.map(outputBill)
  const totals = rows.reduce((acc, bill) => ({
    totalAmount: acc.totalAmount + n(bill.totalAmount),
    paidAmount: acc.paidAmount + bill.paidAmount,
    outstandingAmount: acc.outstandingAmount + bill.outstandingAmount,
  }), { totalAmount: 0, paidAmount: 0, outstandingAmount: 0 })
  return { bills: rows, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize), totals: { totalAmount: money(totals.totalAmount), paidAmount: money(totals.paidAmount), outstandingAmount: money(totals.outstandingAmount) } } }
}

export async function detail(actor: Actor, id: number) {
  return getBill(actor, id)
}

export async function updateBill(actor: Actor, id: number, input: UpdateBillInput) {
  const existing = await getBill(actor, id)
  if (!['PENDING', 'REJECTED'].includes(existing.status)) throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending or rejected bills can be edited.', 422)
  if (actor.role === 'PM' && existing.submittedById !== actor.id) throw new AppError('NOT_FOUND', 'Bill not found.', 404)
  if (input.vendorId !== undefined) {
    const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId }, select: { id: true, isActive: true } })
    if (!vendor || !vendor.isActive) throw new AppError('NOT_FOUND', 'Active vendor not found.', 404)
  }
  const baseAmount = input.baseAmount ?? n(existing.baseAmount)
  const gstPercent = input.gstPercent ?? n(existing.gstPercent)
  const billDate = input.billDate === undefined ? existing.billDate : day(input.billDate)
  const dueDate = input.dueDate === undefined ? existing.dueDate : input.dueDate ? day(input.dueDate) : null
  if (dueDate && dueDate < billDate) {
    throw new AppError('VALIDATION_ERROR', 'Due date must be on or after bill date.', 400)
  }
  const data = {
    ...(input.vendorId === undefined ? {} : { vendorId: input.vendorId }),
    ...(input.billNumber === undefined ? {} : { billNumber: input.billNumber }),
    ...(input.billDate === undefined ? {} : { billDate }),
    ...(input.dueDate === undefined ? {} : { dueDate }),
    ...(input.category === undefined ? {} : { category: input.category as BillCategory }),
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.baseAmount === undefined ? {} : { baseAmount }),
    ...(input.gstPercent === undefined ? {} : { gstPercent }),
    gstAmount: money(baseAmount * gstPercent / 100),
    totalAmount: money(baseAmount + money(baseAmount * gstPercent / 100)),
    ...(existing.status === 'REJECTED' ? { status: 'PENDING' as const, rejectionReason: null } : {}),
  }
  const updated = await prisma.$transaction(async (tx) => {
    const bill = await tx.bill.update({ where: { id }, data, include: { payments: true } })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } })
    return bill
  })
  return outputBill(updated)
}

export async function deleteBill(actor: Actor, id: number) {
  const existing = await getBill(actor, id)
  if (existing.status !== 'PENDING' || existing.payments.length > 0) throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills without payments can be deleted.', 422)
  if (actor.role === 'PM' && existing.submittedById !== actor.id) throw new AppError('NOT_FOUND', 'Bill not found.', 404)
  await prisma.$transaction(async (tx) => {
    await tx.bill.delete({ where: { id } })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'DELETE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing) } })
  })
}

export async function approveBill(actor: Actor, id: number) {
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can approve bills.', 403)
  const existing = await getBill(actor, id)
  if (existing.status !== 'PENDING') throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills can be approved.', 422)
  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.update({ where: { id }, data: { status: 'APPROVED', approvedById: actor.id, approvedAt: new Date() }, include: { payments: true } })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'APPROVE', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } })
    return outputBill(bill)
  })
}

export async function rejectBill(actor: Actor, id: number, reason: string) {
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can reject bills.', 403)
  const existing = await getBill(actor, id)
  if (existing.status !== 'PENDING') throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills can be rejected.', 422)
  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason }, include: { payments: true } })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'REJECT', entityType: 'Bill', entityId: id, oldValues: jsonSnapshot(existing), newValues: jsonSnapshot(bill) } })
    return outputBill(bill)
  })
}

export async function listPayments(actor: Actor, id: number, query: DateQuery) {
  const bill = await getBill(actor, id)
  return bill.payments.filter((payment) => (!query.from || payment.paymentDate >= day(query.from)) && (!query.to || payment.paymentDate <= day(query.to)))
}

export async function createPayment(actor: Actor, id: number, input: PaymentInput) {
  if (actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Only administrators can record payments.', 403)
  const existing = await getBill(actor, id)
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${id}::int)`
    const current = await tx.bill.findUnique({ where: { id }, include: { payments: true } })
    if (!current || !['APPROVED', 'PARTIALLY_PAID'].includes(current.status)) {
      throw new AppError('BUSINESS_RULE_VIOLATION', 'This bill is not payable.', 422)
    }
    const currentPaid = current.payments.reduce((sum, payment) => sum + n(payment.amount), 0)
    const outstanding = money(n(current.totalAmount) - currentPaid)
    const paymentDate = day(input.paymentDate)
    if (paymentDate > today() || paymentDate < current.billDate) {
      throw new AppError('VALIDATION_ERROR', 'Payment date must be between bill date and today.', 422)
    }
    if (input.amount > outstanding) {
      throw new AppError('BUSINESS_RULE_VIOLATION', 'Payment exceeds the outstanding balance.', 422, { outstanding, requested: input.amount })
    }
    const payment = await tx.payment.create({ data: { billId: id, amount: input.amount, paymentDate, mode: input.mode as PaymentMode, referenceNumber: input.referenceNumber ?? null, remarks: input.remarks ?? null, recordedById: actor.id } })
    const paid = currentPaid + input.amount
    const status = money(paid) === money(n(current.totalAmount)) ? 'PAID' : 'PARTIALLY_PAID'
    const bill = await tx.bill.update({ where: { id }, data: { status }, include: { payments: true } })
    await tx.auditLog.create({ data: { userId: actor.id, action: 'CREATE', entityType: 'Payment', entityId: payment.id, newValues: { billId: id, amount: input.amount, paymentDate: input.paymentDate, mode: input.mode, status } } })
    return { payment, bill: outputBill(bill) }
  })
}

export async function projectExpenses(actor: Actor, projectId: number, query: DateQuery) {
  await assertProject(actor, projectId, true)
  const bills = await prisma.bill.findMany({ where: { projectId, ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}) }, include: { payments: true, vendor: true }, orderBy: { billDate: 'desc' } })
  return bills.map(outputBill)
}

export async function vendorOutstanding(actor: Actor, query: DateQuery) {
  const where: Prisma.BillWhereInput = {
    ...(query.from || query.to ? { billDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}),
    ...(actor.role === 'PM' ? { project: { assignedPmId: actor.id } } : {}),
  }
  const bills = await prisma.bill.findMany({ where, include: { vendor: true, payments: true } })
  const grouped = new Map<number, { vendorId: number; vendorName: string; totalAmount: number; paidAmount: number; outstandingAmount: number }>()
  for (const bill of bills) {
    const row = grouped.get(bill.vendorId) ?? { vendorId: bill.vendorId, vendorName: bill.vendor.name, totalAmount: 0, paidAmount: 0, outstandingAmount: 0 }
    const item = outputBill(bill)
    row.totalAmount += n(item.totalAmount); row.paidAmount += item.paidAmount; row.outstandingAmount += item.outstandingAmount
    grouped.set(bill.vendorId, row)
  }
  return [...grouped.values()].map((row) => ({ ...row, totalAmount: money(row.totalAmount), paidAmount: money(row.paidAmount), outstandingAmount: money(row.outstandingAmount) }))
}

export async function paymentHistory(actor: Actor, query: DateQuery) {
  return prisma.payment.findMany({
    where: {
      ...(query.from || query.to ? { paymentDate: { ...(query.from ? { gte: day(query.from) } : {}), ...(query.to ? { lte: day(query.to) } : {}) } } : {}),
      ...(actor.role === 'PM' ? { bill: { project: { assignedPmId: actor.id } } } : {}),
    },
    include: { bill: { select: { id: true, billNumber: true, projectId: true, vendor: { select: { id: true, name: true } } } }, recordedBy: { select: { id: true, name: true } } },
    orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
  })
}
