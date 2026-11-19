import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { ProjectsProvider } from '@/forgeos/features/projects/ProjectsProvider'
import { AdminDashboardPage } from '@/forgeos/features/app-shell/pages/AdminDashboardPage'
import { ProjectManagerDashboardPage } from '@/forgeos/features/app-shell/pages/ProjectManagerDashboardPage'
import { errEnvelope, makeUser, okEnvelope, resetForgeOsState, stubFetch } from './test-utils'
import type { AdminDashboardResponse, PmDashboardResponse } from '@/lib/forgeos-types'
import type { AuthUser } from '@/forgeos/features/authentication/auth/session'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

/** Full ApiProject row consumed by ProjectsProvider via GET /api/projects. */
function projectsListRow(id: string, name: string, code: string) {
  return {
    id,
    code,
    name,
    description: null,
    location: 'Pune',
    status: 'ACTIVE' as const,
    startDate: '2025-01-10',
    expectedEndDate: '2026-03-31',
    actualEndDate: null,
    totalBudget: '1250000',
    wastageThresholdPct: 10,
    assignedPm: null,
    land: null,
  }
}

const projectsPageMeta = { page: 1, pageSize: 100, limit: 100, total: 1, totalPages: 1 }

function adminDashboardPayload(
  overrides: Partial<AdminDashboardResponse> = {},
): AdminDashboardResponse {
  return {
    kpis: {
      totalProjects: 3,
      activeProjects: 2,
      onHoldProjects: 0,
      planningProjects: 1,
      completedProjects: 0,
      totalBudget: 3_130_000,
      totalSpend: 1_200_000,
      budgetUtilization: 38.3,
      receivables: 118_000,
      overdueInvoices: 0,
      avgWastagePct: 4.5,
      worstProjectName: 'Skyline Residency',
      worstWastagePct: 6.1,
    },
    statusBreakdown: [
      { status: 'ACTIVE', count: 2 },
      { status: 'PLANNING', count: 1 },
    ],
    spendByMonth: [],
    budgetVsSpend: [],
    wastageByProject: [],
    recentActivity: [
      {
        id: 'a1',
        action: 'PROJECT_CREATE',
        actorName: 'Asha Admin',
        entityType: 'PROJECT',
        createdAt: '2025-06-01T10:00:00.000Z',
      },
    ],
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
      {
        id: 'p3',
        code: 'MT-02',
        name: 'Marina Towers',
        location: 'Mumbai',
        status: 'ACTIVE',
        totalBudget: 900_000,
        expectedEndDate: '2026-08-31',
        pmName: 'Divya Manager',
        latestProgressPercent: 20,
        latestLogDate: '2025-05-28',
        totalDailyLogs: 1,
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
        workSummary: 'Slab casting completed on wing A',
      },
    ],
    ...overrides,
  }
}

function pmDashboardPayload(): PmDashboardResponse {
  return {
    kpis: {
      myProjects: 1,
      activeProjects: 1,
      totalBudget: 1_250_000,
      totalSpend: 400_000,
      draftPlans: 2,
      avgWastagePct: 3.1,
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
        wastagePct: 3.1,
        latestProgressPercent: 42,
        latestLogDate: '2025-06-02',
        totalDailyLogs: 2,
      },
    ],
    spendByMonth: [],
    recentLogs: [
      {
        id: 'l2',
        projectId: 'p1',
        projectName: 'Skyline Residency',
        logDate: '2025-06-02',
        progressPercent: 42,
        workSummary: 'Brickwork started on floor 3',
      },
      {
        id: 'l1',
        projectId: 'p1',
        projectName: 'Skyline Residency',
        logDate: '2025-05-30',
        progressPercent: 35,
        workSummary: 'Foundation waterproofing completed',
      },
    ],
    upcomingEndDates: [
      { id: 'p9', name: 'Marina Towers', expectedEndDate: '2026-01-15', status: 'ACTIVE' },
    ],
  }
}

interface PageRoutes {
  user: AuthUser
  dashboard: () => Response
  projects?: () => Response
}

function renderWithShell(ui: (user: AuthUser) => React.ReactElement, routes: PageRoutes) {
  stubFetch((url) => {
    if (url === '/api/auth/me') return okEnvelope(routes.user)
    if (url.includes('/api/projects')) return (routes.projects ?? (() => okEnvelope([], projectsPageMeta)))()
    if (url === '/api/dashboard/admin' || url === '/api/dashboard/pm') return routes.dashboard()
    return errEnvelope('unstubbed', 404)
  })
  render(
    <AuthProvider>
      <ProjectsProvider>{ui(routes.user)}</ProjectsProvider>
    </AuthProvider>,
  )
}

