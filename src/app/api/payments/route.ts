import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, parseDate, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { PAYMENT_METHODS } from '@/lib/forgeos-types'
import type { InvoiceRow, InvoiceStatus, PaymentMethod, PaymentRow } from '@/lib/forgeos-types'

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    project: { select: { code: true, name: true } }
    payments: true
  }
}>

function toInvoiceRow(inv: InvoiceWithRelations): InvoiceRow {
  const totalWithGst = inv.amount * (1 + inv.gstPct / 100)
  const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0)
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    projectId: inv.projectId,
    project: inv.project,
    amount: inv.amount,
    gstPct: inv.gstPct,
    totalWithGst,
    status: inv.status as InvoiceStatus,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    paidAmount,
    balance: totalWithGst - paidAmount,
    payments: [...inv.payments]
      .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
      .map((p) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        amount: p.amount,
        method: p.method as PaymentMethod,
        reference: p.reference,
        paidAt: p.paidAt.toISOString(),
      })),
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const invoiceId = url.searchParams.get('invoiceId')
  const isPm = auth.user.role === 'PM'

  const where: Prisma.PaymentWhereInput = {}
  if (invoiceId) where.invoiceId = invoiceId
  if (isPm) where.invoice = { project: { assignedPmId: auth.user.id } }

  const payments = await db.payment.findMany({
    where,
    include: { invoice: { select: { invoiceNo: true } } },
    orderBy: { paidAt: 'desc' },
  })

  const items: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    invoiceId: p.invoiceId,
    amount: p.amount,
    method: p.method as PaymentMethod,
    reference: p.reference,
    paidAt: p.paidAt.toISOString(),
  }))

  return ok({ items })
}

export async function POST(req: Request) {
  const auth = await requirePermission(req, 'payments:write')
  if (!auth.ok) return auth.response

  const body = await readJson<{
    invoiceId?: unknown
    amount?: unknown
    method?: unknown
    reference?: unknown
    paidAt?: unknown
  }>(req)
  if (!body) return fail('Invalid request body', 400)

  const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId.trim() : ''
  const amount = body.amount
  const method = body.method
  const reference = typeof body.reference === 'string' && body.reference.trim() ? body.reference.trim() : null
  const paidAt = parseDate(body.paidAt) ?? new Date()

  if (!invoiceId) return fail('Invoice is required', 400)
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return fail('Amount must be greater than zero', 400)
  }
  if (typeof method !== 'string' || !PAYMENT_METHODS.includes(method as PaymentMethod)) {
    return fail('Invalid payment method', 400)
  }

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { project: { select: { code: true, name: true } }, payments: true },
  })
  if (!invoice) return fail('Invoice not found', 404)

  if (invoice.status !== 'SENT' && invoice.status !== 'PARTIALLY_PAID') {
    return fail('Payments can only be recorded against sent invoices', 409)
  }

  const totalWithGst = invoice.amount * (1 + invoice.gstPct / 100)
  const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalWithGst - paidAmount
  if (amount > balance + 0.01) {
    return fail(`Payment exceeds the outstanding balance of ₹${Math.round(balance)}`, 409)
  }

  const newPaid = paidAmount + amount
  const newStatus = newPaid >= totalWithGst - 0.01 ? 'PAID' : 'PARTIALLY_PAID'

  const { payment, updated } = await db.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: { invoiceId, amount, method, reference, paidAt },
    })
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
      include: { project: { select: { code: true, name: true } }, payments: true },
    })
    return { payment, updated }
  })

  await writeAudit({
    action: 'PAYMENT_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'payment',
    entityId: payment.id,
    projectId: invoice.projectId,
    meta: { invoiceNo: invoice.invoiceNo, amount, method },
    ip: getClientIp(req),
  })

  const paymentRow: PaymentRow = {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: payment.amount,
    method: payment.method as PaymentMethod,
    reference: payment.reference,
    paidAt: payment.paidAt.toISOString(),
  }

  return ok({ payment: paymentRow, invoice: toInvoiceRow(updated) })
}
