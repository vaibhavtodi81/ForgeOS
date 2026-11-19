import { describe, expect, test } from 'vitest'
import {
  fetchAdminDashboard,
  fetchPmDashboard,
} from '@/forgeos/features/app-shell/data/dashboardApi'
import { ApiError } from '@/forgeos/lib/api'
import { calledUrls, errEnvelope, okEnvelope, stubFetch } from './test-utils'
import type { AdminDashboardResponse, PmDashboardResponse } from '@/lib/forgeos-types'

function makeAdminDashboardResponse(): AdminDashboardResponse {
  return {
    kpis: {
      totalProjects: 3,
      activeProjects: 2,
      onHoldProjects: 1,
      planningProjects: 0,
      completedProjects: 0,
      totalBudget: 30_000_000,
      totalSpend: 12_000_000,
      budgetUtilization: 40,
      receivables: 500_000,
      overdueInvoices: 1,
      avgWastagePct: 5.5,
      worstProjectName: 'Skyline Residency',
      worstWastagePct: 8.2,
    },
    statusBreakdown: [
      { status: 'ACTIVE', count: 2 },
      { status: 'ON_HOLD', count: 1 },
    ],
    spendByMonth: [{ month: '2025-01', label: 'Jan', spend: 100_000 }],
    budgetVsSpend: [{ projectName: 'Skyline Residency', budget: 1_000_000, spend: 500_000 }],
    wastageByProject: [
      { projectName: 'Skyline Residency', wastagePct: 5.5, plannedQty: 100, consumedQty: 105 },
    ],
    recentActivity: [
      {
        id: 'a1',
        action: 'PROJECT_CREATE',
        actorName: 'Asha Admin',
        entityType: 'PROJECT',
        createdAt: '2025-06-01T10:00:00.000Z',
      },
    ],
    recentInvoices: [
      {
        id: 'i1',
        invoiceNo: 'INV-001',
        projectName: 'Skyline Residency',
        totalWithGst: 118_000,
        status: 'SENT',
        dueDate: '2025-07-01',
        balance: 118_000,
      },
    ],
    projects: [
      {
        id: 'p1',
        code: 'SKY-01',
        name: 'Skyline Residency',
        location: 'Pune',
        status: 'ACTIVE',
        totalBudget: 1_250_000,
        expectedEndDate: '2026-03-31',
        pmName: 'Prakash Manager',
        latestProgressPercent: 42,
        latestLogDate: '2025-06-01',
        totalDailyLogs: 5,
      },
      {
        id: 'p2',
        code: 'HG-07',
        name: 'Harbour Gateway',
        location: null,
        status: 'PLANNING',
        totalBudget: 980_000,
        expectedEndDate: null,
        pmName: null,
        latestProgressPercent: 0,
        latestLogDate: null,
        totalDailyLogs: 0,
      },
    ],
    recentProgress: [
      {
        projectId: 'p1',
        projectName: 'Skyline Residency',
        code: 'SKY-01',
        id: 'l1',
        logDate: '2025-06-01',
        progressPercent: 42,
        workSummary: 'Slab casting completed',
      },
    ],
  }
}

function makePmDashboardResponse(): PmDashboardResponse {
  return {
    kpis: {
      myProjects: 1,
      activeProjects: 1,
      totalBudget: 1_250_000,
      totalSpend: 400_000,
      draftPlans: 2,
      avgWastagePct: 4.2,
    },
    projects: [
      {
        id: 'p1',
        name: 'Skyline Residency',
        code: 'SKY-01',
        status: 'ACTIVE',
        totalBudget: 1_250_000,
        spend: 400_000,
        expectedEndDate: '2026-03-31',
        wastagePct: 4.2,
        latestProgressPercent: 42,
        latestLogDate: '2025-06-01',
        totalDailyLogs: 5,
      },
    ],
    spendByMonth: [{ month: '2025-06', label: 'Jun', spend: 90_000 }],
    recentLogs: [
      {
        id: 'l1',
        projectId: 'p1',
        projectName: 'Skyline Residency',
        logDate: '2025-06-01',
        progressPercent: 42,
        workSummary: 'Slab casting completed',
      },
    ],
    upcomingEndDates: [{ id: 'p1', name: 'Skyline Residency', expectedEndDate: '2026-03-31', status: 'ACTIVE' }],
  }
}

