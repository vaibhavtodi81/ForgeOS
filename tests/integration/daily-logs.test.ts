import { describe, test, expect, afterAll } from 'vitest'
import { GET as logsGET, POST as logsPOST } from '@/app/api/projects/[id]/daily-logs/route'
import { GET as logGET, PATCH as logPATCH, DELETE as logDELETE } from '@/app/api/daily-logs/[id]/route'
import { GET as labourSummaryGET } from '@/app/api/projects/[id]/labour-summary/route'
import { GET as workerHistoryGET } from '@/app/api/projects/[id]/worker-count-history/route'
import { GET as machinerySummaryGET } from '@/app/api/projects/[id]/machinery-summary/route'
import { GET as machineryHistoryGET } from '@/app/api/projects/[id]/machinery-usage-history/route'
import { GET as progressHistoryGET } from '@/app/api/projects/[id]/progress-history/route'
import { GET as summaryGET } from '@/app/api/projects/[id]/summary/route'
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
  AISHA_EMAIL,
  YASHMEEN_EMAIL,
  createProjectFixture,
  createMaterialFixture,
  getUserId,
} from '../helpers'

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)
const DAY1 = day(10)
const DAY2 = day(9)
const DAY3 = day(8)

interface LogRow {
  id: string
  projectId: string
  logDate: string
  progressPercent: number
  workSummary: string
  weather: string | null
  issues: string | null
  labourEntries: { trade: string; headCount: number; hoursWorked: number }[]
  machineryEntries: { machineName: string; hoursUsed: number; fuelLitres: number | null }[]
  createdBy: { id: string; name: string }
  labourHeadCountTotal: number
  machineryHoursTotal: number
}

const fixture = await createProjectFixture('logs', { pmEmail: RIYA_EMAIL })
const holdProject = await db.project.findUniqueOrThrow({ where: { code: 'FOS-005' } }) // riya-owned ON_HOLD
const mat = await createMaterialFixture(`LogStock-${RUN_TAG}`)
const riyaId = await getUserId(RIYA_EMAIL)

let log1 = ''
let log2 = ''
let log3 = ''

afterAll(async () => {
  await fixture.dispose()
  await db.material.delete({ where: { id: mat } }).catch(() => undefined)
})

