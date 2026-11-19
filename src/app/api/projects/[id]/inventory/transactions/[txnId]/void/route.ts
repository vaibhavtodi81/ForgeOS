import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'

const TXN_INCLUDE = {
  material: { select: { name: true, unit: true } },
  recordedBy: { select: { id: true, name: true } },
} satisfies Prisma.InventoryTransactionInclude

export async function POST(req: Request, { params }: { params: Promise<{ id: string; txnId: string }> }) {
  const auth = await requirePermission(req, 'stock:void')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id, txnId } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  const body = await readJson<{ reason?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (reason.length < 5) return fail('A void reason of at least 5 characters is required', 400)

  const txn = await db.inventoryTransaction.findUnique({ where: { id: txnId } })
  if (!txn || txn.projectId !== id) return fail('Stock transaction not found', 404)
  if (txn.voidedAt) return fail('Transaction is already voided', 409)

  if (txn.txnType === 'IN' || (txn.txnType === 'ADJUSTMENT' && txn.quantity > 0)) {
    const plan = await db.materialPlan.findUnique({
      where: { projectId_materialId: { projectId: id, materialId: txn.materialId } },
    })
    const txns = await db.inventoryTransaction.findMany({
      where: { projectId: id, materialId: txn.materialId, voidedAt: null },
      select: { txnType: true, quantity: true },
    })
    const balance = txns.reduce(
      (sum, t) => (t.txnType === 'OUT' ? sum - t.quantity : sum + t.quantity),
      plan?.openingQuantity ?? 0
    )
    if (balance < txn.quantity) {
      return fail('Cannot void this IN transaction: it would make the stock balance negative', 422)
    }
  }

  const updated = await db.inventoryTransaction.update({
    where: { id: txnId },
    data: { voidedAt: new Date(), voidReason: reason, voidedById: user.id },
    include: TXN_INCLUDE,
  })

  await writeAudit({
    action: 'TXN_VOID',
    actorId: user.id,
    actorName: user.name,
    entityType: 'stock-txn',
    entityId: txnId,
    projectId: id,
    meta: { reason, txnType: updated.txnType, material: updated.material.name },
    ip: getClientIp(req),
  })

  return ok({
    transaction: {
      ...updated,
      quantity: Math.abs(updated.quantity),
      txnDate: updated.txnDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      isVoided: true,
      voidedAt: updated.voidedAt ? updated.voidedAt.toISOString() : null,
      adjustmentDirection:
        updated.txnType === 'ADJUSTMENT' ? (updated.quantity >= 0 ? 'INCREASE' : 'DECREASE') : null,
      createdBy: updated.recordedBy,
    },
  })
}
