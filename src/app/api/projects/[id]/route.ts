import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, pmOwns, readJson, parseDate } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type {
  ProjectDetail,
  ProjectRow,
  ProjectStatus,
  PlanRow,
  PlanStatus,
  TxnRow,
  TxnType,
  LogRow,
  InvoiceRow,
  InvoiceStatus,
} from '@/lib/forgeos-types'

type ProjectWithRefs = Prisma.ProjectGetPayload<{ include: { land: true; pm: true } }>
type PlanWithRefs = Prisma.MaterialPlanGetPayload<{
  include: { project: true; material: true; createdBy: true }
}>
type TxnWithRefs = Prisma.InventoryTransactionGetPayload<{
  include: { project: true; material: true; supplier: true; recordedBy: true }
}>
type LogWithRefs = Prisma.DailyLogGetPayload<{ include: { project: true; createdBy: true } }>
type InvoiceWithPayments = Prisma.InvoiceGetPayload<{
  include: { project: true; payments: { select: { amount: true } } }
}>

function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

async function projectStats(projectId: string) {
  const txns = await db.inventoryTransaction.findMany({
    where: { projectId, txnType: 'IN', voidedAt: null },
    select: { quantity: true, unitRate: true },
  })
  const spend = txns.reduce((sum, t) => sum + t.quantity * t.unitRate, 0)

  const invoices = await db.invoice.findMany({
    where: { projectId, status: { notIn: ['DRAFT', 'VOID'] } },
    select: { id: true, amount: true, gstPct: true },
  })
  const invoiced = invoices.reduce((sum, i) => sum + i.amount * (1 + i.gstPct / 100), 0)

  let collected = 0
  if (invoices.length > 0) {
    const payments = await db.payment.findMany({
      where: { invoiceId: { in: invoices.map((i) => i.id) } },
      select: { amount: true },
    })
    collected = payments.reduce((sum, p) => sum + p.amount, 0)
  }

  return { spend, invoiced, collected }
}

function toProjectRow(
  p: ProjectWithRefs,
  stats: { spend: number; invoiced: number; collected: number }
): ProjectRow {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    status: p.status as ProjectStatus,
    budget: p.budget,
    startDate: p.startDate.toISOString(),
    plannedEndDate: p.plannedEndDate ? p.plannedEndDate.toISOString() : null,
    actualEndDate: p.actualEndDate ? p.actualEndDate.toISOString() : null,
    landId: p.landId,
    landName: p.land.name,
    pmId: p.pmId,
    pmName: p.pm ? p.pm.name : null,
    spend: stats.spend,
    invoiced: stats.invoiced,
    collected: stats.collected,
    createdAt: p.createdAt.toISOString(),
  }
}

async function consumedQty(projectId: string, materialId: string): Promise<number> {
  const agg = await db.inventoryTransaction.aggregate({
    where: { projectId, materialId, txnType: 'OUT', voidedAt: null },
    _sum: { quantity: true },
  })
  return agg._sum.quantity ?? 0
}

function toPlanRow(plan: PlanWithRefs, consumed: number): PlanRow {
  return {
    id: plan.id,
    projectId: plan.projectId,
    projectName: plan.project.name,
    materialId: plan.materialId,
    materialName: plan.material.name,
    unit: plan.material.unit,
    plannedQty: plan.plannedQty,
    wastagePct: plan.wastagePct,
    status: plan.status as PlanStatus,
    notes: plan.notes,
    createdByName: plan.createdBy.name,
    createdAt: plan.createdAt.toISOString(),
    consumedQty: consumed,
  }
}

function toTxnRow(t: TxnWithRefs): TxnRow {
  return {
    id: t.id,
    projectId: t.projectId,
    projectName: t.project.name,
    materialId: t.materialId,
    materialName: t.material.name,
    unit: t.material.unit,
    supplierId: t.supplierId,
    supplierName: t.supplier ? t.supplier.name : null,
    txnType: t.txnType as TxnType,
    quantity: t.quantity,
    unitRate: t.unitRate,
    totalCost: Math.abs(t.quantity) * t.unitRate,
    txnDate: t.txnDate.toISOString(),
    voidedAt: t.voidedAt ? t.voidedAt.toISOString() : null,
    voidReason: t.voidReason,
    recordedByName: t.recordedBy.name,
  }
}

function toLogRow(l: LogWithRefs): LogRow {
  return {
    id: l.id,
    projectId: l.projectId,
    projectName: l.project.name,
    logDate: l.logDate.toISOString(),
    workDone: l.workDone,
    headcount: l.headcount,
    notes: l.notes,
    createdByName: l.createdBy.name,
  }
}

