import { describe, test, expect, afterAll } from 'vitest'
import { GET as invoicesGET, POST as invoicesPOST } from '@/app/api/invoices/route'
import { PATCH as invoiceStatusPATCH } from '@/app/api/invoices/[id]/status/route'
import { GET as paymentsGET, POST as paymentsPOST } from '@/app/api/payments/route'
import { db } from '@/lib/db'
import {
  auth,
  P,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  YASHMEEN_EMAIL,
  createProjectFixture,
} from '../helpers'

interface InvoiceRow {
  id: string
  invoiceNo: string
  projectId: string
  project: { code: string; name: string }
  amount: number
  gstPct: number
  totalWithGst: number
  status: string
  issueDate: string
  dueDate: string
  paidAmount: number
  balance: number
  payments: { id: string; amount: number; method: string; paidAt: string }[]
}

interface PaymentRow {
  id: string
  invoiceId: string
  amount: number
  method: string
  reference: string | null
  paidAt: string
}

const fixture = await createProjectFixture('inv', { pmEmail: RIYA_EMAIL })

// All invoices in this file are issued in the year 2031 so that the
// INV-2031-### numbering space is isolated from the seeded INV-2026 rows.
const ISSUE = '2031-01-05'
const DUE = '2031-02-05'

let invA = '' // 001 — full payment lifecycle
let invC = '' // 003
let invD = '' // 004 — created after deleting invB (numbering retry)
let invE = '' // 005 — stays DRAFT
let invF = '' // 006 — DRAFT → SENT → VOID

async function createInvoice(amount: number): Promise<InvoiceRow> {
  const admin = await loginAs(ADMIN_EMAIL)
  const body = await okBody<{ invoice: InvoiceRow }>(
    await invoicesPOST(
      auth('/api/invoices', admin, {
        body: { projectId: fixture.projectId, amount, gstPct: 18, issueDate: ISSUE, dueDate: DUE },
      })
    )
  )
  return body.data.invoice
}

afterAll(async () => {
  await db.invoice.deleteMany({ where: { invoiceNo: { startsWith: 'INV-2031-' } } })
  await fixture.dispose()
})

describe('POST /api/invoices', () => {
  test('validation: PM 403, amount, gst, dates, unknown project', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await invoicesPOST(
        auth('/api/invoices', riya, { body: { projectId: fixture.projectId, amount: 100, gstPct: 18, issueDate: ISSUE, dueDate: DUE } })
      ),
      403
    )
    const base = { projectId: fixture.projectId, gstPct: 18, issueDate: ISSUE, dueDate: DUE }
    await errBody(await invoicesPOST(auth('/api/invoices', admin, { body: { ...base, amount: 0 } })), 400)
    await errBody(await invoicesPOST(auth('/api/invoices', admin, { body: { ...base, amount: -5 } })), 400)
    await errBody(await invoicesPOST(auth('/api/invoices', admin, { body: { ...base, amount: 100, gstPct: 7 } })), 400)
    await errBody(
      await invoicesPOST(auth('/api/invoices', admin, { body: { projectId: fixture.projectId, amount: 100, gstPct: 18, dueDate: DUE } })),
      400
    ) // missing issueDate
    await errBody(
      await invoicesPOST(auth('/api/invoices', admin, { body: { ...base, amount: 100, issueDate: '2031-03-01', dueDate: '2031-02-01' } })),
      400
    )
    await errBody(
      await invoicesPOST(auth('/api/invoices', admin, { body: { ...base, amount: 100, projectId: 'nope' } })),
      404
    )
  })

  test('creates a DRAFT invoice with computed totals and audit', async () => {
    const a = await createInvoice(100_000)
    invA = a.id
    expect(a.invoiceNo).toBe('INV-2031-001')
    expect(a.status).toBe('DRAFT')
    expect(a.amount).toBe(100_000)
    expect(a.gstPct).toBe(18)
    expect(a.totalWithGst).toBe(118_000)
    expect(a.paidAmount).toBe(0)
    expect(a.balance).toBe(118_000)
    expect(a.project.code).toBe(`T8-${RUN_TAG}-inv`)
    const audit = await db.auditLog.findFirst({
      where: { action: 'INVOICE_CREATE', entityId: invA },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)
  })

  test('numbering retry advances the attempt counter after a delete', async () => {
    // A(001) exists; create B(002) and C(003), then delete B — the next
    // create computes count+1 = 003 which collides with C, so the route
    // must retry and settle on INV-2031-004.
    const b = await createInvoice(10_000)
    expect(b.invoiceNo).toBe('INV-2031-002')
    const c = await createInvoice(20_000)
    expect(c.invoiceNo).toBe('INV-2031-003')
    invC = c.id
    await db.invoice.delete({ where: { id: b.id } })

    const d = await createInvoice(30_000)
    invD = d.id
    expect(d.invoiceNo).toBe('INV-2031-004')
    expect(await db.invoice.findUnique({ where: { id: b.id } })).toBeNull()
  })
})

