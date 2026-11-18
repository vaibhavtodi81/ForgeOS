import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, pmOwns, parsePagination, readJson, parseDate } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { TXN_TYPES } from '@/lib/forgeos-types'
import type { TxnRow, TxnType } from '@/lib/forgeos-types'

type TxnWithRefs = Prisma.InventoryTransactionGetPayload<{
  include: { project: true; material: true; supplier: true; recordedBy: true }
}>

function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

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

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)

  const where: Prisma.InventoryTransactionWhereInput = {}
  const projectId = url.searchParams.get('projectId')
  if (projectId) where.projectId = projectId
  const materialId = url.searchParams.get('materialId')
  if (materialId) where.materialId = materialId
  const type = url.searchParams.get('type')
  if (type) {
    if (!TXN_TYPES.includes(type as TxnType)) return fail('Invalid transaction type filter')
    where.txnType = type
  }
  const voided = url.searchParams.get('voided')
  if (voided === 'true') where.voidedAt = { not: null }
  else if (voided === 'false') where.voidedAt = null
  if (user.role === 'PROJECT_MANAGER') where.project = { pmId: user.id }

  const [total, voidedCount, inRows, txns] = await Promise.all([
    db.inventoryTransaction.count({ where }),
    db.inventoryTransaction.count({ where: { ...where, voidedAt: { not: null } } }),
    db.inventoryTransaction.findMany({
      where: { ...where, voidedAt: null, txnType: 'IN' },
      select: { quantity: true, unitRate: true },
    }),
    db.inventoryTransaction.findMany({
      where,
      include: { project: true, material: true, supplier: true, recordedBy: true },
      orderBy: [{ txnDate: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    }),
  ])

  let spend = 0
  for (const row of inRows) {
    spend += row.quantity * row.unitRate
  }

  return ok({
    items: txns.map(toTxnRow),
    total,
    page,
    limit,
    summary: { spend, txnCount: total, voidedCount },
  })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN', 'PROJECT_MANAGER'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  const project = projectId ? await db.project.findUnique({ where: { id: projectId } }) : null
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.pmId)) return fail('You can only access your own projects', 403)

  const materialId = typeof body.materialId === 'string' ? body.materialId : ''
  const material = materialId ? await db.material.findUnique({ where: { id: materialId } }) : null
  if (!material || !material.isActive) return fail('Material not found or inactive')

  let supplierId: string | null = null
  if (body.supplierId !== null && body.supplierId !== undefined && body.supplierId !== '') {
    if (typeof body.supplierId !== 'string') return fail('Invalid supplier id')
    const supplier = await db.supplier.findUnique({ where: { id: body.supplierId } })
    if (!supplier) return fail('Supplier not found')
    supplierId = supplier.id
  }

  const txnType = body.txnType
  if (typeof txnType !== 'string' || !TXN_TYPES.includes(txnType as TxnType)) {
    return fail('Invalid transaction type')
  }

  const quantity = num(body.quantity)
  if (txnType === 'ADJUSTMENT') {
    if (!Number.isFinite(quantity) || quantity === 0) {
      return fail('Adjustment quantity cannot be zero')
    }
  } else if (!(quantity > 0)) {
    return fail('Quantity must be greater than zero')
  }

  const unitRate =
    body.unitRate === undefined || body.unitRate === null ? 0 : num(body.unitRate)
  if (!(unitRate >= 0)) return fail('Unit rate cannot be negative')

  let txnDate = new Date()
  if (body.txnDate !== undefined && body.txnDate !== null && body.txnDate !== '') {
    const parsed = parseDate(body.txnDate)
    if (!parsed) return fail('Invalid transaction date')
    txnDate = parsed
  }

  const txn = await db.inventoryTransaction.create({
    data: { projectId, materialId, supplierId, txnType, quantity, unitRate, txnDate, recordedById: user.id },
    include: { project: true, material: true, supplier: true, recordedBy: true },
  })

  await writeAudit({
    action: 'INVENTORY_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'INVENTORY_TRANSACTION',
    entityId: txn.id,
    meta: { type: txnType, material: material.name, quantity, project: project.name },
  })

  return ok({ transaction: toTxnRow(txn) })
}
