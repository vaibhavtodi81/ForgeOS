import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import type { PmDashboardResponse, ProjectStatus } from '@/lib/forgeos-types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response

  const projects = await db.project.findMany({ where: { assignedPmId: auth.user.id } })
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
      select: {
        projectId: true,
        materialId: true,
        plannedQuantity: true,
        wastageThresholdPct: true,
        status: true,
      },
    }),
    db.dailyLog.findMany({
      where: { projectId: { in: projectIds } },
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

  const latestByProject = new Map<string, { progressPercent: number; logDate: Date; count: number }>()
  for (const log of logs) {
    const current = latestByProject.get(log.projectId)
    if (current) current.count += 1
    else latestByProject.set(log.projectId, { progressPercent: log.progressPercent, logDate: log.logDate, count: 1 })
  }

  const consumedByKey = new Map<string, number>()
  for (const t of outTxns) {
    const key = `${t.projectId}:${t.materialId}`
    consumedByKey.set(key, (consumedByKey.get(key) ?? 0) + t.quantity)
  }

  const wastageByProjectId = new Map<string, (number | null)[]>()
  for (const plan of plans) {
    const progress = latestByProject.get(plan.projectId)?.progressPercent ?? 0
    const consumedQty = consumedByKey.get(`${plan.projectId}:${plan.materialId}`) ?? 0
    const expected = plan.plannedQuantity * (progress / 100)
    const overrun = Math.max(consumedQty - expected, 0)
    const wastagePct = expected > 0 ? (overrun / expected) * 100 : null
    const list = wastageByProjectId.get(plan.projectId)
    if (list) list.push(wastagePct)
    else wastageByProjectId.set(plan.projectId, [wastagePct])
  }

  const allWastage = [...wastageByProjectId.values()].flat().filter((v): v is number => v !== null)
  const avgWastagePct = allWastage.length > 0 ? allWastage.reduce((a, b) => a + b, 0) / allWastage.length : null

  const projectRows: PmDashboardResponse['projects'] = projects
    .map((p) => {
      const spend = spendByProject.get(p.id) ?? 0
      const pctValues = (wastageByProjectId.get(p.id) ?? []).filter((v): v is number => v !== null)
      const latest = latestByProject.get(p.id)
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status as ProjectStatus,
        totalBudget: p.totalBudget,
        spend,
        expectedEndDate: p.expectedEndDate ? p.expectedEndDate.toISOString() : null,
        wastagePct: pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null,
        latestProgressPercent: latest ? latest.progressPercent : null,
        latestLogDate: latest ? latest.logDate.toISOString() : null,
        totalDailyLogs: latest?.count ?? 0,
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
    spendByMonthKey.set(key, (spendByMonthKey.get(key) ?? 0) + t.quantity * (t.unitRate ?? 0))
  }
  const spendByMonth = monthBuckets.map((b) => ({
    month: b.key,
    label: b.label,
    spend: spendByMonthKey.get(b.key) ?? 0,
  }))

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]))
  const recentLogs = logs.slice(0, 6).map((log) => ({
    id: log.id,
    projectId: log.projectId,
    projectName: projectNameById.get(log.projectId) ?? '',
    logDate: log.logDate.toISOString(),
    progressPercent: log.progressPercent,
    workSummary: log.workSummary,
  }))

  const upcomingEndDates = projects
    .flatMap((p) =>
      p.status === 'ACTIVE' && p.expectedEndDate
        ? [{ id: p.id, name: p.name, expectedEndDate: p.expectedEndDate, status: p.status as ProjectStatus }]
        : []
    )
    .sort((a, b) => a.expectedEndDate.getTime() - b.expectedEndDate.getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      expectedEndDate: p.expectedEndDate.toISOString(),
      status: p.status,
    }))

  const response: PmDashboardResponse = {
    kpis: {
      myProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
      totalBudget: projects.reduce((sum, p) => sum + p.totalBudget, 0),
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