describe('PATCH /api/invoices/:id/status', () => {
  test('DRAFT→SENT succeeds with audit', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ invoice: InvoiceRow }>(
      await invoiceStatusPATCH(
        auth(`/api/invoices/${invA}/status`, admin, { method: 'PATCH', body: { status: 'SENT' } }),
        P(invA)
      )
    )
    expect(body.data.invoice.status).toBe('SENT')
    expect(await db.invoice.findUniqueOrThrow({ where: { id: invA } })).toMatchObject({ status: 'SENT' })
    const audit = await db.auditLog.findFirst({
      where: { action: 'INVOICE_STATUS_CHANGE', entityId: invA },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('DRAFT→PAID is blocked with the allowed-changes message', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const e = await createInvoice(40_000)
    invE = e.id
    expect(e.status).toBe('DRAFT')
    const body = await errBody(
      await invoiceStatusPATCH(
        auth(`/api/invoices/${invE}/status`, admin, { method: 'PATCH', body: { status: 'PAID' } }),
        P(invE)
      ),
      400
    )
    expect(body.message).toContain('Only these status changes are allowed')
    // invalid status string / non-admin / unknown invoice
    await errBody(
      await invoiceStatusPATCH(auth(`/api/invoices/${invE}/status`, admin, { method: 'PATCH', body: { status: 'NOPE' } }), P(invE)),
      400
    )
    await errBody(
      await invoiceStatusPATCH(
        auth(`/api/invoices/${invE}/status`, await loginAs(RIYA_EMAIL), { method: 'PATCH', body: { status: 'SENT' } }),
        P(invE)
      ),
      403
    )
    await errBody(
      await invoiceStatusPATCH(auth('/api/invoices/nope/status', admin, { method: 'PATCH', body: { status: 'SENT' } }), P('nope')),
      404
    )
  })

  test('SENT→VOID works; payments against VOID are rejected', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const f = await createInvoice(50_000)
    invF = f.id
    await okBody(
      await invoiceStatusPATCH(auth(`/api/invoices/${invF}/status`, admin, { method: 'PATCH', body: { status: 'SENT' } }), P(invF))
    )
    const body = await okBody<{ invoice: InvoiceRow }>(
      await invoiceStatusPATCH(auth(`/api/invoices/${invF}/status`, admin, { method: 'PATCH', body: { status: 'VOID' } }), P(invF))
    )
    expect(body.data.invoice.status).toBe('VOID')
    await errBody(
      await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: invF, amount: 100, method: 'CASH' } })),
      409
    )
  })
})