describe('POST /api/projects/:id/daily-logs', () => {
  test('only ACTIVE projects accept logs → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await logsPOST(
        auth(`/api/projects/${holdProject.id}/daily-logs`, riya, {
          body: { logDate: DAY1, progressPercent: 5, workSummary: 'On hold project' },
        }),
        P(holdProject.id)
      ),
      422
    )
    expect(body.message).toContain('active')
  })

  test('field validation → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const base = { progressPercent: 5, workSummary: 'Valid summary' }
    await errBody(
      await logsPOST(auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, { body: { ...base } }), P(fixture.projectId)),
      400
    ) // missing logDate
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, { body: { ...base, logDate: 'not-a-date' } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, { body: { ...base, logDate: DAY1, progressPercent: 150 } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, { body: { ...base, logDate: DAY1, workSummary: 'ab' } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { ...base, logDate: DAY1, labourEntries: [{ trade: 'Masonry', headCount: 0, hoursWorked: 8 }] },
        }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { ...base, logDate: DAY1, machineryEntries: [{ machineName: 'JCB', hoursUsed: 0 }] },
        }),
        P(fixture.projectId)
      ),
      400
    )
  })

  test('logDate in the future → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: day(-1), progressPercent: 5, workSummary: 'Tomorrow log' },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('future')
  })

  test('PM scoping: yashmeen → 403 on riya project; VIEWER → 403', async () => {
    const yash = await loginAs(YASHMEEN_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, yash, {
          body: { logDate: DAY1, progressPercent: 5, workSummary: 'Not my project' },
        }),
        P(fixture.projectId)
      ),
      403
    )
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, viewer, {
          body: { logDate: DAY1, progressPercent: 5, workSummary: 'Viewer write' },
        }),
        P(fixture.projectId)
      ),
      403
    )
    await errBody(await logsPOST(auth('/api/projects/nope/daily-logs', yash, { body: { logDate: DAY1, progressPercent: 1, workSummary: 'Xyz' } }), P('nope')), 404)
  })

  test('creates a log with entries and totals (day1, 10%)', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<LogRow>(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: {
            logDate: DAY1,
            progressPercent: 10,
            workSummary: `T8 slab work ${RUN_TAG}`,
            weather: 'Sunny',
            issues: null,
            labourEntries: [
              { trade: 'Masonry', headCount: 5, hoursWorked: 8 },
              { trade: 'Electrical', headCount: 2, hoursWorked: 6 },
            ],
            machineryEntries: [{ machineName: 'JCB', operatorName: 'Ravi', hoursUsed: 4, fuelLitres: 20 }],
          },
        }),
        P(fixture.projectId)
      )
    )
    log1 = body.data.id
    expect(body.data.logDate).toBe(`${DAY1}T00:00:00.000Z`)
    expect(body.data.progressPercent).toBe(10)
    expect(body.data.createdBy.id).toBe(riyaId)
    expect(body.data.labourEntries.length).toBe(2)
    expect(body.data.machineryEntries.length).toBe(1)
    expect(body.data.labourHeadCountTotal).toBe(7)
    expect(body.data.machineryHoursTotal).toBe(4)
    const audit = await db.auditLog.findFirst({
      where: { action: 'LOG_CREATE', entityId: log1 },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)
  })

  test('day3 log (30%) can be created before day2 — used for monotonicity checks', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<LogRow>(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: DAY3, progressPercent: 30, workSummary: `T8 third day ${RUN_TAG}` },
        }),
        P(fixture.projectId)
      )
    )
    log3 = body.data.id
    expect(body.data.progressPercent).toBe(30)
  })

  test('progress monotonicity: decrease vs previous → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: DAY2, progressPercent: 5, workSummary: 'Too low' },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('Progress cannot decrease')
  })

  test('progress monotonicity: exceed the following log → 422', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: DAY2, progressPercent: 40, workSummary: 'Too high' },
        }),
        P(fixture.projectId)
      ),
      422
    )
    expect(body.message).toContain('Progress cannot exceed')
  })

  test('duplicate date → 409', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: DAY1, progressPercent: 12, workSummary: 'Duplicate day' },
        }),
        P(fixture.projectId)
      ),
      409
    )
  })

  test('day2 log (20%) fits between day1 and day3', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<LogRow>(
      await logsPOST(
        auth(`/api/projects/${fixture.projectId}/daily-logs`, riya, {
          body: { logDate: DAY2, progressPercent: 20, workSummary: `T8 second day ${RUN_TAG}` },
        }),
        P(fixture.projectId)
      )
    )
    log2 = body.data.id
    expect(body.data.progressPercent).toBe(20)
  })
})

describe('GET /api/projects/:id/daily-logs', () => {
  test('lists entries with createdBy + pagination meta + from/to filter', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const list = await okBody<LogRow[], { page: number; limit: number; total: number; totalPages: number }>(
      await logsGET(auth(`/api/projects/${fixture.projectId}/daily-logs`, riya), P(fixture.projectId))
    )
    expect(list.data.length).toBe(3)
    expect(list.data.map((l) => l.progressPercent)).toEqual([30, 20, 10]) // logDate desc
    for (const row of list.data) {
      expect(row.createdBy.id).toBe(riyaId)
      expect(Array.isArray(row.labourEntries)).toBe(true)
      expect(Array.isArray(row.machineryEntries)).toBe(true)
      expect(typeof row.labourHeadCountTotal).toBe('number')
    }
    expect(list.meta?.total).toBe(3)
    expect(list.meta?.totalPages).toBe(1)

    const paged = await okBody<LogRow[], { total: number; page: number; totalPages: number }>(
      await logsGET(auth(`/api/projects/${fixture.projectId}/daily-logs?limit=2&page=1`, riya), P(fixture.projectId))
    )
    expect(paged.data.length).toBe(2)
    expect(paged.meta?.total).toBe(3)
    expect(paged.meta?.totalPages).toBe(2)

    const ranged = await okBody<LogRow[]>(
      await logsGET(auth(`/api/projects/${fixture.projectId}/daily-logs?from=${DAY2}&to=${DAY2}`, riya), P(fixture.projectId))
    )
    expect(ranged.data.length).toBe(1)
    expect(ranged.data[0].progressPercent).toBe(20)

    await errBody(
      await logsGET(auth(`/api/projects/${fixture.projectId}/daily-logs`, await loginAs(YASHMEEN_EMAIL)), P(fixture.projectId)),
      403
    )
  })
})