function toInvoiceRow(i: InvoiceWithPayments): InvoiceRow {
  const totalWithGst = i.amount * (1 + i.gstPct / 100)
  const paidAmount = i.payments.reduce((sum, p) => sum + p.amount, 0)
  return {
    id: i.id,
    invoiceNo: i.invoiceNo,
    projectId: i.projectId,
    projectName: i.project.name,
    amount: i.amount,
    gstPct: i.gstPct,
    totalWithGst,
    status: i.status as InvoiceStatus,
    issueDate: i.issueDate.toISOString(),
    dueDate: i.dueDate.toISOString(),
    paidAmount,
    balance: totalWithGst - paidAmount,
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    include: { land: true, pm: true },
  })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.pmId)) return fail('You can only access your own projects', 403)

  const [stats, plans, transactions, logs, invoices] = await Promise.all([
    projectStats(project.id),
    db.materialPlan.findMany({
      where: { projectId: project.id },
      include: { project: true, material: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: project.id },
      include: { project: true, material: true, supplier: true, recordedBy: true },
      orderBy: [{ txnDate: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    }),
    db.dailyLog.findMany({
      where: { projectId: project.id },
      include: { project: true, createdBy: true },
      orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    }),
    db.invoice.findMany({
      where: { projectId: project.id },
      include: { project: true, payments: { select: { amount: true } } },
      orderBy: { issueDate: 'desc' },
    }),
  ])

  const planRows = await Promise.all(
    plans.map(async (plan) => toPlanRow(plan, await consumedQty(plan.projectId, plan.materialId)))
  )

  const detail: ProjectDetail = {
    ...toProjectRow(project, stats),
    plans: planRows,
    transactions: transactions.map(toTxnRow),
    logs: logs.map(toLogRow),
    invoices: invoices.map(toInvoiceRow),
  }

  return ok(detail)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  const data: Prisma.ProjectUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 3) return fail('Name must be at least 3 characters')
    if (name !== project.name) {
      data.name = name
      changes.name = name
    }
  }
  if (body.landId !== undefined) {
    const landId = typeof body.landId === 'string' ? body.landId : ''
    const land = landId ? await db.land.findUnique({ where: { id: landId } }) : null
    if (!land) return fail('Land not found')
    if (landId !== project.landId) {
      data.landId = landId
      changes.landId = landId
    }
  }
  if (body.budget !== undefined) {
    const budget = num(body.budget)
    if (!(budget > 0)) return fail('Budget must be greater than zero')
    if (budget !== project.budget) {
      data.budget = budget
      changes.budget = budget
    }
  }

  let newStart = project.startDate
  if (body.startDate !== undefined) {
    const startDate = parseDate(body.startDate)
    if (!startDate) return fail('Invalid start date')
    newStart = startDate
  }
  let newPlannedEnd = project.plannedEndDate
  if (body.plannedEndDate !== undefined) {
    if (body.plannedEndDate === null || body.plannedEndDate === '') {
      newPlannedEnd = null
    } else {
      const d = parseDate(body.plannedEndDate)
      if (!d) return fail('Invalid planned end date')
      newPlannedEnd = d
    }
  }
  if (newPlannedEnd && newPlannedEnd.getTime() < newStart.getTime()) {
    return fail('Planned end date must be after the start date')
  }
  if (newStart.getTime() !== project.startDate.getTime()) {
    data.startDate = newStart
    changes.startDate = newStart.toISOString()
  }
  if ((newPlannedEnd?.getTime() ?? null) !== (project.plannedEndDate?.getTime() ?? null)) {
    data.plannedEndDate = newPlannedEnd
    changes.plannedEndDate = newPlannedEnd ? newPlannedEnd.toISOString() : null
  }

  const updated = await db.project.update({
    where: { id },
    data,
    include: { land: true, pm: true },
  })

  if (Object.keys(changes).length > 0) {
    await writeAudit({
      action: 'PROJECT_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'PROJECT',
      entityId: id,
      meta: changes,
    })
  }

  return ok({ project: toProjectRow(updated, await projectStats(updated.id)) })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  if (project.status !== 'PLANNING') {
    return fail('Only planning projects with no recorded activity can be deleted', 409)
  }
  const [planCount, txnCount, logCount, invoiceCount] = await Promise.all([
    db.materialPlan.count({ where: { projectId: id } }),
    db.inventoryTransaction.count({ where: { projectId: id } }),
    db.dailyLog.count({ where: { projectId: id } }),
    db.invoice.count({ where: { projectId: id } }),
  ])
  if (planCount + txnCount + logCount + invoiceCount > 0) {
    return fail('Only planning projects with no recorded activity can be deleted', 409)
  }

  await db.project.delete({ where: { id } })
  await writeAudit({
    action: 'PROJECT_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'PROJECT',
    entityId: id,
    meta: { name: project.name, code: project.code },
  })

  return ok({ ok: true })
}
