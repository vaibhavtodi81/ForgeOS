import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import type { PmDashboardResponse, ProjectStatus } from '@/lib/forgeos-types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['PROJECT_MANAGER'])
  if (!auth.ok) return auth.response

  const projects = await db.project.findMany({ where: { pmId: auth.user.id } })
  const projectIds = projects.map((p) => p.id)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [inTxns, recentInTxns, outTxns, plans, logs] = await Promise.all([
    db.inventoryTransaction.findMany({
      where: { projectId: { in: projectIds }, txnType: 'IN', voidedAt: null },
      select: { projectId: true, quantity: true, unitRate: true },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: { in: projectIds }, txnType: 'IN', voidedAt: null, txnDate: { gte: monthStart } },
      select: { quantity: true, unitRate: true, txnDate: true },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: { in: projectIds }, txnType: 'OUT', voidedAt: null },
      select: { projectId: true, materialId: true, quantity: true },
    }),
    db.materialPlan.findMany({
      where: { projectId: { in: projectIds } },
      select: { projectId: true, materialId: true, plannedQty: true, wastagePct: true, status: true },
    }),
    db.dailyLog.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      include: { project: { select: { name: true } } },
    }),
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

  const wastageByProjectId = new Map<string, (number | null)[]>()
  for (const plan of plans) {
    const consumedQty = consumedByKey.get(`${plan.projectId}:${plan.materialId}`) ?? 0
    const estimated = plan.plannedQty / (1 + plan.wastagePct / 100)
    // Wastage is only meaningful once consumption has begun
    const wastagePct = estimated > 0 && consumedQty > 0 ? ((consumedQty - estimated) / estimated) * 100 : null
    const list = wastageByProjectId.get(plan.projectId)
    if (list) list.push(wastagePct)
    else wastageByProjectId.set(plan.projectId, [wastagePct])
  }

  const allWastage = [...wastageByProjectId.values()].flat().filter((v): v is number => v !== null)
  const avgWastagePct = allWastage.length > 0 ? allWastage.reduce((a, b) => a + b, 0) / allWastage.length : null

  const projectRows = projects
    .map((p) => {
      const spend = spendByProject.get(p.id) ?? 0
      const pctValues = (wastageByProjectId.get(p.id) ?? []).filter((v): v is number => v !== null)
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status as ProjectStatus,
        budget: p.budget,
        spend,
        plannedEndDate: p.plannedEndDate ? p.plannedEndDate.toISOString() : null,
        wastagePct: pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null,
        progressPct: p.budget > 0 ? Math.min(100, (spend / p.budget) * 100) : null,
      }
    })
    .sort((a, b) => {
      const aActive = a.status === 'ACTIVE' ? 0 : 1
      const bActive = b.status === 'ACTIVE' ? 0 : 1
      return aActive - bActive || a.name.localeCompare(b.name)
    })

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

  const recentLogs = logs.map((log) => ({
    id: log.id,
    projectName: log.project.name,
    logDate: log.logDate.toISOString(),
    workDone: log.workDone,
    headcount: log.headcount,
  }))

  const upcomingEndDates = projects
    .flatMap((p) =>
      p.status === 'ACTIVE' && p.plannedEndDate
        ? [{ id: p.id, name: p.name, plannedEndDate: p.plannedEndDate, status: p.status as ProjectStatus }]
        : []
    )
    .sort((a, b) => a.plannedEndDate.getTime() - b.plannedEndDate.getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      plannedEndDate: p.plannedEndDate.toISOString(),
      status: p.status,
    }))

  const response: PmDashboardResponse = {
    kpis: {
      myProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      totalSpend,
      draftPlans: plans.filter((p) => p.status === 'DRAFT').length,
      avgWastagePct,
    },
    projects: projectRows,
    spendByMonth,
    recentLogs,
    upcomingEndDates,
  }
  return ok(response)
}
