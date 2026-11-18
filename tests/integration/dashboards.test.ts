import { describe, test, expect, afterAll } from 'vitest'
import { GET as adminDashGET } from '@/app/api/dashboard/admin/route'
import { GET as pmDashGET } from '@/app/api/dashboard/pm/route'
import { POST as logsPOST } from '@/app/api/projects/[id]/daily-logs/route'
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
  createProjectFixture,
} from '../helpers'

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)

interface AdminDashboard {
  kpis: {
    totalProjects: number
    activeProjects: number
    onHoldProjects: number
    planningProjects: number
    completedProjects: number
    totalBudget: number
    totalSpend: number
    budgetUtilization: number | null
    receivables: number
    overdueInvoices: number
    avgWastagePct: number | null
    worstProjectName: string | null
    worstWastagePct: number | null
  }
  statusBreakdown: { status: string; count: number }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  budgetVsSpend: { projectName: string; budget: number; spend: number }[]
  wastageByProject: { projectName: string; wastagePct: number | null; plannedQty: number; consumedQty: number }[]
  recentActivity: { id: string; action: string; actorName: string | null; entityType: string | null; createdAt: string }[]
  recentInvoices: { id: string; invoiceNo: string; projectName: string; totalWithGst: number; status: string; dueDate: string; balance: number }[]
  projects: {
    id: string
    code: string
    name: string
    status: string
    totalBudget: number
    latestProgressPercent: number
    latestLogDate: string | null
    totalDailyLogs: number
    pmName: string | null
  }[]
  recentProgress: { projectId: string; projectName: string; code: string; id: string; logDate: string; progressPercent: number; workSummary: string }[]
}

interface PmDashboard {
  kpis: { myProjects: number; activeProjects: number; totalBudget: number; totalSpend: number; draftPlans: number; avgWastagePct: number | null }
  projects: {
    id: string
    code: string
    name: string
    status: string
    spend: number
    latestProgressPercent: number | null
    latestLogDate: string | null
    totalDailyLogs: number
  }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  recentLogs: { id: string; projectId: string; projectName: string; logDate: string; progressPercent: number; workSummary: string }[]
  upcomingEndDates: { id: string; name: string; expectedEndDate: string; status: string }[]
}

const fixture = await createProjectFixture('dash', { pmEmail: RIYA_EMAIL })
const riyaId = (await db.user.findUniqueOrThrow({ where: { email: RIYA_EMAIL } })).id

// Two logs on the fixture project so latest-progress checks are meaningful.
const riyaSetup = await loginAs(RIYA_EMAIL)
await okBody(
  await logsPOST(
    auth(`/api/projects/${fixture.projectId}/daily-logs`, riyaSetup, {
      body: { logDate: day(5), progressPercent: 30, workSummary: `T8 dash A ${RUN_TAG}` },
    }),
    P(fixture.projectId)
  )
)
await okBody(
  await logsPOST(
    auth(`/api/projects/${fixture.projectId}/daily-logs`, riyaSetup, {
      body: { logDate: day(4), progressPercent: 45, workSummary: `T8 dash B ${RUN_TAG}` },
    }),
    P(fixture.projectId)
  )
)

afterAll(async () => {
  await fixture.dispose()
})

/** Latest log per project computed the same way the dashboard route does. */
async function latestLogByProject(projectIds: string[]) {
  const logs = await db.dailyLog.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
    select: { projectId: true, logDate: true, progressPercent: true },
  })
  const map = new Map<string, { progressPercent: number; logDate: Date }>()
  for (const log of logs) {
    if (!map.has(log.projectId)) map.set(log.projectId, { progressPercent: log.progressPercent, logDate: log.logDate })
  }
  return map
}