describe('POST /api/payments', () => {
  test('payment against a DRAFT invoice → 409', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await errBody(
      await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: invE, amount: 1000, method: 'CASH' } })),
      409
    )
    expect(body.message).toContain('sent invoices')
  })

  test('validation: PM 403, amount, method, unknown invoice', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(
      await paymentsPOST(
        auth('/api/payments', await loginAs(RIYA_EMAIL), { body: { invoiceId: invA, amount: 10, method: 'CASH' } })
      ),
      403
    )
    await errBody(await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: invA, amount: 0, method: 'CASH' } })), 400)
    await errBody(await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: invA, amount: 10, method: 'WIRE' } })), 400)
    await errBody(await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: 'nope', amount: 10, method: 'CASH' } })), 404)
  })

  test('partial payment flips SENT → PARTIALLY_PAID in one transaction', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ payment: PaymentRow; invoice: InvoiceRow }>(
      await paymentsPOST(
        auth('/api/payments', admin, {
          body: { invoiceId: invA, amount: 50_000, method: 'UPI', reference: `T8-UPI-${RUN_TAG}`, paidAt: '2031-01-20' },
        })
      )
    )
    expect(body.data.payment.amount).toBe(50_000)
    expect(body.data.payment.method).toBe('UPI')
    expect(body.data.invoice.status).toBe('PARTIALLY_PAID')
    expect(body.data.invoice.paidAmount).toBe(50_000)
    expect(body.data.invoice.balance).toBe(68_000)
    // both effects committed together
    const dbInvoice = await db.invoice.findUniqueOrThrow({ where: { id: invA }, include: { payments: true } })
    expect(dbInvoice.status).toBe('PARTIALLY_PAID')
    expect(dbInvoice.payments.length).toBe(1)
    expect(dbInvoice.payments[0].amount).toBe(50_000)
    const audit = await db.auditLog.findFirst({
      where: { action: 'PAYMENT_CREATE', entityId: body.data.payment.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)
  })

  test('overpaying the balance → 409', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await errBody(
      await paymentsPOST(
        auth('/api/payments', admin, { body: { invoiceId: invA, amount: 68_000.02, method: 'CASH', paidAt: '2031-02-01' } })
      ),
      409
    )
    expect(body.message).toContain('exceeds')
  })

  test('final payment auto-flips PARTIALLY_PAID → PAID; further payments rejected', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ payment: PaymentRow; invoice: InvoiceRow }>(
      await paymentsPOST(
        auth('/api/payments', admin, {
          body: { invoiceId: invA, amount: 68_000, method: 'BANK', reference: `T8-NEFT-${RUN_TAG}`, paidAt: '2031-02-01' },
        })
      )
    )
    expect(body.data.invoice.status).toBe('PAID')
    expect(body.data.invoice.paidAmount).toBe(118_000)
    expect(body.data.invoice.balance).toBe(0)
    const dbInvoice = await db.invoice.findUniqueOrThrow({ where: { id: invA } })
    expect(dbInvoice.status).toBe('PAID')
    await errBody(
      await paymentsPOST(auth('/api/payments', admin, { body: { invoiceId: invA, amount: 1, method: 'CASH' } })),
      409
    )
  })
})

