import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, parseDay, pmOwns, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { ADJUSTMENT_DIRECTIONS, OUT_REASONS, TXN_TYPES } from '@/lib/forgeos-types'
import type { AdjustmentDirection, OutReason, TxnType } from '@/lib/forgeos-types'

const TXN_INCLUDE = {
  material: { select: { name: true, unit: true } },
  recordedBy: { select: { id: true, name: true } },
} satisfies Prisma.InventoryTransactionInclude

type TxnWithRefs = Prisma.InventoryTransactionGetPayload<{ include: typeof TXN_INCLUDE }>

function toTxnJson(t: TxnWithRefs) {
  return {
    id: t.id,
    projectId: t.projectId,
    materialId: t.materialId,
    txnType: t.txnType as TxnType,
    quantity: Math.abs(t.quantity),
    unitRate: t.unitRate,
    vendorId: t.vendorId,
    challanNumber: t.challanNumber,
    outReason: (t.outReason as OutReason | null) ?? null,
    adjustmentDirection:
      t.txnType === 'ADJUSTMENT' ? (t.quantity >= 0 ? 'INCREASE' : 'DECREASE') : null,
    txnDate: t.txnDate.toISOString(),
    dailyLogId: t.dailyLogId,
    remarks: t.remarks,
    createdById: t.recordedById,
    createdAt: t.createdAt.toISOString(),
    isVoided: t.voidedAt !== null,
    voidedAt: t.voidedAt ? t.voidedAt.toISOString() : null,
    voidReason: t.voidReason,
    voidedById: t.voidedById,
    material: t.material,
    createdBy: t.recordedBy,
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const url = new URL(req.url)
  const materialId = url.searchParams.get('materialId')
  const txnType = url.searchParams.get('txnType')
  const includeVoided = url.searchParams.get('includeVoided') === 'true'
  const from = parseDay(url.searchParams.get('from'))
  const to = parseDay(url.searchParams.get('to'))

  if (txnType && !TXN_TYPES.includes(txnType as TxnType)) {
    return fail('Invalid txnType filter', 400)
  }

  const where: Prisma.InventoryTransactionWhereInput = {
    projectId: id,
    ...(materialId ? { materialId } : {}),
    ...(txnType ? { txnType } : {}),
    ...(includeVoided ? {} : { voidedAt: null }),
    ...(from || to ? { txnDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  }

  const transactions = await db.inventoryTransaction.findMany({
    where,
    include: TXN_INCLUDE,
    orderBy: [{ txnDate: 'desc' }, { createdAt: 'desc' }],
  })

  return ok(transactions.map(toTxnJson))
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'stock:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }
  if (project.status !== 'ACTIVE') {
    return fail('Stock can only be posted to an active project', 422)
  }

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const materialId = typeof body.materialId === 'string' ? body.materialId : ''
  const material = materialId ? await db.material.findUnique({ where: { id: materialId } }) : null
  if (!material) return fail('Material not found', 404)

  const txnType = typeof body.txnType === 'string' ? body.txnType : ''
  if (!TXN_TYPES.includes(txnType as TxnType)) {
    return fail(`txnType must be one of: ${TXN_TYPES.join(', ')}`, 400)
  }

  const quantity = num(body.quantity)
  if (!(quantity > 0)) return fail('Quantity must be greater than zero', 400)

  const txnDate = parseDay(body.txnDate)
  if (!txnDate) return fail('A valid transaction date (YYYY-MM-DD) is required', 400)
  const todayUtc = new Date(new Date().toISOString().slice(0, 10))
  if (txnDate.getTime() > todayUtc.getTime()) {
    return fail('Transaction date cannot be in the future', 422)
  }

  let outReason: string | null = null
  if (txnType === 'OUT') {
    const raw = typeof body.outReason === 'string' ? body.outReason : ''
    if (!OUT_REASONS.includes(raw as OutReason)) {
      return fail(`outReason is required for OUT and must be one of: ${OUT_REASONS.join(', ')}`, 400)
    }
    outReason = raw
  }

  let signedQuantity = quantity
  if (txnType === 'ADJUSTMENT') {
    const direction = typeof body.adjustmentDirection === 'string' ? body.adjustmentDirection : ''
    if (!ADJUSTMENT_DIRECTIONS.includes(direction as AdjustmentDirection)) {
      return fail(`adjustmentDirection is required for ADJUSTMENT and must be one of: ${ADJUSTMENT_DIRECTIONS.join(', ')}`, 400)
    }
    if (direction === 'DECREASE') signedQuantity = -quantity
  }

  let unitRate: number | null = null
  if (body.unitRate !== undefined && body.unitRate !== null && body.unitRate !== '') {
    const rate = num(body.unitRate)
    if (!(rate >= 0)) return fail('unitRate must be zero or more', 400)
    unitRate = rate
  }

  let vendorId: string | null = null
  if (body.vendorId !== undefined && body.vendorId !== null && body.vendorId !== '') {
    if (typeof body.vendorId !== 'string') return fail('Invalid vendorId', 400)
    const vendor = await db.supplier.findUnique({ where: { id: body.vendorId } })
    if (!vendor) return fail('Vendor not found', 404)
    vendorId = vendor.id
  }

  let dailyLogId: string | null = null
  if (body.dailyLogId !== undefined && body.dailyLogId !== null && body.dailyLogId !== '') {
    if (typeof body.dailyLogId !== 'string') return fail('Invalid dailyLogId', 400)
    const log = await db.dailyLog.findUnique({ where: { id: body.dailyLogId } })
    if (!log || log.projectId !== id) return fail('dailyLogId must reference a log on this project', 400)
    dailyLogId = log.id
  }

  const created = await db.$transaction(async (tx) => {
    const plan = await tx.materialPlan.findUnique({ where: { projectId_materialId: { projectId: id, materialId } } })
    if (!plan) return { error: 'A project material plan is required before posting stock' as const }
    if (!material.isActive) return { error: 'The material is inactive' as const }

    const txns = await tx.inventoryTransaction.findMany({
      where: { projectId: id, materialId, voidedAt: null },
      select: { txnType: true, quantity: true },
    })
    const balance = txns.reduce(
      (sum, t) => (t.txnType === 'OUT' ? sum - t.quantity : sum + t.quantity),
      plan.openingQuantity
    )

    const decreases = txnType === 'OUT' || (txnType === 'ADJUSTMENT' && signedQuantity < 0)
    if (decreases && quantity > balance) {
      return { error: `Insufficient stock available (${balance} ${material.unit})` as const }
    }

    const txn = await tx.inventoryTransaction.create({
      data: {
        projectId: id,
        materialId,
        txnType,
        quantity: signedQuantity,
        unitRate,
        vendorId,
        challanNumber: optString(body.challanNumber),
        outReason,
        txnDate,
        dailyLogId,
        remarks: optString(body.remarks),
        recordedById: user.id,
      },
      include: TXN_INCLUDE,
    })
    return { txn }
  })

  if ('error' in created) return fail(created.error ?? 'Transaction could not be recorded', 422)

  await writeAudit({
    action: 'TXN_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'stock-txn',
    entityId: created.txn.id,
    projectId: id,
    meta: {
      txnType,
      quantity,
      material: material.name,
      outReason,
      adjustmentDirection: txnType === 'ADJUSTMENT' ? (signedQuantity >= 0 ? 'INCREASE' : 'DECREASE') : null,
      txnDate: txnDate.toISOString().slice(0, 10),
    },
    ip: getClientIp(req),
  })

  return ok(toTxnJson(created.txn))
}
