import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, parseDate, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { GST_OPTIONS } from '@/lib/forgeos-types'
import type { InvoiceListResponse, InvoiceRow, InvoiceStatus } from '@/lib/forgeos-types'

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { project: { select: { name: true } }, payments: { select: { amount: true } } }
}>

function toInvoiceRow(inv: InvoiceWithRelations): InvoiceRow {
  const totalWithGst = inv.amount * (1 + inv.gstPct / 100)
  const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0)
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    projectId: inv.projectId,
    projectName: inv.project.name,
    amount: inv.amount,
    gstPct: inv.gstPct,
    totalWithGst,
    status: inv.status as InvoiceStatus,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    paidAmount,
    balance: totalWithGst - paidAmount,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const projectId = url.searchParams.get('projectId')
  const isPm = auth.user.role === 'PROJECT_MANAGER'

  const where: Prisma.InvoiceWhereInput = {}
  if (isPm) where.project = { pmId: auth.user.id }

  const invoices = await db.invoice.findMany({
    where,
    include: { project: { select: { name: true } }, payments: { select: { amount: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const rows = invoices.map(toInvoiceRow)
  const items = rows.filter(
    (r) => (!status || r.status === status) && (!projectId || r.projectId === projectId)
  )

  const nowIso = new Date().toISOString()
  let invoiced = 0
  let collected = 0
  let overdue = 0
  for (const r of rows) {
    if (r.status === 'DRAFT' || r.status === 'VOID') continue
    invoiced += r.totalWithGst
    collected += r.paidAmount
    if ((r.status === 'SENT' || r.status === 'PARTIALLY_PAID') && r.dueDate < nowIso) {
      overdue += r.balance
    }
  }

  const response: InvoiceListResponse = {
    items,
    summary: { invoiced, collected, receivables: invoiced - collected, overdue },
  }
  return ok(response)
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN', 'ACCOUNTANT'])
  if (!auth.ok) return auth.response

  const body = await readJson<{
    projectId?: unknown
    amount?: unknown
    gstPct?: unknown
    issueDate?: unknown
    dueDate?: unknown
  }>(req)
  if (!body) return fail('Invalid request body', 400)

  const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : ''
  const amount = body.amount
  const gstPct = body.gstPct

  if (!projectId) return fail('Project is required', 400)
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return fail('Amount must be greater than zero', 400)
  }
  if (typeof gstPct !== 'number' || !GST_OPTIONS.includes(gstPct)) {
    return fail('Invalid GST rate', 400)
  }

  const issueDate = parseDate(body.issueDate)
  if (!issueDate) return fail('A valid issue date is required', 400)
  const dueDate = parseDate(body.dueDate)
  if (!dueDate) return fail('A valid due date is required', 400)
  if (dueDate.getTime() <= issueDate.getTime()) {
    return fail('Due date must be after the issue date', 400)
  }

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) return fail('Project not found', 404)

  const year = issueDate.getFullYear()
  const prefix = `INV-${year}-`
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await db.invoice.count({ where: { invoiceNo: { startsWith: prefix } } })
    const invoiceNo = `${prefix}${String(count + 1).padStart(3, '0')}`
    try {
      const created = await db.invoice.create({
        data: { invoiceNo, projectId, amount, gstPct, status: 'DRAFT', issueDate, dueDate },
      })
      await writeAudit({
        action: 'INVOICE_CREATE',
        actorId: auth.user.id,
        actorName: auth.user.name,
        entityType: 'invoice',
        entityId: created.id,
        meta: { invoiceNo: created.invoiceNo, amount, gstPct, project: project.name },
        ip: getClientIp(req),
      })
      const invoice = toInvoiceRow({ ...created, project: { name: project.name }, payments: [] })
      return ok({ invoice })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue
      throw err
    }
  }
  return fail('Could not generate a unique invoice number, please retry', 409)
}
