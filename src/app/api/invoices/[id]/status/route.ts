import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { ALLOWED_INVOICE_TRANSITIONS, INVOICE_STATUSES } from '@/lib/forgeos-types'
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
      })) as PaymentRow[],
  }
}

const ALLOWED_CHANGES = (Object.keys(ALLOWED_INVOICE_TRANSITIONS) as InvoiceStatus[])
  .flatMap((from) => ALLOWED_INVOICE_TRANSITIONS[from].map((to) => `${from}→${to}`))
  .join(', ')

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'invoices:write')
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await readJson<{ status?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { project: { select: { code: true, name: true } }, payments: true },
  })
  if (!invoice) return fail('Invoice not found', 404)

  const from = invoice.status as InvoiceStatus
  const target = body.status
  const allowed = ALLOWED_INVOICE_TRANSITIONS[from] ?? []
  if (
    typeof target !== 'string' ||
    !INVOICE_STATUSES.includes(target as InvoiceStatus) ||
    !allowed.includes(target as InvoiceStatus)
  ) {
    return fail(`Only these status changes are allowed here: ${ALLOWED_CHANGES}`, 400)
  }

  const updated = await db.invoice.update({
    where: { id },
    data: { status: target },
    include: { project: { select: { code: true, name: true } }, payments: true },
  })

  await writeAudit({
    action: 'INVOICE_STATUS_CHANGE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'invoice',
    entityId: updated.id,
    projectId: updated.projectId,
    meta: { from, to: target, invoiceNo: updated.invoiceNo },
    ip: getClientIp(req),
  })

  return ok({ invoice: toInvoiceRow(updated) })
}
