import { describe, test, expect, afterAll } from 'vitest'
import { GET as inventoryGET } from '@/app/api/projects/[id]/inventory/route'
import { GET as txnsGET, POST as txnsPOST } from '@/app/api/projects/[id]/inventory/transactions/route'
import { POST as voidPOST } from '@/app/api/projects/[id]/inventory/transactions/[txnId]/void/route'
import { db } from '@/lib/db'
import {
  auth,
  P,
  PT,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  AISHA_EMAIL,
  YASHMEEN_EMAIL,
  createProjectFixture,
  createMaterialFixture,
  getUserId,
} from '../helpers'

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)

interface TxnRow {
  id: string
  projectId: string
  materialId: string
  txnType: string
  quantity: number
  unitRate: number | null
  vendorId: string | null
  challanNumber: string | null
  outReason: string | null
  adjustmentDirection: string | null
  txnDate: string
  remarks: string | null
  isVoided: boolean
  voidedAt: string | null
  voidReason: string | null
  material: { name: string; unit: string }
  createdBy: { id: string; name: string }
}

interface InventoryRow {
  materialId: string
  materialName: string
  unit: string
  openingStock: number
  totalIn: number
  totalOut: number
  adjustmentIn: number
  adjustmentOut: number
  availableStock: number
  plannedQuantity: number
  lowStockThreshold: number | null
  isLowStock: boolean
}

const fixture = await createProjectFixture('stock', { pmEmail: RIYA_EMAIL }) // ACTIVE
const holdFixture = await createProjectFixture('stockhold', { pmEmail: RIYA_EMAIL, status: 'ON_HOLD' })
const mat = await createMaterialFixture(`Stock-${RUN_TAG}`)
const matNoPlan = await createMaterialFixture(`NoPlan-${RUN_TAG}`)
const matLow = await createMaterialFixture(`Low-${RUN_TAG}`) // plan: opening 40, threshold 40 → inclusive low stock
const matMid = await createMaterialFixture(`Mid-${RUN_TAG}`) // plan: opening 41, threshold 40 → not low
const riyaId = await getUserId(RIYA_EMAIL)

const supplier = await db.supplier.create({
  data: { name: `T8 Supplier ${RUN_TAG}`, phone: '9876543210', email: `t8-${RUN_TAG}@example.com` },
})

// main plan: opening 100, rate 50, threshold 100 (available == threshold → low stock INCLUSIVE)
await db.materialPlan.create({
  data: {
    projectId: fixture.projectId,
    materialId: mat,
    openingQuantity: 100,
    plannedQuantity: 1000,
    plannedUnitRate: 50,
    lowStockThreshold: 100,
    wastageThresholdPct: 10,
    status: 'APPROVED',
    createdById: riyaId,
  },
})
await db.materialPlan.create({
  data: { projectId: fixture.projectId, materialId: matLow, openingQuantity: 40, plannedQuantity: 100, lowStockThreshold: 40, status: 'APPROVED', createdById: riyaId },
})
await db.materialPlan.create({
  data: { projectId: fixture.projectId, materialId: matMid, openingQuantity: 41, plannedQuantity: 100, lowStockThreshold: 40, status: 'APPROVED', createdById: riyaId },
})

let inTxnId = ''
let outTxnId = ''
let adjDecTxnId = ''
let adjIncTxnId = ''

afterAll(async () => {
  await fixture.dispose()
  await holdFixture.dispose()
  await db.supplier.delete({ where: { id: supplier.id } }).catch(() => undefined)
  for (const id of [mat, matNoPlan, matLow, matMid]) {
    await db.material.delete({ where: { id } }).catch(() => undefined)
  }
})