describe('reporting endpoints', () => {
  test('labour-summary aggregates trades and honours from/to', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{
      totalWorkerCount: number
      totalLabourHours: number
      totalLabourEntries: number
      byTrade: { trade: string; workerCount: number; labourHours: number; entries: number }[]
    }>(
      await labourSummaryGET(auth(`/api/projects/${fixture.projectId}/labour-summary`, riya), P(fixture.projectId))
    )
    expect(body.data.totalWorkerCount).toBe(7)
    expect(body.data.totalLabourHours).toBe(14) // sum of entry.hoursWorked (8 + 6)
    expect(body.data.totalLabourEntries).toBe(2)
    expect(body.data.byTrade).toEqual([
      { trade: 'Masonry', workerCount: 5, labourHours: 8, entries: 1 },
      { trade: 'Electrical', workerCount: 2, labourHours: 6, entries: 1 },
    ])

    const empty = await okBody<{ totalWorkerCount: number; byTrade: unknown[] }>(
      await labourSummaryGET(
        auth(`/api/projects/${fixture.projectId}/labour-summary?from=${DAY2}`, riya),
        P(fixture.projectId)
      )
    )
    expect(empty.data.totalWorkerCount).toBe(0)
    expect(empty.data.byTrade).toEqual([])
  })

  test('worker-count-history returns one row per log, filtered by range', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<
      { dailyLogId: string; logDate: string; totalWorkerCount: number; labourHours: number; byTrade: unknown[] }[]
    >(await workerHistoryGET(auth(`/api/projects/${fixture.projectId}/worker-count-history`, riya), P(fixture.projectId)))
    expect(body.data.length).toBe(3)
    const day1Row = body.data.find((r) => r.dailyLogId === log1)!
    expect(day1Row.totalWorkerCount).toBe(7)
    expect(day1Row.labourHours).toBe(14)
    expect(day1Row.byTrade.length).toBe(2)
    for (const row of body.data) {
      if (row.dailyLogId !== log1) expect(row.totalWorkerCount).toBe(0)
    }

    const only = await okBody<{ dailyLogId: string }[]>(
      await workerHistoryGET(
        auth(`/api/projects/${fixture.projectId}/worker-count-history?from=${DAY1}&to=${DAY1}`, riya),
        P(fixture.projectId)
      )
    )
    expect(only.data.length).toBe(1)
    expect(only.data[0].dailyLogId).toBe(log1)
  })

  test('machinery-summary aggregates by machine', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{
      totalMachineryHours: number
      totalFuelConsumption: number
      totalMachineryEntries: number
      byMachine: { machineName: string; hoursUsed: number; fuelConsumption: number; entries: number }[]
    }>(
      await machinerySummaryGET(auth(`/api/projects/${fixture.projectId}/machinery-summary`, riya), P(fixture.projectId))
    )
    expect(body.data.totalMachineryHours).toBe(4)
    expect(body.data.totalFuelConsumption).toBe(20)
    expect(body.data.totalMachineryEntries).toBe(1)
    expect(body.data.byMachine).toEqual([{ machineName: 'JCB', hoursUsed: 4, fuelConsumption: 20, entries: 1 }])
  })

  test('machinery-usage-history flattens entries with operator names', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<
      { dailyLogId: string; logDate: string; machineName: string; hoursUsed: number; fuelConsumption: number; operatorName: string | null }[]
    >(
      await machineryHistoryGET(
        auth(`/api/projects/${fixture.projectId}/machinery-usage-history`, riya),
        P(fixture.projectId)
      )
    )
    expect(body.data).toEqual([
      {
        dailyLogId: log1,
        logDate: `${DAY1}T00:00:00.000Z`,
        machineName: 'JCB',
        hoursUsed: 4,
        fuelConsumption: 20,
        operatorName: 'Ravi',
      },
    ])
  })

  test('progress-history is ascending and honors from', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ id: string; logDate: string; progressPercent: number; workSummary: string }[]>(
      await progressHistoryGET(auth(`/api/projects/${fixture.projectId}/progress-history`, riya), P(fixture.projectId))
    )
    expect(body.data.map((r) => r.progressPercent)).toEqual([10, 20, 30])
    const sliced = await okBody<{ progressPercent: number }[]>(
      await progressHistoryGET(
        auth(`/api/projects/${fixture.projectId}/progress-history?from=${DAY2}`, riya),
        P(fixture.projectId)
      )
    )
    expect(sliced.data.map((r) => r.progressPercent)).toEqual([20, 30])
  })

  test('project summary totals match the created logs', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{
      latestProgressPercent: number
      latestLogDate: string | null
      totalDailyLogs: number
      totalLabourHeadCount: number
      totalLabourHours: number
      totalMachineryHours: number
      totalMachineryFuel: number
    }>(await summaryGET(auth(`/api/projects/${fixture.projectId}/summary`, riya), P(fixture.projectId)))
    expect(body.data.latestProgressPercent).toBe(30)
    expect(body.data.latestLogDate).toBe(`${DAY3}T00:00:00.000Z`)
    expect(body.data.totalDailyLogs).toBe(3)
    expect(body.data.totalLabourHeadCount).toBe(7)
    expect(body.data.totalLabourHours).toBe(14)
    expect(body.data.totalMachineryHours).toBe(4)
    expect(body.data.totalMachineryFuel).toBe(20)
  })
})

