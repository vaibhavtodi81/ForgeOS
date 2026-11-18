import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import type { PlanStatus, WastageOverviewResponse, WastageRow } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const isPm = auth.user.role === 'PROJECT_MANAGER'
  const planWhere: Prisma.MaterialPlanWhereInput = {}
  if (isPm) planWhere.project = { pmId: auth.user.id }

  const [plans, outTxns] = await Promise.all([
    db.materialPlan.findMany({
      where: planWhere,
      include: { project: { select: { name: true } }, material: { select: { name: true, unit: true } } },
    }),
    db.inventoryTransaction.findMany({
      where: { txnType: 'OUT', voidedAt: null },
      select: { projectId: true, materialId: true, quantity: true },
    }),
  ])

  const consumedByKey = new Map<string, number>()
  for (const t of outTxns) {
    const key = `${t.projectId}:${t.materialId}`
    consumedByKey.set(key, (consumedByKey.get(key) ?? 0) + t.quantity)
  }

  const items: WastageRow[] = plans
    .map((plan) => {
      const consumedQty = consumedByKey.get(`${plan.projectId}:${plan.materialId}`) ?? 0
      const estimated = plan.plannedQty / (1 + plan.wastagePct / 100)
      // Wastage is only meaningful once consumption has begun
      const wastagePct = estimated > 0 && consumedQty > 0 ? ((consumedQty - estimated) / estimated) * 100 : null
      return {
        projectId: plan.projectId,
        projectName: plan.project.name,
        materialId: plan.materialId,
        materialName: plan.material.name,
        unit: plan.material.unit,
        plannedQty: plan.plannedQty,
        consumedQty,
        varianceQty: consumedQty - plan.plannedQty,
        wastagePct,
        status: plan.status as PlanStatus,
      }
    })
    .sort((a, b) => {
      if (a.wastagePct === null || b.wastagePct === null) {
        if (a.wastagePct === null && b.wastagePct === null) return a.projectName.localeCompare(b.projectName)
        return a.wastagePct === null ? 1 : -1
      }
      if (b.wastagePct !== a.wastagePct) return b.wastagePct - a.wastagePct
      return a.projectName.localeCompare(b.projectName)
    })

  const totalPlanned = items.reduce((sum, i) => sum + i.plannedQty, 0)
  const totalConsumed = items.reduce((sum, i) => sum + i.consumedQty, 0)
  const pctValues = items.map((i) => i.wastagePct).filter((v): v is number => v !== null)
  const avgWastagePct = pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null

  const response: WastageOverviewResponse = {
    items,
    portfolio: { totalPlanned, totalConsumed, avgWastagePct },
  }
  return ok(response)
}
