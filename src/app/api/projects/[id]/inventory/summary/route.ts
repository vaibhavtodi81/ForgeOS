import { db } from '@/lib/db'
import { fail, guardAuth, ok, pmOwns } from '@/lib/api-helpers'

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
    db.materialPlan.findMany({ where: { projectId: id }, include: { material: true } }),
    db.inventoryTransaction.findMany({
      where: { projectId: id, voidedAt: null },
      select: { materialId: true, txnType: true, quantity: true },
    }),
  ])

  const rows = plans.map((plan) => {
    const rowsForMaterial = transactions.filter((t) => t.materialId === plan.materialId)
    const totalReceived = rowsForMaterial.filter((t) => t.txnType === 'IN').reduce((sum, t) => sum + t.quantity, 0)
    const totalConsumed = rowsForMaterial.filter((t) => t.txnType === 'OUT').reduce((sum, t) => sum + t.quantity, 0)
    const adjustmentIn = rowsForMaterial
      .filter((t) => t.txnType === 'ADJUSTMENT' && t.quantity > 0)
      .reduce((sum, t) => sum + t.quantity, 0)
    const adjustmentOut = rowsForMaterial
      .filter((t) => t.txnType === 'ADJUSTMENT' && t.quantity < 0)
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0)
    return {
      materialId: plan.materialId,
      materialName: plan.material.name,
      unit: plan.material.unit,
      openingStock: plan.openingQuantity,
      totalReceived,
      totalConsumed,
      adjustmentIn,
      adjustmentOut,
      availableStock: plan.openingQuantity + totalReceived - totalConsumed + adjustmentIn - adjustmentOut,
      transactionCount: rowsForMaterial.length,
    }
  })

  return ok(rows)
}
