import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  useAdminDashboardData,
  usePmDashboardData,
} from '@/forgeos/features/app-shell/hooks/useDashboardData'
import { errEnvelope, okEnvelope, resetForgeOsState, stubFetch } from './test-utils'
import type { AdminDashboardResponse, PmDashboardResponse } from '@/lib/forgeos-types'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

function adminResponse(overrides: Partial<AdminDashboardResponse> = {}): AdminDashboardResponse {
  return {
    kpis: {
      totalProjects: 1,
      activeProjects: 1,
      onHoldProjects: 0,
      planningProjects: 0,
      completedProjects: 0,
      totalBudget: 1_250_000,
      totalSpend: 400_000,
      budgetUtilization: 32,
      receivables: 0,
      overdueInvoices: 0,
      avgWastagePct: null,
      worstProjectName: null,
      worstWastagePct: null,
    },
    statusBreakdown: [{ status: 'ACTIVE', count: 1 }],
    spendByMonth: [],
    budgetVsSpend: [],
    wastageByProject: [],
    recentActivity: [],
    recentInvoices: [],
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
    ],
    recentProgress: [],
    ...overrides,
  }
}

function pmResponse(): PmDashboardResponse {
  return {
    kpis: {
      myProjects: 1,
      activeProjects: 1,
      totalBudget: 1_250_000,
      totalSpend: 400_000,
      draftPlans: 0,
      avgWastagePct: 3.1,
    },
    projects: [],
    spendByMonth: [],
    recentLogs: [],
    upcomingEndDates: [],
  }
}

describe('useAdminDashboardData', () => {
  test('starts loading, then exposes the mapped dashboard data', async () => {
    let resolveDashboard: ((value: Response) => void) | undefined
    stubFetch((url) => {
      if (url === '/api/dashboard/admin') {
        return new Promise<Response>((resolve) => {
          resolveDashboard = resolve
        })
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderHook(() => useAdminDashboardData())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    await act(async () => {
      resolveDashboard?.(okEnvelope(adminResponse()))
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.data?.kpis.totalProjects).toBe(1)
    expect(result.current.data?.projects[0].project.name).toBe('Skyline Residency')
    expect(result.current.data?.projects[0].project.assignedPm).toEqual({
      id: '',
      name: 'Prakash Manager',
      email: '',
    })
    expect(result.current.data?.projects[0].summary.totalDailyLogs).toBe(5)
  })

  test('a failed load exposes the error message and null data', async () => {
    stubFetch((url) =>
      url === '/api/dashboard/admin'
        ? errEnvelope('Admin access required', 403, 'FORBIDDEN')
        : errEnvelope('unstubbed', 404),
    )

    const { result } = renderHook(() => useAdminDashboardData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Admin access required')
    expect(result.current.data).toBeNull()
  })

  test('retry re-fetches and recovers after an error', async () => {
    let dashboardFails = true
    stubFetch((url) => {
      if (url !== '/api/dashboard/admin') return errEnvelope('unstubbed', 404)
      return dashboardFails
        ? errEnvelope('Dashboard exploded', 500, 'INTERNAL')
        : okEnvelope(adminResponse())
    })

    const { result } = renderHook(() => useAdminDashboardData())
    await waitFor(() => expect(result.current.error).toBe('Dashboard exploded'))

    dashboardFails = false
    act(() => result.current.retry())

    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.error).toBeNull()
    expect(result.current.data?.kpis.totalProjects).toBe(1)
  })
})

describe('usePmDashboardData', () => {
  test('loads the PM dashboard payload', async () => {
    stubFetch((url) =>
      url === '/api/dashboard/pm' ? okEnvelope(pmResponse()) : errEnvelope('unstubbed', 404),
    )

    const { result } = renderHook(() => usePmDashboardData())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual(pmResponse())
  })

  test('surfaces a network-layer error message', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed')
    })

    const { result } = renderHook(() => usePmDashboardData())

    await waitFor(() => expect(result.current.error).toBe(
      'Unable to reach the ForgeOS server. Check your connection and try again.',
    ))
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })
})
