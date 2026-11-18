import { db } from '@/lib/db'
import { fail, guardAuth, ok } from '@/lib/api-helpers'
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
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'ADMIN' && auth.user.role !== 'VIEWER') {
    return fail('Admin access required', 403)
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [projects, inTxns, recentInTxns, outTxns, plans, invoices, auditLogs, logs] = await Promise.all([
    db.project.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        location: true,
        status: true,
        totalBudget: true,
        expectedEndDate: true,
        wastageThresholdPct: true,
        assignedPm: { select: { name: true } },
        land: { select: { city: true, state: true } },
      },
    }),
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
      select: {
        projectId: true,
        materialId: true,
        plannedQuantity: true,
        wastageThresholdPct: true,
      },
    }),
    db.invoice.findMany({
      include: { project: { select: { name: true } }, payments: { select: { amount: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    db.dailyLog.findMany({
      orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        projectId: true,
        logDate: true,
        progressPercent: true,
        workSummary: true,
      },
    }),
  ])

  const spendByProject = new Map<string, number>()
  for (const t of inTxns) {
    spendByProject.set(t.projectId, (spendByProject.get(t.projectId) ?? 0) + t.quantity * (t.unitRate ?? 0))
  }
  const totalSpend = inTxns.reduce((sum, t) => sum + t.quantity * (t.unitRate ?? 0), 0)

  const latestLogByProject = new Map<string, { progressPercent: number; logDate: Date; count: number }>()
  for (const log of logs) {
    const current = latestLogByProject.get(log.projectId)
    if (current) current.count += 1
    else latestLogByProject.set(log.projectId, { progressPercent: log.progressPercent, logDate: log.logDate, count: 1 })
  }

  const consumedByKey = new Map<string, number>()
  for (const t of outTxns) {
    const key = `${t.projectId}:${t.materialId}`
    consumedByKey.set(key, (consumedByKey.get(key) ?? 0) + t.quantity)
  }

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]))
  const thresholdByProject = new Map(projects.map((p) => [p.id, p.wastageThresholdPct]))

  const planWastage = plans.map((plan) => {
    const progress = latestLogByProject.get(plan.projectId)?.progressPercent ?? 0
    const consumedQty = consumedByKey.get(`${plan.projectId}:${plan.materialId}`) ?? 0
    const expected = plan.plannedQuantity * (progress / 100)
    const overrun = Math.max(consumedQty - expected, 0)
    const threshold = plan.wastageThresholdPct ?? thresholdByProject.get(plan.projectId) ?? 10
    const wastagePct = expected > 0 ? (overrun / expected) * 100 : null
    return { projectId: plan.projectId, plannedQty: plan.plannedQuantity, consumedQty, wastagePct }
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
    spendByMonthKey.set(key, (spendByMonthKey.get(key) ?? 0) + t.quantity * (t.unitRate ?? 0))
  }
  const spendByMonth = monthBuckets.map((b) => ({
    month: b.key,
    label: b.label,
    spend: spendByMonthKey.get(b.key) ?? 0,
  }))

  const budgetVsSpend = [...projects]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 6)
    .map((p) => ({
      projectName: truncateName(p.name),
      budget: p.totalBudget,
      spend: spendByProject.get(p.id) ?? 0,
    }))

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

  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0)

  const projectRows = projects.map((p) => {
    const latest = latestLogByProject.get(p.id)
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      location: p.location ?? ([p.land.city, p.land.state].filter(Boolean).join(', ') || null),
      status: p.status as AdminDashboardResponse['projects'][number]['status'],
      totalBudget: p.totalBudget,
      expectedEndDate: p.expectedEndDate ? p.expectedEndDate.toISOString() : null,
      pmName: p.assignedPm?.name ?? null,
      latestProgressPercent: latest?.progressPercent ?? 0,
      latestLogDate: latest ? latest.logDate.toISOString() : null,
      totalDailyLogs: latest?.count ?? 0,
    }
  })

  const recentProgress = logs
    .filter((log) => projectNameById.has(log.projectId))
    .slice(0, 8)
    .map((log) => ({
      projectId: log.projectId,
      projectName: projectNameById.get(log.projectId) ?? '',
      code: projects.find((p) => p.id === log.projectId)?.code ?? '',
      id: log.id,
      logDate: log.logDate.toISOString(),
      progressPercent: log.progressPercent,
      workSummary: log.workSummary,
    }))

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
    projects: projectRows,
    recentProgress,
  }
  return ok(response)
}
