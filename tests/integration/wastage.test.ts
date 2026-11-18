import { describe, test, expect, afterAll } from 'vitest'
import { GET as wastageGET } from '@/app/api/projects/[id]/inventory/wastage/route'
import { GET as overviewGET } from '@/app/api/wastage/overview/route'
import { POST as logsPOST } from '@/app/api/projects/[id]/daily-logs/route'
import { POST as txnsPOST } from '@/app/api/projects/[id]/inventory/transactions/route'
import { db } from '@/lib/db'
import {
  auth,
  P,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  YASHMEEN_EMAIL,
  createProjectFixture,
  createMaterialFixture,
  getUserId,
} from '../helpers'

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)

interface WastageItem {
  materialId: string
  materialName: string
  unit: string
  plannedQuantity: number
  expectedQuantity: number
  consumedQuantity: number
  overrunQuantity: number
  overrunPercent: number | null
  thresholdPercent: number
  recordedWastageQuantity: number
  estimatedLoss: number
  status: string
}

interface OverviewRow extends WastageItem {
  projectId: string
  projectName: string
  progressPercent: number
}

const fixture = await createProjectFixture('waste', { pmEmail: RIYA_EMAIL })
const riyaId = await getUserId(RIYA_EMAIL)
const yashProject = await db.project.findUniqueOrThrow({ where: { code: 'FOS-002' } })

const matOver = await createMaterialFixture(`WasteOver-${RUN_TAG}`) // will be OVERRUN after the log exists
const matOk = await createMaterialFixture(`WasteOk-${RUN_TAG}`) // stays OK
const matNull = await createMaterialFixture(`WasteNull-${RUN_TAG}`) // null rate → estimatedLoss 0

// planned 1000 @ ₹50, threshold 5% → at 50% progress expected 500
await db.materialPlan.create({
  data: {
    projectId: fixture.projectId,
    materialId: matOver,
    plannedQuantity: 1000,
    plannedUnitRate: 50,
    wastageThresholdPct: 5,
    status: 'APPROVED',
    createdById: riyaId,
  },
})
// planned 800, no rate (null → loss 0), threshold 5%
await db.materialPlan.create({
  data: {
    projectId: fixture.projectId,
    materialId: matOk,
    plannedQuantity: 800,
    wastageThresholdPct: 5,
    status: 'APPROVED',
    createdById: riyaId,
  },
})
// planned 600 @ ₹20, threshold 50% (never trips)
await db.materialPlan.create({
  data: {
    projectId: fixture.projectId,
    materialId: matNull,
    plannedQuantity: 600,
    plannedUnitRate: 20,
    wastageThresholdPct: 50,
    status: 'APPROVED',
    createdById: riyaId,
  },
})

async function postTxn(materialId: string, txnType: 'IN' | 'OUT', quantity: number, outReason?: string) {
  const riya = await loginAs(RIYA_EMAIL)
  await okBody(
    await txnsPOST(
      auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
        body: { materialId, txnType, quantity, outReason, txnDate: day(6) },
      }),
      P(fixture.projectId)
    )
  )
}

let logId = ''

afterAll(async () => {
  await fixture.dispose()
  for (const id of [matOver, matOk, matNull]) {
    await db.material.delete({ where: { id } }).catch(() => undefined)
  }
})

/** Recomputes the whole wastage report straight from the test DB. */
async function expectedFromDb(): Promise<{ progressPercent: number; items: Map<string, WastageItem> }> {
  const project = await db.project.findUniqueOrThrow({ where: { id: fixture.projectId } })
  const plans = await db.materialPlan.findMany({
    where: { projectId: fixture.projectId },
    include: { material: true },
  })
  const latestLog = await db.dailyLog.findFirst({
    where: { projectId: fixture.projectId },
    orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
    select: { progressPercent: true },
  })
  const txns = await db.inventoryTransaction.findMany({
    where: { projectId: fixture.projectId, voidedAt: null },
    select: { materialId: true, txnType: true, quantity: true, outReason: true },
  })
  const progressPercent = latestLog?.progressPercent ?? 0
  const items = new Map<string, WastageItem>()
  for (const plan of plans) {
    const rows = txns.filter((t) => t.materialId === plan.materialId && t.txnType === 'OUT')
    const consumed = rows.reduce((sum, t) => sum + t.quantity, 0)
    const recordedWastage = rows
      .filter((t) => t.outReason === 'DAMAGED' || t.outReason === 'LOST')
      .reduce((sum, t) => sum + t.quantity, 0)
    const expected = plan.plannedQuantity * (progressPercent / 100)
    const overrun = Math.max(consumed - expected, 0)
    const overrunPercent = expected > 0 ? (overrun / expected) * 100 : null
    const threshold = plan.wastageThresholdPct ?? project.wastageThresholdPct
    const status =
      progressPercent === 0 && consumed > 0 ? 'NO_BASELINE' : overrunPercent !== null && overrunPercent > threshold ? 'OVERRUN' : 'OK'
    items.set(plan.materialId, {
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
    })
  }
  return { progressPercent, items }
}