describe('GET /api/daily-logs/:id', () => {
  test('detail includes project, totals and stockTransactions', async () => {
    // a stock txn linked to log3 needs a plan for the material
    await db.materialPlan.create({
      data: {
        projectId: fixture.projectId,
        materialId: mat,
        plannedQuantity: 500,
        plannedUnitRate: 10,
        status: 'APPROVED',
        createdById: riyaId,
      },
    })
    const riya = await loginAs(RIYA_EMAIL)
    const txn = await okBody<{ id: string }>(
      await txnsPOST(
        auth(`/api/projects/${fixture.projectId}/inventory/transactions`, riya, {
          body: { materialId: mat, txnType: 'IN', quantity: 50, unitRate: 10, txnDate: DAY3, dailyLogId: log3, remarks: `T8 linked ${RUN_TAG}` },
        }),
        P(fixture.projectId)
      )
    )
    expect(txn.data.id).toBeTruthy()

    const body = await okBody<
      LogRow & {
        project: { id: string; code: string; name: string }
        stockTransactions: { id: string; txnType: string; quantity: number; material: { name: string } }[]
      }
    >(await logGET(auth(`/api/daily-logs/${log3}`, riya), P(log3)))
    expect(body.data.project.code).toBe(`T8-${RUN_TAG}-logs`)
    expect(body.data.stockTransactions.length).toBe(1)
    expect(body.data.stockTransactions[0].id).toBe(txn.data.id)
    expect(body.data.stockTransactions[0].material.name).toContain('LogStock')

    await errBody(await logGET(auth(`/api/daily-logs/${log3}`, await loginAs(YASHMEEN_EMAIL)), P(log3)), 403)
    await errBody(await logGET(auth('/api/daily-logs/nope', riya), P('nope')), 404)
  })
})