describe('fetchAdminDashboard', () => {
  test('requests GET /api/dashboard/admin and forwards the abort signal', async () => {
    const fetchMock = stubFetch(() => okEnvelope(makeAdminDashboardResponse()))
    const controller = new AbortController()

    await fetchAdminDashboard(controller.signal)

    expect(calledUrls(fetchMock)).toEqual(['/api/dashboard/admin'])
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal)
  })

  test('maps raw project rows into DashboardProjectData entries', async () => {
    stubFetch(() => okEnvelope(makeAdminDashboardResponse()))

    const data = await fetchAdminDashboard(new AbortController().signal)

    expect(data.projects).toHaveLength(2)

    const [first, second] = data.projects

    // Row with pmName + location
    expect(first.project).toEqual({
      id: 'p1',
      code: 'SKY-01',
      name: 'Skyline Residency',
      location: 'Pune',
      status: 'ACTIVE',
      startDate: null, // not part of the dashboard payload
      expectedEndDate: '2026-03-31',
      actualEndDate: null,
      totalBudget: 1_250_000,
      assignedPm: { id: '', name: 'Prakash Manager', email: '' },
    })
    expect(first.summary).toEqual({
      latestProgressPercent: 42,
      latestLogDate: '2025-06-01',
      totalDailyLogs: 5,
    })

    // Row without pm/location falls back to defaults
    expect(second.project.location).toBe('Location not specified')
    expect(second.project.assignedPm).toBeNull()
    expect(second.summary).toEqual({
      latestProgressPercent: 0,
      latestLogDate: null,
      totalDailyLogs: 0,
    })
  })

  test('keeps kpis, recentProgress and recentActivity; drops unused response sections', async () => {
    const payload = makeAdminDashboardResponse()
    stubFetch(() => okEnvelope(payload))

    const data = await fetchAdminDashboard(new AbortController().signal)

    expect(data.kpis).toEqual(payload.kpis)
    expect(data.recentProgress).toEqual(payload.recentProgress)
    expect(data.recentActivity).toEqual(payload.recentActivity)

    // Chart-only sections of the raw response are intentionally not surfaced.
    expect(data).not.toHaveProperty('statusBreakdown')
    expect(data).not.toHaveProperty('spendByMonth')
    expect(data).not.toHaveProperty('budgetVsSpend')
    expect(data).not.toHaveProperty('wastageByProject')
    expect(data).not.toHaveProperty('recentInvoices')
  })

  test('propagates API errors as ApiError with the server message', async () => {
    stubFetch(() => errEnvelope('Admin access required', 403, 'FORBIDDEN'))

    const error = (await fetchAdminDashboard(new AbortController().signal).catch(
      (cause: unknown) => cause,
    )) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(403)
    expect(error.message).toBe('Admin access required')
  })

  test('a malformed payload (no projects array) rejects instead of returning garbage', async () => {
    stubFetch(() => okEnvelope({}))

    await expect(fetchAdminDashboard(new AbortController().signal)).rejects.toThrow()
  })
})

describe('fetchPmDashboard', () => {
  test('requests GET /api/dashboard/pm and returns the payload data verbatim', async () => {
    const payload = makePmDashboardResponse()
    const fetchMock = stubFetch(() => okEnvelope(payload))
    const controller = new AbortController()

    const data = await fetchPmDashboard(controller.signal)

    expect(calledUrls(fetchMock)).toEqual(['/api/dashboard/pm'])
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal)
    expect(data).toEqual(payload)
  })

  test('propagates API errors', async () => {
    stubFetch(() => errEnvelope('Not authenticated', 401, 'UNAUTHORIZED'))

    await expect(fetchPmDashboard(new AbortController().signal)).rejects.toMatchObject({
      status: 401,
      message: 'Not authenticated',
    })
  })
})