describe('GET /api/dashboard/admin', () => {
  test('PM gets 403; VIEWER may read it', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(await adminDashGET(auth('/api/dashboard/admin', riya)), 403)
    await okBody<{ kpis: unknown }>(await adminDashGET(auth('/api/dashboard/admin', viewer)))
  })

  test('admin shape: kpis, statusBreakdown, spendByMonth (6), projects, recentProgress, recentActivity', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<AdminDashboard>(await adminDashGET(auth('/api/dashboard/admin', admin)))
    const data = body.data

    // --- kpis vs DB ---
    const dbProjects = await db.project.findMany({ select: { id: true, status: true, totalBudget: true } })
    expect(data.kpis.totalProjects).toBe(dbProjects.length)
    expect(data.kpis.activeProjects).toBe(dbProjects.filter((p) => p.status === 'ACTIVE').length)
    expect(data.kpis.onHoldProjects).toBe(dbProjects.filter((p) => p.status === 'ON_HOLD').length)
    expect(data.kpis.planningProjects).toBe(dbProjects.filter((p) => p.status === 'PLANNING').length)
    expect(data.kpis.completedProjects).toBe(dbProjects.filter((p) => p.status === 'COMPLETED').length)
    expect(data.kpis.totalBudget).toBeCloseTo(
      dbProjects.reduce((sum, p) => sum + p.totalBudget, 0),
      6
    )
    const inTxns = await db.inventoryTransaction.findMany({
      where: { txnType: 'IN', voidedAt: null },
      select: { quantity: true, unitRate: true },
    })
    expect(data.kpis.totalSpend).toBeCloseTo(
      inTxns.reduce((sum, t) => sum + t.quantity * (t.unitRate ?? 0), 0),
      6
    )
    // receivables = sum(balance) over SENT + PARTIALLY_PAID invoices
    const invoices = await db.invoice.findMany({ include: { payments: { select: { amount: true } } } })
    let expectedReceivables = 0
    let expectedOverdue = 0
    const now = Date.now()
    for (const inv of invoices) {
      if (inv.status !== 'SENT' && inv.status !== 'PARTIALLY_PAID') continue
      const total = inv.amount * (1 + inv.gstPct / 100)
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
      expectedReceivables += total - paid
      if (inv.dueDate.getTime() < now) expectedOverdue += 1
    }
    expect(data.kpis.receivables).toBeCloseTo(expectedReceivables, 4)
    expect(data.kpis.overdueInvoices).toBe(expectedOverdue)
    expect(typeof data.kpis.budgetUtilization).toBe('number')

    // --- statusBreakdown: one entry per project status, counts sum to total ---
    expect(data.statusBreakdown.length).toBe(4)
    expect(data.statusBreakdown.reduce((s, r) => s + r.count, 0)).toBe(dbProjects.length)
    expect(data.statusBreakdown.map((r) => r.status)).toEqual(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'])

    // --- spendByMonth: six ascending month buckets ending with the current month ---
    expect(data.spendByMonth.length).toBe(6)
    const now2 = new Date()
    const expectedLast = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, '0')}`
    expect(data.spendByMonth[5].month).toBe(expectedLast)
    for (let i = 1; i < data.spendByMonth.length; i++) {
      expect(data.spendByMonth[i - 1].month < data.spendByMonth[i].month).toBe(true)
    }
    for (const bucket of data.spendByMonth) {
      expect(typeof bucket.spend).toBe('number')
      expect(typeof bucket.label).toBe('string')
    }

    // --- projects[]: latest progress + log counts match the DB for every project ---
    expect(data.projects.length).toBe(dbProjects.length)
    const latest = await latestLogByProject(dbProjects.map((p) => p.id))
    const rowByCode = new Map(data.projects.map((p) => [p.code, p]))
    const fixtureRow = rowByCode.get(`T8-${RUN_TAG}-dash`)!
    expect(fixtureRow.latestProgressPercent).toBe(45)
    expect(fixtureRow.totalDailyLogs).toBe(2)
    for (const p of dbProjects) {
      const row = data.projects.find((r) => r.id === p.id)!
      const exp = latest.get(p.id)
      expect(row.latestProgressPercent).toBe(exp?.progressPercent ?? 0)
      const count = await db.dailyLog.count({ where: { projectId: p.id } })
      expect(row.totalDailyLogs).toBe(count)
    }

    // --- recentProgress: at most 8, ordered by logDate desc ---
    expect(data.recentProgress.length).toBeLessThanOrEqual(8)
    expect(data.recentProgress.length).toBeGreaterThan(0)
    for (let i = 1; i < data.recentProgress.length; i++) {
      expect(data.recentProgress[i - 1].logDate >= data.recentProgress[i].logDate).toBe(true)
    }
    const newest = data.recentProgress[0]
    const dbNewest = await db.dailyLog.findFirst({ orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }] })
    expect(newest.id).toBe(dbNewest!.id)
    for (const row of data.recentProgress) {
      expect(typeof row.progressPercent).toBe('number')
      expect(typeof row.workSummary).toBe('string')
      expect(typeof row.code).toBe('string')
    }

    // --- recentActivity: at most 8 audit rows, newest first ---
    expect(data.recentActivity.length).toBeLessThanOrEqual(8)
    for (let i = 1; i < data.recentActivity.length; i++) {
      expect(data.recentActivity[i - 1].createdAt >= data.recentActivity[i].createdAt).toBe(true)
    }
    const auditIds = new Set(data.recentActivity.map((r) => r.id))
    expect(auditIds.size).toBe(data.recentActivity.length)
    for (const row of data.recentActivity) {
      expect(typeof row.action).toBe('string')
    }

    // --- recentInvoices ---
    expect(data.recentInvoices.length).toBeLessThanOrEqual(6)
    expect(data.recentInvoices.length).toBeGreaterThan(0)
    for (const inv of data.recentInvoices) {
      expect(typeof inv.invoiceNo).toBe('string')
      expect(typeof inv.totalWithGst).toBe('number')
    }

    // budgetVsSpend / wastageByProject are capped at 6 rows, budget-desc for the former
    expect(data.budgetVsSpend.length).toBeLessThanOrEqual(6)
    for (let i = 1; i < data.budgetVsSpend.length; i++) {
      expect(data.budgetVsSpend[i - 1].budget >= data.budgetVsSpend[i].budget).toBe(true)
    }
    expect(data.wastageByProject.length).toBeLessThanOrEqual(6)
  })
})

describe('GET /api/dashboard/pm', () => {
  test('VIEWER gets 403; riya sees only her own projects', async () => {
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(await pmDashGET(auth('/api/dashboard/pm', viewer)), 403)

    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<PmDashboard>(await pmDashGET(auth('/api/dashboard/pm', riya)))
    const data = body.data

    const ownProjects = await db.project.findMany({ where: { assignedPmId: riyaId }, select: { id: true, code: true, status: true } })
    const ownCodes = new Set(ownProjects.map((p) => p.code))
    expect(ownCodes.has(`T8-${RUN_TAG}-dash`)).toBe(true)
    expect(data.projects.length).toBe(ownProjects.length)
    for (const row of data.projects) {
      expect(ownCodes.has(row.code)).toBe(true)
    }
    expect(data.projects.some((r) => r.code === 'FOS-002')).toBe(false)
    expect(data.projects.some((r) => r.code === 'FOS-006')).toBe(false)

    // kpis vs DB
    expect(data.kpis.myProjects).toBe(ownProjects.length)
    expect(data.kpis.activeProjects).toBe(ownProjects.filter((p) => p.status === 'ACTIVE').length)

    // per-project latest progress matches DB
    const latest = await latestLogByProject(ownProjects.map((p) => p.id))
    for (const p of ownProjects) {
      const row = data.projects.find((r) => r.id === p.id)!
      const exp = latest.get(p.id)
      expect(row.latestProgressPercent).toBe(exp ? exp.progressPercent : null)
      const count = await db.dailyLog.count({ where: { projectId: p.id } })
      expect(row.totalDailyLogs).toBe(count)
    }

    // recentLogs: at most 6, all for her projects
    expect(data.recentLogs.length).toBeLessThanOrEqual(6)
    for (const log of data.recentLogs) {
      expect(ownProjects.some((p) => p.id === log.projectId)).toBe(true)
    }

    // upcomingEndDates: ACTIVE only, sorted asc, ≤ 5
    expect(data.upcomingEndDates.length).toBeLessThanOrEqual(5)
    for (let i = 1; i < data.upcomingEndDates.length; i++) {
      expect(data.upcomingEndDates[i - 1].expectedEndDate <= data.upcomingEndDates[i].expectedEndDate).toBe(true)
    }
    const activeIds = new Set(ownProjects.filter((p) => p.status === 'ACTIVE').map((p) => p.id))
    for (const row of data.upcomingEndDates) {
      expect(activeIds.has(row.id)).toBe(true)
    }

    expect(data.spendByMonth.length).toBe(6)
  })
})