describe('GET /api/projects/:id/inventory/wastage', () => {
  test('phase 1 — no logs yet: consumption without a baseline → NO_BASELINE', async () => {
    await postTxn(matOver, 'IN', 600)
    await postTxn(matOver, 'OUT', 550, 'USED')
    await postTxn(matOk, 'IN', 100)
    await postTxn(matOk, 'OUT', 30, 'USED')
    await postTxn(matOk, 'OUT', 5, 'DAMAGED')
    await postTxn(matNull, 'IN', 400)
    await postTxn(matNull, 'OUT', 10, 'USED')

    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ progressPercent: number; items: WastageItem[] }>(
      await wastageGET(auth(`/api/projects/${fixture.projectId}/inventory/wastage`, riya), P(fixture.projectId))
    )
    expect(body.data.progressPercent).toBe(0)
    const byMaterial = new Map(body.data.items.map((i) => [i.materialId, i]))
    expect(byMaterial.get(matOver)!.status).toBe('NO_BASELINE')
    expect(byMaterial.get(matOk)!.status).toBe('NO_BASELINE')
    expect(byMaterial.get(matNull)!.status).toBe('NO_BASELINE')
    // NO_BASELINE still computes the overrun at 0% progress
    expect(byMaterial.get(matOver)!.overrunQuantity).toBe(550)
    expect(byMaterial.get(matOver)!.estimatedLoss).toBe(27_500) // 550 × 50
  })

  test('phase 2 — with a 50% log: statuses become OVERRUN / OK and match DB-computed values', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const logBody = await okBody<{ id: string }>(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: day(2), progressPercent: 50, workSummary: `T8 halfway ${RUN_TAG}` },
        }),
        P(fixture.projectId)
      )
    )
    logId = logBody.data.id

    const body = await okBody<{ progressPercent: number; items: WastageItem[] }>(
      await wastageGET(auth(`/api/projects/${fixture.projectId}/inventory/wastage`, riya), P(fixture.projectId))
    )
    expect(body.data.progressPercent).toBe(50)

    const expected = await expectedFromDb()
    expect(body.data.progressPercent).toBe(expected.progressPercent)
    expect(body.data.items.length).toBe(expected.items.size)

    const over = body.data.items.find((i) => i.materialId === matOver)!
    // consumed 550 vs expected 500 → overrun 50 (10% > 5% threshold)
    expect(over.status).toBe('OVERRUN')
    expect(over.expectedQuantity).toBe(500)
    expect(over.overrunQuantity).toBe(50)
    expect(over.overrunPercent).toBeCloseTo(10, 5)
    expect(over.estimatedLoss).toBe(2500) // 50 × 50 — the formula under test

    const ok = body.data.items.find((i) => i.materialId === matOk)!
    expect(ok.status).toBe('OK')
    expect(ok.consumedQuantity).toBe(35) // 30 USED + 5 DAMAGED
    expect(ok.recordedWastageQuantity).toBe(5)
    expect(ok.overrunQuantity).toBe(0)
    expect(ok.estimatedLoss).toBe(0) // plannedUnitRate null → × 0

    const nullRate = body.data.items.find((i) => i.materialId === matNull)!
    expect(nullRate.status).toBe('OK')
    expect(nullRate.estimatedLoss).toBe(0)

    // full comparison against DB-computed expectations
    for (const item of body.data.items) {
      const exp = expected.items.get(item.materialId)!
      expect(item.materialName).toBe(exp.materialName)
      expect(item.plannedQuantity).toBe(exp.plannedQuantity)
      expect(item.expectedQuantity).toBeCloseTo(exp.expectedQuantity, 6)
      expect(item.consumedQuantity).toBeCloseTo(exp.consumedQuantity, 6)
      expect(item.overrunQuantity).toBeCloseTo(exp.overrunQuantity, 6)
      if (exp.overrunPercent === null) {
        expect(item.overrunPercent).toBeNull()
      } else {
        expect(item.overrunPercent).not.toBeNull()
        expect(item.overrunPercent!).toBeCloseTo(exp.overrunPercent, 6)
      }
      expect(item.thresholdPercent).toBe(exp.thresholdPercent)
      expect(item.recordedWastageQuantity).toBeCloseTo(exp.recordedWastageQuantity, 6)
      expect(item.estimatedLoss).toBeCloseTo(exp.estimatedLoss, 6)
      expect(item.status).toBe(exp.status)
    }

    // OVERRUN rows sort first
    expect(body.data.items[0].materialId).toBe(matOver)
  })

  test('PM scoping → 403; unknown project → 404; VIEWER may read', async () => {
    const yash = await loginAs(YASHMEEN_EMAIL)
    await errBody(
      await wastageGET(auth(`/api/projects/${fixture.projectId}/inventory/wastage`, yash), P(fixture.projectId)),
      403
    )
    await errBody(await wastageGET(auth('/api/projects/nope/inventory/wastage', yash), P('nope')), 404)
    const viewerBody = await okBody<{ items: WastageItem[] }>(
      await wastageGET(
        auth(`/api/projects/${fixture.projectId}/inventory/wastage`, await loginAs('aisha@forgeos.local')),
        P(fixture.projectId)
      )
    )
    expect(viewerBody.data.items.length).toBe(3)
  })
})

