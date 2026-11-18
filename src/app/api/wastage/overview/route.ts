import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import type { WastageOverviewResponse, WastageOverviewRow, WastageStatus } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const isPm = auth.user.role === 'PM'
  const projectWhere = isPm ? { assignedPmId: auth.user.id } : undefined

  const projects = await db.project.findMany({
    where: projectWhere,
    select: { id: true, name: true, wastageThresholdPct: true },
  })
  const projectIds = projects.map((p) => p.id)
  const projectById = new Map(projects.map((p) => [p.id, p]))

  const [plans, transactions, latestLogs] = await Promise.all([
    db.materialPlan.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        projectId: true,
        materialId: true,
        plannedQuantity: true,
      plannedUnitRate: true,
        wastageThresholdPct: true,
        material: { select: { name: true, unit: true } },
      },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: { in: projectIds }, voidedAt: null },
      select: { projectId: true, materialId: true, txnType: true, quantity: true, unitRate: true, outReason: true },
    }),
    db.dailyLog.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
      select: { projectId: true, progressPercent: true },
    }),
  ])

  const progressByProject = new Map<string, number>()
  for (const log of latestLogs) {
    if (!progressByProject.has(log.projectId)) progressByProject.set(log.projectId, log.progressPercent)
  }

  const items: WastageOverviewRow[] = plans
    .filter((plan) => projectById.has(plan.projectId))
    .map((plan) => {
      const project = projectById.get(plan.projectId)!
      const rows = transactions.filter((t) => t.projectId === plan.projectId && t.materialId === plan.materialId)
      const outRows = rows.filter((t) => t.txnType === 'OUT')
      const consumed = outRows.reduce((sum, t) => sum + t.quantity, 0)
      const recordedWastage = outRows
        .filter((t) => t.outReason === 'DAMAGED' || t.outReason === 'LOST')
        .reduce((sum, t) => sum + t.quantity, 0)

      const progressPercent = progressByProject.get(plan.projectId) ?? 0
      const expected = plan.plannedQuantity * (progressPercent / 100)
      const overrun = Math.max(consumed - expected, 0)
      const overrunPercent = expected > 0 ? (overrun / expected) * 100 : null
      const threshold = plan.wastageThresholdPct ?? project.wastageThresholdPct
      const status: WastageStatus =
        progressPercent === 0 && consumed > 0
          ? 'NO_BASELINE'
          : overrunPercent !== null && overrunPercent > threshold
            ? 'OVERRUN'
            : 'OK'

      return {
        projectId: plan.projectId,
        projectName: project.name,
        materialId: plan.materialId,
        materialName: plan.material.name,
        unit: plan.material.unit,
        progressPercent,
        plannedQuantity: plan.plannedQuantity,
        expectedQuantity: expected,
        consumedQuantity: consumed,
        overrunQuantity: overrun,
        overrunPercent,
        thresholdPercent: threshold,
        recordedWastageQuantity: recordedWastage,
        estimatedLoss: overrun * (plan.plannedUnitRate ?? 0),
        status,
      }
    })
    .sort((a, b) => {
      if (a.overrunPercent === null || b.overrunPercent === null) {
        if (a.overrunPercent === null && b.overrunPercent === null) {
          return a.projectName.localeCompare(b.projectName)
        }
        return a.overrunPercent === null ? 1 : -1
      }
      if (b.overrunPercent !== a.overrunPercent) return b.overrunPercent - a.overrunPercent
      return a.projectName.localeCompare(b.projectName)
    })

  const totalPlanned = items.reduce((sum, i) => sum + i.plannedQuantity, 0)
  const totalConsumed = items.reduce((sum, i) => sum + i.consumedQuantity, 0)
  const pctValues = items.map((i) => i.overrunPercent).filter((v): v is number => v !== null)
  const avgOverrunPct = pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null

  const response: WastageOverviewResponse = {
    items,
    portfolio: { totalPlanned, totalConsumed, avgOverrunPct },
  }
  return ok(response)
}
