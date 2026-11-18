import { db } from '@/lib/db'
import { fail, guardAuth, ok, pmOwns } from '@/lib/api-helpers'
import type { MaterialCategory } from '@/lib/forgeos-types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const [plans, transactions] = await Promise.all([
    db.materialPlan.findMany({
      where: { projectId: id },
      include: { material: true },
      orderBy: { material: { name: 'asc' } },
    }),
    db.inventoryTransaction.findMany({
      where: { projectId: id, voidedAt: null },
      select: { materialId: true, txnType: true, quantity: true },
    }),
  ])

  const rows = plans.map((plan) => {
    const materialTxns = transactions.filter((t) => t.materialId === plan.materialId)
    const totalIn = materialTxns.filter((t) => t.txnType === 'IN').reduce((sum, t) => sum + t.quantity, 0)
    const totalOut = materialTxns.filter((t) => t.txnType === 'OUT').reduce((sum, t) => sum + t.quantity, 0)
    const adjustmentIn = materialTxns
      .filter((t) => t.txnType === 'ADJUSTMENT' && t.quantity > 0)
      .reduce((sum, t) => sum + t.quantity, 0)
    const adjustmentOut = materialTxns
      .filter((t) => t.txnType === 'ADJUSTMENT' && t.quantity < 0)
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0)
    const availableStock = plan.openingQuantity + totalIn - totalOut + adjustmentIn - adjustmentOut
    return {
      materialId: plan.materialId,
      materialName: plan.material.name,
      category: plan.material.category as MaterialCategory,
      unit: plan.material.unit,
      openingStock: plan.openingQuantity,
      totalIn,
      totalOut,
      adjustmentIn,
      adjustmentOut,
      availableStock,
      plannedQuantity: plan.plannedQuantity,
      lowStockThreshold: plan.lowStockThreshold,
      isLowStock: plan.lowStockThreshold !== null && availableStock <= plan.lowStockThreshold,
    }
  })

  return ok(rows)
}