describe('POST /api/projects/:id/inventory/transactions', () => {
  test('only ACTIVE projects accept stock → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await txnsPOST(
        auth(`/api/projects/${holdFixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P(holdFixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('active')
  })

  test('a material plan is required → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: matNoPlan, txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('plan')
  })

  test('txnDate in the future → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: day(-1) },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('future')
  })

  test('field validation → 400; unknown material/project → 404/404', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'MAGIC', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 0, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: 'nope' },
        }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'OUT', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      400
    ) // OUT needs outReason
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: 'nope', txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      404
    )
    await errBody(
      await txnsPOST(
        auth('/api/projects/nope/inventory/transactions', riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P('nope')
      ),
      404
    )
  })

  test('ADJUSTMENT requires a direction → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'ADJUSTMENT', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      400
    )
    expect(body.message).toContain('adjustmentDirection')
  })

  test('IN with vendor + challan works and audits TXN_CREATE', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<TxnRow>(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: {
            materialId: mat,
            txnType: 'IN',
            quantity: 200,
            unitRate: 48,
            vendorId: supplier.id,
            challanNumber: `CH-${RUN_TAG}`,
            txnDate: day(5),
            remarks: `T8 inward ${RUN_TAG}`,
          },
        }),
        P(fixture.projectId)
      )
    )
    inTxnId = body.data.id
    expect(body.data.txnType).toBe('IN')
    expect(body.data.quantity).toBe(200)
    expect(body.data.unitRate).toBe(48)
    expect(body.data.vendorId).toBe(supplier.id)
    expect(body.data.challanNumber).toBe(`CH-${RUN_TAG}`)
    expect(body.data.isVoided).toBe(false)
    expect(body.data.voidedAt).toBeNull()
    expect(body.data.createdBy.id).toBe(riyaId)
    expect(body.data.txnDate).toBe(`${day(5)}T00:00:00.000Z`)
    const audit = await db.auditLog.findFirst({
      where: { action: 'TXN_CREATE', entityId: inTxnId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)
  })

  test('OUT beyond balance → 422 with the available quantity', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'OUT', quantity: 500, outReason: 'USED', txnDate: day(4) },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('Insufficient stock available (300 bag)')
  })

  test('ADJUSTMENT DECREASE below balance → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'ADJUSTMENT', quantity: 400, adjustmentDirection: 'DECREASE', txnDate: day(4) },
        }),
        P(fixture.projectId)
      ),
      422
    )
  })

  test('OUT, ADJUSTMENT DECREASE and INCREASE post correctly', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const out = await okBody<TxnRow>(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'OUT', quantity: 30, outReason: 'USED', txnDate: day(4) },
        }),
        P(fixture.projectId)
      )
    )
    outTxnId = out.data.id
    expect(out.data.outReason).toBe('USED')
    expect(out.data.adjustmentDirection).toBeNull()

    const dec = await okBody<TxnRow>(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'ADJUSTMENT', quantity: 70, adjustmentDirection: 'DECREASE', txnDate: day(3) },
        }),
        P(fixture.projectId)
      )
    )
    adjDecTxnId = dec.data.id
    expect(dec.data.adjustmentDirection).toBe('DECREASE')
    expect(dec.data.quantity).toBe(70) // absolute value in the response
    const dbDec = await db.inventoryTransaction.findUniqueOrThrow({ where: { id: adjDecTxnId } })
    expect(dbDec.quantity).toBe(-70) // stored signed

    const inc = await okBody<TxnRow>(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'ADJUSTMENT', quantity: 10, adjustmentDirection: 'INCREASE', txnDate: day(2) },
        }),
        P(fixture.projectId)
      )
    )
    adjIncTxnId = inc.data.id
    expect(inc.data.adjustmentDirection).toBe('INCREASE')
  })

  test('PM scoping: other PM → 403; VIEWER → 403', async () => {
    const yash = await loginAs(YASHMEEN_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, yash, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      403
    )
    await errBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, viewer, {
          body: { materialId: mat, txnType: 'IN', quantity: 5, txnDate: day(2) },
        }),
        P(fixture.projectId)
      ),
      403
    )
  })
})

describe('GET /api/projects/:id/inventory/transactions (ledger)', () => {
  test('filters: materialId, txnType, from/to; bad txnType → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const all = await okBody<TxnRow[]>(
      await txnsGET(auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya), P(fixture.projectId))
    )
    expect(all.data.length).toBe(4)
    expect(all.data.every((t) => t.isVoided === false)).toBe(true)
    // ordered by txnDate desc then createdAt desc
    const dates = all.data.map((t) => t.txnDate)
    expect([...dates].sort().reverse()).toEqual(dates)

    const other = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?materialId=${matNoPlan}`, riya),
        P(fixture.projectId)
      )
    )
    expect(other.data).toEqual([])

    const outs = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?txnType=OUT`, riya),
        P(fixture.projectId)
      )
    )
    expect(outs.data.map((t) => t.id)).toEqual([outTxnId])

    const adjs = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?txnType=ADJUSTMENT`, riya),
        P(fixture.projectId)
      )
    )
    expect(adjs.data.map((t) => t.id).sort()).toEqual([adjDecTxnId, adjIncTxnId].sort())

    await errBody(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?txnType=BOGUS`, riya),
        P(fixture.projectId)
      ),
      400
    )

    const ranged = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?from=${day(3)}&to=${day(3)}`, riya),
        P(fixture.projectId)
      )
    )
    expect(ranged.data.map((t) => t.id)).toEqual([adjDecTxnId])

    const fromOnly = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?from=${day(3)}`, riya),
        P(fixture.projectId)
      )
    )
    // day(3) and newer: the two ADJUSTMENT rows (day(3) and day(2))
    expect(fromOnly.data.map((t) => t.id).sort()).toEqual([adjDecTxnId, adjIncTxnId].sort())
  })
})

describe('GET /api/projects/:id/inventory (rows)', () => {
  test('computes opening/in/out/adjustments/available and INCLUSIVE isLowStock', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<InventoryRow[]>(
      await inventoryGET(auth(`/api/projects/${fixture.projectId}/inventory`, riya), P(fixture.projectId))
    )
    const byMaterial = new Map(body.data.map((r) => [r.materialId, r]))

    const main = byMaterial.get(mat)!
    expect(main.openingStock).toBe(100)
    expect(main.totalIn).toBe(200)
    expect(main.totalOut).toBe(30)
    expect(main.adjustmentIn).toBe(10)
    expect(main.adjustmentOut).toBe(70)
    expect(main.availableStock).toBe(210) // 100 + 200 - 30 + 10 - 70
    expect(main.isLowStock).toBe(false) // 210 > 100

    // inclusive: available (40) === threshold (40) → low
    const low = byMaterial.get(matLow)!
    expect(low.availableStock).toBe(40)
    expect(low.isLowStock).toBe(true)
    // one above threshold (41 > 40) → not low
    const mid = byMaterial.get(matMid)!
    expect(mid.availableStock).toBe(41)
    expect(mid.isLowStock).toBe(false)

    // cross-check the main row against the DB
    const txns = await db.inventoryTransaction.findMany({
      where: { projectId: fixture.projectId, materialId: mat, voidedAt: null },
      select: { txnType: true, quantity: true },
    })
    const expected =
      100 +
      txns.reduce((sum, t) => (t.txnType === 'OUT' ? sum - t.quantity : sum + t.quantity), 0)
    expect(main.availableStock).toBe(expected)
  })

  test('PM scoping → 403; unknown project → 404', async () => {
    const yash = await loginAs(YASHMEEN_EMAIL)
    await errBody(
      await inventoryGET(auth(`/api/projects/${fixture.projectId}/inventory`, yash), P(fixture.projectId)),
      403
    )
    await errBody(await inventoryGET(auth('/api/projects/nope/inventory', yash), P('nope')), 404)
  })
})

describe('POST .../transactions/:txnId/void', () => {
  test('PM cannot void → 403; short reason → 400; unknown txn → 404', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/${adjIncTxnId}/void`, riya, { body: { reason: 'pm cannot void' } }),
        PT(fixture.projectId, adjIncTxnId)
      ),
      403
    )
    await errBody(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/${adjIncTxnId}/void`, admin, { body: { reason: 'xx' } }),
        PT(fixture.projectId, adjIncTxnId)
      ),
      400
    )
    await errBody(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/nope/void`, admin, { body: { reason: 'not found' } }),
        PT(fixture.projectId, 'nope')
      ),
      404
    )
  })

  test('admin voids an adjustment; ledger hides it unless includeVoided', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ transaction: { id: string; isVoided: boolean; voidedAt: string; voidReason: string } }>(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/${adjIncTxnId}/void`, admin, {
          body: { reason: `T8 void reason ${RUN_TAG}` },
        }),
        PT(fixture.projectId, adjIncTxnId)
      )
    )
    expect(body.data.transaction.isVoided).toBe(true)
    expect(body.data.transaction.voidedAt).toBeTypeOf('string')
    expect(body.data.transaction.voidReason).toBe(`T8 void reason ${RUN_TAG}`)
    const audit = await db.auditLog.findFirst({
      where: { action: 'TXN_VOID', entityId: adjIncTxnId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()

    const riya = await loginAs(RIYA_EMAIL)
    const hidden = await okBody<TxnRow[]>(
      await txnsGET(auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya), P(fixture.projectId))
    )
    expect(hidden.data.some((t) => t.id === adjIncTxnId)).toBe(false)
    const included = await okBody<TxnRow[]>(
      await txnsGET(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions?includeVoided=true`, riya),
        P(fixture.projectId)
      )
    )
    const voided = included.data.find((t) => t.id === adjIncTxnId)
    expect(voided).toBeTruthy()
    expect(voided!.isVoided).toBe(true)
    expect(voided!.voidReason).toBe(`T8 void reason ${RUN_TAG}`)
  })

  test('voiding the same txn again → 409', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/${adjIncTxnId}/void`, admin, {
          body: { reason: 'voiding twice' },
        }),
        PT(fixture.projectId, adjIncTxnId)
      ),
      409
    )
  })

  test('balances exclude voided rows', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<InventoryRow[]>(
      await inventoryGET(auth(`/api/projects/${fixture.projectId}/inventory`, riya), P(fixture.projectId))
    )
    const main = body.data.find((r) => r.materialId === mat)!
    // the +10 INCREASE adjustment is voided → back to 100 + 200 - 30 - 70 = 200
    expect(main.adjustmentIn).toBe(0)
    expect(main.availableStock).toBe(200)
  })

  test('cannot void an IN that would make the balance negative → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    // consume nearly everything: balance 200 → 10
    await okBody(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'OUT', quantity: 190, outReason: 'USED', txnDate: day(1) },
        }),
        P(fixture.projectId)
      )
    )
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await errBody(
      await voidPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions/${inTxnId}/void`, admin, {
          body: { reason: 'would go negative' },
        }),
        PT(fixture.projectId, inTxnId)
      ),
      422
    )
    expect(body.message).toContain('negative')
    // the failed void must not have marked the txn
    const dbTxn = await db.inventoryTransaction.findUniqueOrThrow({ where: { id: inTxnId } })
    expect(dbTxn.voidedAt).toBeNull()
  })
})
