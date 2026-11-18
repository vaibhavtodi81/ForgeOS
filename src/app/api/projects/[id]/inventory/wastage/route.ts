import { db } from '@/lib/db'
import { fail, guardAuth, ok, pmOwns } from '@/lib/api-helpers'
import type { WastageReport, WastageStatus } from '@/lib/forgeos-types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const [plans, latestLog, transactions] = await Promise.all([
    db.materialPlan.findMany({ where: { projectId: id }, include: { material: true } }),
    db.dailyLog.findFirst({
      where: { projectId: id },
      orderBy: { logDate: 'desc' },
      select: { progressPercent: true },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: id, voidedAt: null },
      select: { materialId: true, txnType: true, quantity: true, unitRate: true, outReason: true },
    }),
  ])

  const progressPercent = latestLog?.progressPercent ?? 0

  const items = plans.map((plan) => {
    const rows = transactions.filter((t) => t.materialId === plan.materialId)
    const outRows = rows.filter((t) => t.txnType === 'OUT')
    const consumed = outRows.reduce((sum, t) => sum + t.quantity, 0)
    const recordedWastage = outRows
      .filter((t) => t.outReason === 'DAMAGED' || t.outReason === 'LOST')
      .reduce((sum, t) => sum + t.quantity, 0)

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
      materialId: plan.materialId,
      materialName: plan.material.name,
      unit: plan.material.unit,
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

  const order: Record<WastageStatus, number> = { OVERRUN: 0, NO_BASELINE: 1, OK: 2 }
  items.sort((a, b) => {
    const rankA = order[a.status] ?? 3
    const rankB = order[b.status] ?? 3
    if (rankA !== rankB) return rankA - rankB
    return b.estimatedLoss - a.estimatedLoss
  })

  const report: WastageReport = { progressPercent, items }
  return ok(report)
}