describe('GET /api/wastage/overview', () => {
  test('PM overview is scoped to her own projects; statuses covered', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{
      items: OverviewRow[]
      portfolio: { totalPlanned: number; totalConsumed: number; avgOverrunPct: number | null }
    }>(await overviewGET(auth('/api/wastage/overview', riya)))

    // riya owns FOS-001, FOS-003, FOS-005 and the fixture — never yashmeen's projects
    const riyaProjectIds = new Set(
      (await db.project.findMany({ where: { assignedPmId: riyaId }, select: { id: true } })).map((p) => p.id)
    )
    expect(riyaProjectIds.has(fixture.projectId)).toBe(true)
    for (const row of body.data.items) {
      expect(riyaProjectIds.has(row.projectId)).toBe(true)
    }
    expect(body.data.items.some((r) => r.projectId === yashProject.id)).toBe(false)

    // the synthetic scenario shows up with OVERRUN + OK statuses
    const fixtureRows = body.data.items.filter((r) => r.projectId === fixture.projectId)
    expect(fixtureRows.length).toBe(3)
    expect(fixtureRows.some((r) => r.status === 'OVERRUN')).toBe(true)
    expect(fixtureRows.filter((r) => r.status === 'OK').length).toBe(2)
    const overRow = fixtureRows.find((r) => r.materialId === matOver)!
    expect(overRow.estimatedLoss).toBe(2500)
    expect(overRow.progressPercent).toBe(50)

    // portfolio totals are the sums over the returned rows
    const totalPlanned = body.data.items.reduce((s, i) => s + i.plannedQuantity, 0)
    const totalConsumed = body.data.items.reduce((s, i) => s + i.consumedQuantity, 0)
    expect(body.data.portfolio.totalPlanned).toBeCloseTo(totalPlanned, 6)
    expect(body.data.portfolio.totalConsumed).toBeCloseTo(totalConsumed, 6)
    const pctValues = body.data.items.map((i) => i.overrunPercent).filter((v): v is number => v !== null)
    const avg = pctValues.length > 0 ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null
    if (avg === null) {
      expect(body.data.portfolio.avgOverrunPct).toBeNull()
    } else {
      expect(body.data.portfolio.avgOverrunPct).not.toBeNull()
      expect(body.data.portfolio.avgOverrunPct!).toBeCloseTo(avg, 6)
    }
  })

  test('admin overview spans every project, including other PMs work', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ items: OverviewRow[] }>(await overviewGET(auth('/api/wastage/overview', admin)))
    expect(body.data.items.some((r) => r.projectId === yashProject.id)).toBe(true)
    expect(body.data.items.some((r) => r.projectId === fixture.projectId)).toBe(true)
  })
})