// ---------------------------------------------------------------------------
// AdminDashboardPage
// ---------------------------------------------------------------------------

describe('AdminDashboardPage', () => {
  test('renders the full portfolio view with KPIs, projects and activity feed', async () => {
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-1' }),
      dashboard: () => okEnvelope(adminDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: /Your Portfolio, Under Control/ }),
    ).toBeInTheDocument()

    // AppShell chrome: sidebar + topbar are part of the page render.
    expect(screen.getByRole('link', { name: 'All Projects' })).toHaveAttribute('href', '#/app/projects')

    // Featured card: unweighted mean of (42 + 20) / 2
    expect(screen.getByText('31%')).toBeInTheDocument()
    expect(screen.getByText('2 of 3 projects have progress logs')).toBeInTheDocument()

    // Stat cards
    const totalProjectsCard = screen.getByText('Total projects').closest('.dashboard-stat-card')
    expect(totalProjectsCard).not.toBeNull()
    expect(within(totalProjectsCard as HTMLElement).getByText('3')).toBeInTheDocument()
    const progressLogsCard = screen.getByText('Progress logs').closest('.dashboard-stat-card')
    expect(within(progressLogsCard as HTMLElement).getByText('6')).toBeInTheDocument()

    // Project cards
    expect(screen.getByRole('heading', { level: 3, name: 'Skyline Residency' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Harbour Gateway' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Marina Towers' })).toBeInTheDocument()
    expect(screen.getByText('Prakash Manager')).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument() // Harbour Gateway has no logs
    expect(screen.getByText('Location not specified')).toBeInTheDocument()

    // Recent progress + activity feeds
    expect(screen.getByText('Slab casting completed on wing A')).toBeInTheDocument()
    expect(screen.getByText('PROJECT_CREATE · PROJECT')).toBeInTheDocument()
    // "Asha Admin" legitimately appears in both the topbar and the activity
    // feed, so assert presence rather than uniqueness.
    expect(screen.getAllByText('Asha Admin').length).toBeGreaterThan(0)
  })

  test('search narrows the project list', async () => {
    const user = userEvent.setup()
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-2' }),
      dashboard: () => okEnvelope(adminDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    await screen.findByRole('heading', { level: 3, name: 'Harbour Gateway' })
    await user.type(screen.getByPlaceholderText('Search projects...'), 'Skyline')

    await waitFor(() => expect(screen.queryByRole('heading', { level: 3, name: 'Harbour Gateway' })).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { level: 3, name: 'Skyline Residency' })).toBeInTheDocument()
  })

  test('the status filter and Clear filters work together', async () => {
    const user = userEvent.setup()
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-3' }),
      dashboard: () => okEnvelope(adminDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    await screen.findByRole('heading', { level: 3, name: 'Marina Towers' })

    const filterSelect = screen.getByDisplayValue('All statuses')
    await user.selectOptions(filterSelect, 'ACTIVE')
    await waitFor(() =>
      expect(screen.queryByRole('heading', { level: 3, name: 'Harbour Gateway' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Marina Towers' })).toBeInTheDocument()

    // A query matching nothing shows the empty state with a reset action.
    await user.type(screen.getByPlaceholderText('Search projects...'), 'zzz-no-match')
    expect(await screen.findByText('No projects match your filters.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 3, name: 'Harbour Gateway' })).toBeInTheDocument(),
    )
  })

  test('View project navigates to the project details hash route', async () => {
    const user = userEvent.setup()
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-4' }),
      dashboard: () => okEnvelope(adminDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    const viewButtons = await screen.findAllByRole('button', { name: /View project/ })
    await user.click(viewButtons[0])

    await waitFor(() => expect(window.location.hash).toBe('#/app/projects/p1'))
  })

  test('shows the error card with a working Retry when the dashboard API fails', async () => {
    let dashboardFails = true
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-5' }),
      dashboard: () =>
        dashboardFails
          ? errEnvelope('Portfolio data unavailable', 500, 'INTERNAL')
          : okEnvelope(adminDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Portfolio data unavailable')

    dashboardFails = false
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /Your Portfolio, Under Control/ }),
    ).toBeInTheDocument()
  })

  test('an empty portfolio renders the dedicated empty state', async () => {
    renderWithShell(() => <AdminDashboardPage />, {
      user: makeUser('ADMIN', { id: 'u-adm-page-6' }),
      dashboard: () =>
        okEnvelope(
          adminDashboardPayload({
            kpis: {
              totalProjects: 0,
              activeProjects: 0,
              onHoldProjects: 0,
              planningProjects: 0,
              completedProjects: 0,
              totalBudget: 0,
              totalSpend: 0,
              budgetUtilization: null,
              receivables: 0,
              overdueInvoices: 0,
              avgWastagePct: null,
              worstProjectName: null,
              worstWastagePct: null,
            },
            projects: [],
            recentProgress: [],
            recentActivity: [],
          }),
        ),
      projects: () => okEnvelope([], projectsPageMeta),
    })

    expect(await screen.findByRole('heading', { name: 'No accessible projects' })).toBeInTheDocument()
    expect(
      screen.getByText('Projects permitted for your account will appear here.'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// ProjectManagerDashboardPage
// ---------------------------------------------------------------------------

describe('ProjectManagerDashboardPage', () => {
  test('renders the assigned project cockpit with logs and upcoming dates', async () => {
    renderWithShell((user) => <ProjectManagerDashboardPage />, {
      user: makeUser('PM', { id: 'u-pm-page-1', name: 'Prakash Manager' }),
      dashboard: () => okEnvelope(pmDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: /Good morning, Prakash Manager/ }),
    ).toBeInTheDocument()

    // Featured assigned-project card. The H1 above renders as soon as the
    // session is restored, but this card only appears once BOTH async chains
    // (projects list + PM dashboard) have settled — so it must be awaited.
    expect(await screen.findByText('Assigned project · SKY-01')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Skyline Residency' })).toBeInTheDocument()
    expect(screen.getAllByText('42%')).toHaveLength(2) // featured card + latest log pill
    expect(screen.getByText('+7%')).toBeInTheDocument() // change since previous log
    expect(screen.getByText('2')).toBeInTheDocument() // daily-log count for the project

    // Portfolio totals
    expect(screen.getByText('My projects')).toBeInTheDocument()
    expect(screen.getByText('Average wastage')).toBeInTheDocument()
    expect(screen.getByText('3.1%')).toBeInTheDocument()

    // Recent site logs
    expect(screen.getByRole('heading', { name: 'Recent site logs' })).toBeInTheDocument()
    expect(screen.getByText('Brickwork started on floor 3')).toBeInTheDocument()
    expect(screen.getByText('Foundation waterproofing completed')).toBeInTheDocument()

    // Upcoming completion dates
    expect(screen.getByRole('heading', { name: 'Upcoming completion dates' })).toBeInTheDocument()
    expect(screen.getByText('Marina Towers')).toBeInTheDocument()
    expect(screen.getAllByText(/Expected completion/).length).toBeGreaterThan(0)
  })

  test('Add daily site log routes to the project log form', async () => {
    const user = userEvent.setup()
    renderWithShell(() => <ProjectManagerDashboardPage />, {
      user: makeUser('PM', { id: 'u-pm-page-2', name: 'Prakash Manager' }),
      dashboard: () => okEnvelope(pmDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    const addButton = await screen.findByRole('button', { name: /Add daily site log/ })
    await waitFor(() => expect(addButton).toBeEnabled())
    await user.click(addButton)

    await waitFor(() => expect(window.location.hash).toBe('#/projects/p1/logs/new'))
  })

  test('shows the error card with Retry when the PM dashboard API fails', async () => {
    let dashboardFails = true
    renderWithShell(() => <ProjectManagerDashboardPage />, {
      user: makeUser('PM', { id: 'u-pm-page-3', name: 'Prakash Manager' }),
      dashboard: () =>
        dashboardFails
          ? errEnvelope('Assigned project data unavailable', 500, 'INTERNAL')
          : okEnvelope(pmDashboardPayload()),
      projects: () => okEnvelope([projectsListRow('p1', 'Skyline Residency', 'SKY-01')], projectsPageMeta),
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Assigned project data unavailable')

    dashboardFails = false
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Skyline Residency' }),
    ).toBeInTheDocument()
  })

  test('a PM with no assigned projects sees the empty state', async () => {
    renderWithShell(() => <ProjectManagerDashboardPage />, {
      user: makeUser('PM', { id: 'u-pm-page-4', name: 'Prakash Manager' }),
      dashboard: () => okEnvelope(pmDashboardPayload()),
      projects: () => okEnvelope([], projectsPageMeta),
    })

    expect(await screen.findByRole('heading', { name: 'No assigned project' })).toBeInTheDocument()
    expect(
      screen.getByText('A project assigned to your account will appear here.'),
    ).toBeInTheDocument()
  })
})
