import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import { PROJECT_STATUSES } from '@/lib/forgeos-types'
import type { AdminDashboardResponse, InvoiceStatus } from '@/lib/forgeos-types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function truncateName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 18)}…` : name
}

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['ADMIN', 'ACCOUNTANT', 'VIEWER'])
  if (!auth.ok) return auth.response

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [projects, inTxns, recentInTxns, outTxns, plans, invoices, auditLogs] = await Promise.all([
    db.project.findMany({ select: { id: true, name: true, budget: true, status: true } }),
    db.inventoryTransaction.findMany({
      where: { txnType: 'IN', voidedAt: null },
      select: { projectId: true, quantity: true, unitRate: true },
    }),
    db.inventoryTransaction.findMany({
      where: { txnType: 'IN', voidedAt: null, txnDate: { gte: monthStart } },
      select: { quantity: true, unitRate: true, txnDate: true },
    }),
    db.inventoryTransaction.findMany({
      where: { txnType: 'OUT', voidedAt: null },
      select: { projectId: true, materialId: true, quantity: true },
    }),
    db.materialPlan.findMany({
      select: { projectId: true, materialId: true, plannedQty: true, wastagePct: true },
    }),
    db.invoice.findMany({
      include: { project: { select: { name: true } }, payments: { select: { amount: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ])

  const spendByProject = new Map<string, number>()
  for (const t of inTxns) {
    spendByProject.set(t.projectId, (spendByProject.get(t.projectId) ?? 0) + t.quantity * t.unitRate)
  }
  const totalSpend = inTxns.reduce((sum, t) => sum + t.quantity * t.unitRate, 0)

  const consumedByKey = new Map<string, number>()
  for (const t of outTxns) {
    const key = `${t.projectId}:${t.materialId}`
    consumedByKey.set(key, (consumedByKey.get(key) ?? 0) + t.quantity)
  }

  const planWastage = plans.map((plan) => {
    const consumedQty = consumedByKey.get(`${plan.projectId}:${plan.materialId}`) ?? 0
    const estimated = plan.plannedQty / (1 + plan.wastagePct / 100)
    // Wastage is only meaningful once consumption has begun
    const wastagePct = estimated > 0 && consumedQty > 0 ? ((consumedQty - estimated) / estimated) * 100 : null
    return { projectId: plan.projectId, plannedQty: plan.plannedQty, consumedQty, wastagePct }
  })

  const allWastage = planWastage.map((p) => p.wastagePct).filter((v): v is number => v !== null)
  const avgWastagePct = allWastage.length > 0 ? allWastage.reduce((a, b) => a + b, 0) / allWastage.length : null

  const wastageValuesByProject = new Map<string, number[]>()
  for (const p of planWastage) {
    if (p.wastagePct === null) continue
    const list = wastageValuesByProject.get(p.projectId)
    if (list) list.push(p.wastagePct)
    else wastageValuesByProject.set(p.projectId, [p.wastagePct])
  }
  const projectNameById = new Map(projects.map((p) => [p.id, p.name]))
  let worstProjectName: string | null = null
  let worstWastagePct: number | null = null
  for (const [projectId, values] of wastageValuesByProject) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    if (worstWastagePct === null || avg > worstWastagePct) {
      worstWastagePct = avg
      worstProjectName = projectNameById.get(projectId) ?? null
    }
  }

  const statusCounts = new Map<string, number>()
  for (const p of projects) statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1)
  const statusBreakdown = PROJECT_STATUSES.map((status) => ({ status, count: statusCounts.get(status) ?? 0 }))

  let receivables = 0
  let overdueInvoices = 0
  for (const inv of invoices) {
    if (inv.status !== 'SENT' && inv.status !== 'PARTIALLY_PAID') continue
    const totalWithGst = inv.amount * (1 + inv.gstPct / 100)
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0)
    receivables += totalWithGst - paid
    if (inv.dueDate.getTime() < now.getTime()) overdueInvoices++
  }

  const monthBuckets: { key: string; label: string }[] = []
  const cursor = new Date(monthStart)
  for (let i = 0; i < 6; i++) {
    monthBuckets.push({ key: monthKey(cursor), label: MONTH_LABELS[cursor.getMonth()] })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  const spendByMonthKey = new Map<string, number>()
  for (const t of recentInTxns) {
    const key = monthKey(t.txnDate)
    spendByMonthKey.set(key, (spendByMonthKey.get(key) ?? 0) + t.quantity * t.unitRate)
  }
  const spendByMonth = monthBuckets.map((b) => ({
    month: b.key,
    label: b.label,
    spend: spendByMonthKey.get(b.key) ?? 0,
  }))

  const budgetVsSpend = [...projects]
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 6)
    .map((p) => ({ projectName: truncateName(p.name), budget: p.budget, spend: spendByProject.get(p.id) ?? 0 }))

  const plansByProject = new Map<string, typeof planWastage>()
  for (const p of planWastage) {
    const list = plansByProject.get(p.projectId)
    if (list) list.push(p)
    else plansByProject.set(p.projectId, [p])
  }
  const wastageByProject = [...plansByProject.entries()]
    .map(([projectId, list]) => {
      const pctValues = list.map((p) => p.wastagePct).filter((v): v is number => v !== null)
      return {
        projectName: truncateName(projectNameById.get(projectId) ?? ''),
        wastagePct: pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null,
        plannedQty: list.reduce((s, p) => s + p.plannedQty, 0),
        consumedQty: list.reduce((s, p) => s + p.consumedQty, 0),
      }
    })
    .sort((a, b) => {
      if (a.wastagePct === null || b.wastagePct === null) {
        if (a.wastagePct === null && b.wastagePct === null) return 0
        return a.wastagePct === null ? 1 : -1
      }
      return b.wastagePct - a.wastagePct
    })
    .slice(0, 6)

  const recentActivity = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    actorName: log.actorName,
    entityType: log.entityType,
    createdAt: log.createdAt.toISOString(),
  }))

  const recentInvoices = invoices.slice(0, 6).map((inv) => {
    const totalWithGst = inv.amount * (1 + inv.gstPct / 100)
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0)
    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      projectName: inv.project.name,
      totalWithGst,
      status: inv.status as InvoiceStatus,
      dueDate: inv.dueDate.toISOString(),
      balance: totalWithGst - paid,
    }
  })

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)

  const response: AdminDashboardResponse = {
    kpis: {
      totalProjects: projects.length,
      activeProjects: statusCounts.get('ACTIVE') ?? 0,
      onHoldProjects: statusCounts.get('ON_HOLD') ?? 0,
      planningProjects: statusCounts.get('PLANNING') ?? 0,
      completedProjects: statusCounts.get('COMPLETED') ?? 0,
      totalBudget,
      totalSpend,
      budgetUtilization: totalBudget > 0 ? (totalSpend / totalBudget) * 100 : null,
      receivables,
      overdueInvoices,
      avgWastagePct,
      worstProjectName,
      worstWastagePct,
    },
    statusBreakdown,
    spendByMonth,
    budgetVsSpend,
    wastageByProject,
    recentActivity,
    recentInvoices,
  }
  return ok(response)
}