describe('GET /api/invoices + GET /api/payments', () => {
  test('admin invoice list summary matches the DB; status/project filters work', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ items: InvoiceRow[]; summary: { invoiced: number; collected: number; receivables: number; overdue: number } }>(
      await invoicesGET(auth('/api/invoices', admin))
    )
    const items = body.data.items
    expect(items.some((i) => i.id === invA)).toBe(true)
    expect(items.some((i) => i.id === invD)).toBe(true)

    // summary math recomputed from the DB at the same point in time
    const dbInvoices = await db.invoice.findMany({ include: { payments: { select: { amount: true } } } })
    const nowIso = new Date().toISOString()
    let invoiced = 0
    let collected = 0
    let overdue = 0
    for (const inv of dbInvoices) {
      if (inv.status === 'DRAFT' || inv.status === 'VOID') continue
      const total = inv.amount * (1 + inv.gstPct / 100)
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
      invoiced += total
      collected += paid
      if ((inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID') && inv.dueDate.toISOString() < nowIso) {
        overdue += total - paid
      }
    }
    expect(body.data.summary.invoiced).toBeCloseTo(invoiced, 4)
    expect(body.data.summary.collected).toBeCloseTo(collected, 4)
    expect(body.data.summary.receivables).toBeCloseTo(invoiced - collected, 4)
    expect(body.data.summary.overdue).toBeCloseTo(overdue, 4)
    expect(items.length).toBe(dbInvoices.length)

    const paidOnly = await okBody<{ items: InvoiceRow[] }>(await invoicesGET(auth('/api/invoices?status=PAID', admin)))
    expect(paidOnly.data.items.every((i) => i.status === 'PAID')).toBe(true)
    expect(paidOnly.data.items.some((i) => i.id === invA)).toBe(true)

    const projectOnly = await okBody<{ items: InvoiceRow[] }>(
      await invoicesGET(auth(`/api/invoices?projectId=${fixture.projectId}`, admin))
    )
    // A (PAID), C (DRAFT), D (DRAFT), E (DRAFT), F (VOID) — no status filter → all 5
    expect(projectOnly.data.items.length).toBe(5)
    expect(projectOnly.data.items.every((i) => i.projectId === fixture.projectId)).toBe(true)
    expect(projectOnly.data.items.some((i) => i.id === invF)).toBe(true)
  })

  test('PM invoice list is scoped to her projects', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ items: InvoiceRow[]; summary: { invoiced: number } }>(
      await invoicesGET(auth('/api/invoices', riya))
    )
    const riyaUser = await db.user.findUniqueOrThrow({ where: { email: RIYA_EMAIL } })
    const riyaProjectIds = new Set(
      (await db.project.findMany({ where: { assignedPmId: riyaUser.id }, select: { id: true } })).map((p) => p.id)
    )
    const dbCount = await db.invoice.count({ where: { project: { assignedPmId: riyaUser.id } } })
    expect(body.data.items.length).toBe(dbCount)
    for (const item of body.data.items) {
      expect(riyaProjectIds.has(item.projectId)).toBe(true)
    }
    expect(body.data.items.some((i) => i.id === invA)).toBe(true)
    expect(body.data.items.some((i) => i.invoiceNo === 'INV-2026-003')).toBe(false) // yashmeen's
    expect(body.data.items.some((i) => i.invoiceNo === 'INV-2026-004')).toBe(false)
  })

  test('payment list: invoiceId filter, newest first, PM scoping', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const forInvoice = await okBody<{ items: PaymentRow[] }>(
      await paymentsGET(auth(`/api/payments?invoiceId=${invA}`, admin))
    )
    expect(forInvoice.data.items.length).toBe(2)
    expect(forInvoice.data.items[0].amount).toBe(68_000) // paidAt desc
    expect(forInvoice.data.items[1].amount).toBe(50_000)
    expect(forInvoice.data.items.every((p) => p.invoiceId === invA)).toBe(true)

    const riya = await loginAs(RIYA_EMAIL)
    const riyaPayments = await okBody<{ items: PaymentRow[] }>(await paymentsGET(auth('/api/payments', riya)))
    const riyaUser = await db.user.findUniqueOrThrow({ where: { email: RIYA_EMAIL } })
    const riyaIds = new Set(
      (
        await db.payment.findMany({
          where: { invoice: { project: { assignedPmId: riyaUser.id } } },
          select: { id: true },
        })
      ).map((p) => p.id)
    )
    expect(riyaPayments.data.items.length).toBe(riyaIds.size)
    for (const p of riyaPayments.data.items) expect(riyaIds.has(p.id)).toBe(true)

    const yash = await loginAs(YASHMEEN_EMAIL)
    const yashPayments = await okBody<{ items: PaymentRow[] }>(await paymentsGET(auth('/api/payments', yash)))
    expect(yashPayments.data.items.some((p) => p.invoiceId === invA)).toBe(false)
    for (const p of yashPayments.data.items) expect(riyaIds.has(p.id)).toBe(false)
  })
})