describe('PATCH /api/daily-logs/:id', () => {
  test('updates fields within 48h, monotonic checks exclude the log itself', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<LogRow>(
      await logPATCH(
        auth(`/api/daily-logs/${log2}`, riya, {
          method: 'PATCH',
          body: { progressPercent: 25, weather: 'Rainy' },
        }),
        P(log2)
      )
    )
    expect(body.data.progressPercent).toBe(25)
    expect(body.data.weather).toBe('Rainy')
    const audit = await db.auditLog.findFirst({
      where: { action: 'LOG_UPDATE', entityId: log2 },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()

    // 25 > day1's 10 is fine; going below day1 → 422
    await errBody(
      await logPATCH(
        auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { progressPercent: 5 } }),
        P(log2)
      ),
      422
    )
    // exceeding day3's 30 → 422
    await errBody(
      await logPATCH(
        auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { progressPercent: 35 } }),
        P(log2)
      ),
      422
    )
  })

  test('future logDate → 422; duplicate date → 409; validation → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await logPATCH(auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { logDate: day(-1) } }), P(log2)),
      422
    )
    await errBody(
      await logPATCH(auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { logDate: DAY1 } }), P(log2)),
      409
    )
    await errBody(
      await logPATCH(auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { logDate: 'nope' } }), P(log2)),
      400
    )
    await errBody(
      await logPATCH(auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { workSummary: 'ab' } }), P(log2)),
      400
    )
    await errBody(
      await logPATCH(auth(`/api/daily-logs/${log2}`, riya, { method: 'PATCH', body: { progressPercent: 300 } }), P(log2)),
      400
    )
  })

  test('replaces entry arrays when provided', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<LogRow>(
      await logPATCH(
        auth(`/api/daily-logs/${log2}`, riya, {
          method: 'PATCH',
          body: { labourEntries: [{ trade: 'Plumbing', headCount: 3, hoursWorked: 7 }] },
        }),
        P(log2)
      )
    )
    expect(body.data.labourEntries).toEqual([
      expect.objectContaining({ trade: 'Plumbing', headCount: 3, hoursWorked: 7 }),
    ])
    expect(body.data.labourHeadCountTotal).toBe(3)
    const dbEntries = await db.labourEntry.count({ where: { dailyLogId: log2 } })
    expect(dbEntries).toBe(1)
  })

  test('PM edit window: logs older than 48h → 422; ADMIN exempt', async () => {
    await db.dailyLog.update({ where: { id: log1 }, data: { createdAt: new Date(Date.now() - 72 * 3_600_000) } })
    const riya = await loginAs(RIYA_EMAIL)
    const patchErr = await errBody(
      await logPATCH(
        auth(`/api/daily-logs/${log1}`, riya, { method: 'PATCH', body: { workSummary: 'Too late edit' } }),
        P(log1)
      ),
      422
    )
    expect(patchErr.message).toContain('48 hours')
    const deleteErr = await errBody(
      await logDELETE(auth(`/api/daily-logs/${log1}`, riya, { method: 'DELETE' }), P(log1)),
      422
    )
    expect(deleteErr.message).toContain('48 hours')

    const admin = await loginAs(ADMIN_EMAIL)
    await okBody(
      await logPATCH(
        auth(`/api/daily-logs/${log1}`, admin, { method: 'PATCH', body: { workSummary: 'Admin edit' } }),
        P(log1)
      )
    )
    const dbRow = await db.dailyLog.findUniqueOrThrow({ where: { id: log1 } })
    expect(dbRow.workSummary).toBe('Admin edit')
  })

  test('PM scoping and 404s', async () => {
    const yash = await loginAs(YASHMEEN_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await logPATCH(
        auth(`/api/daily-logs/${log2}`, yash, { method: 'PATCH', body: { workSummary: 'Not mine' } }),
        P(log2)
      ),
      403
    )
    await errBody(await logDELETE(auth(`/api/daily-logs/${log2}`, viewer, { method: 'DELETE' }), P(log2)), 403)
    await errBody(await logPATCH(auth('/api/daily-logs/nope', yash, { method: 'PATCH', body: { workSummary: 'Xyz' } }), P('nope')), 404)
    await errBody(await logDELETE(auth('/api/daily-logs/nope', yash, { method: 'DELETE' }), P('nope')), 404)
  })
})

describe('DELETE /api/daily-logs/:id', () => {
  test('owning PM deletes a fresh log; rows and entries are removed', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await okBody(await logDELETE(auth(`/api/daily-logs/${log2}`, riya, { method: 'DELETE' }), P(log2)))
    expect(await db.dailyLog.findUnique({ where: { id: log2 } })).toBeNull()
    expect(await db.labourEntry.count({ where: { dailyLogId: log2 } })).toBe(0)
    const audit = await db.auditLog.findFirst({
      where: { action: 'LOG_DELETE', entityId: log2 },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    const remaining = await okBody<LogRow[], { total: number }>(
      await logsGET(auth(`/api/projects/${fixture.projectId}/daily-logs`, riya), P(fixture.projectId))
    )
    expect(remaining.meta?.total).toBe(2)
  })
})
