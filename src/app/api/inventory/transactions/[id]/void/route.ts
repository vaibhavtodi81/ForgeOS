import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { TxnRow, TxnType } from '@/lib/forgeos-types'

type TxnWithRefs = Prisma.InventoryTransactionGetPayload<{
  include: { project: true; material: true; supplier: true; recordedBy: true }
}>

function toTxnRow(t: TxnWithRefs): TxnRow {
  return {
    id: t.id,
    projectId: t.projectId,
    projectName: t.project.name,
    materialId: t.materialId,
    materialName: t.material.name,
    unit: t.material.unit,
    supplierId: t.supplierId,
    supplierName: t.supplier ? t.supplier.name : null,
    txnType: t.txnType as TxnType,
    quantity: t.quantity,
    unitRate: t.unitRate,
    totalCost: Math.abs(t.quantity) * t.unitRate,
    txnDate: t.txnDate.toISOString(),
    voidedAt: t.voidedAt ? t.voidedAt.toISOString() : null,
    voidReason: t.voidReason,
    recordedByName: t.recordedBy.name,
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (reason.length < 5) return fail('Provide a reason (at least 5 characters)')

  const txn = await db.inventoryTransaction.findUnique({
    where: { id },
    include: { project: true, material: true, supplier: true, recordedBy: true },
  })
  if (!txn) return fail('Transaction not found', 404)
  if (txn.voidedAt) return fail('Transaction is already voided', 409)

  const updated = await db.inventoryTransaction.update({
    where: { id },
    data: { voidedAt: new Date(), voidReason: reason },
    include: { project: true, material: true, supplier: true, recordedBy: true },
  })

  await writeAudit({
    action: 'INVENTORY_VOID',
    actorId: user.id,
    actorName: user.name,
    entityType: 'INVENTORY_TRANSACTION',
    entityId: id,
    meta: { reason, quantity: txn.quantity, materialName: txn.material.name },
  })

  return ok({ transaction: toTxnRow(updated) })
}
