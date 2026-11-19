import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { ProjectsProvider } from '@/forgeos/features/projects/ProjectsProvider'
import { Sidebar } from '@/forgeos/features/app-shell/components/Sidebar'
import { Topbar } from '@/forgeos/features/app-shell/components/Topbar'
import { Breadcrumbs } from '@/forgeos/features/app-shell/components/Breadcrumbs'
import { ProjectSelector } from '@/forgeos/features/app-shell/components/ProjectSelector'
import { errEnvelope, flushAsync, makeUser, okEnvelope, resetForgeOsState, stubFetch } from './test-utils'
import type { AuthUser } from '@/forgeos/features/authentication/auth/session'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

/** Minimal admin-dashboard payload — the Sidebar only reads projects[].progress fields. */
function sidebarAdminDashboard(percents: Array<{ latestProgressPercent: number; totalDailyLogs: number }>) {
  return {
    kpis: { myProjects: percents.length },
    projects: percents.map((p, index) => ({
      id: `sp-${index}`,
      code: `P-${index}`,
      name: `Project ${index}`,
      latestProgressPercent: p.latestProgressPercent,
      totalDailyLogs: p.totalDailyLogs,
    })),
  }
}

/** Minimal PM-dashboard payload for sidebar + topbar notifications. */
function sidebarPmDashboard(
  percents: Array<{ latestProgressPercent: number; totalDailyLogs: number }>,
  myProjects: number,
  recentLogs: Array<{ id: string; workSummary: string; logDate: string; projectName?: string }> = [],
) {
  return {
    kpis: { myProjects },
    projects: percents.map((p, index) => ({
      id: `mp-${index}`,
      name: `My Project ${index}`,
      latestProgressPercent: p.latestProgressPercent,
      totalDailyLogs: p.totalDailyLogs,
    })),
    recentLogs,
  }
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

describe('Sidebar', () => {
  function renderSidebar(
    user: AuthUser,
    props: {
      currentPath?: string
      collapsed?: boolean
      mobileOpen?: boolean
      onCloseMobile?: () => void
      onToggleCollapsed?: () => void
    } = {},
  ) {
    const onCloseMobile = props.onCloseMobile ?? vi.fn()
    const onToggleCollapsed = props.onToggleCollapsed ?? vi.fn()
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(user)
      if (url === '/api/dashboard/admin') return okEnvelope(sidebarAdminDashboard([]))
      if (url === '/api/dashboard/pm') return okEnvelope(sidebarPmDashboard([], 0))
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <Sidebar
          currentPath={props.currentPath ?? '/app/admin/dashboard'}
          collapsed={props.collapsed ?? false}
          mobileOpen={props.mobileOpen ?? false}
          onCloseMobile={onCloseMobile}
          onToggleCollapsed={onToggleCollapsed}
        />
      </AuthProvider>,
    )
    return { onCloseMobile, onToggleCollapsed }
  }

  test('renders the admin navigation with hash-router hrefs', () => {
    renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-1' }), { currentPath: '/app/admin/dashboard' })

    const aside = screen.getByRole('complementary')
    expect(aside).toBeInTheDocument()
    expect(screen.getByText('Administration')).toBeInTheDocument()

    const dashboard = screen.getByRole('link', { name: /^Dashboard$/ })
    expect(dashboard).toHaveAttribute('href', '#/app/admin/dashboard')
    expect(screen.getByRole('link', { name: 'All Projects' })).toHaveAttribute('href', '#/app/projects')
    expect(screen.getByRole('link', { name: 'Project Managers' })).toHaveAttribute('href', '#/app/users')
    expect(screen.getByRole('link', { name: 'Audit Logs' })).toHaveAttribute('href', '#/app/audit')
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '#/app/profile')
    expect(screen.getByRole('link', { name: 'Invoices & Payments' })).toHaveAttribute('href', '#/app/bills')
  })

  test('admin navigation excludes PM-only items', () => {
    renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-2' }))
    expect(screen.queryByText('Site Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('My Project')).not.toBeInTheDocument()
  })

  test('renders the PM navigation with the Site Operations section', async () => {
    renderSidebar(makeUser('PM', { id: 'u-sb-pm-1' }), { currentPath: '/app/pm/dashboard' })

    // The sidebar first renders pre-auth; wait for the PM identity to load.
    expect(await screen.findByText('Site Operations')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Site Dashboard' })).toHaveAttribute('href', '#/app/pm/dashboard')
    expect(screen.getByRole('link', { name: 'My Project' })).toHaveAttribute('href', '#/app/projects')
    expect(screen.getByRole('link', { name: 'Daily Site Logs' })).toHaveAttribute('href', '#/app/daily-logs')
    // Admin-only entries are hidden for PMs
    expect(screen.queryByText('Project Managers')).not.toBeInTheDocument()
    expect(screen.queryByText('Audit Logs')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  test('VIEWER navigation drops admin-only entries but keeps project browsing', async () => {
    renderSidebar(makeUser('VIEWER', { id: 'u-sb-viewer-1' }))

    // Pre-auth the sidebar renders the admin item set; wait until the viewer
    // identity loads and the admin-only entries disappear.
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Audit Logs' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: 'All Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '#/app/admin/dashboard')
    expect(screen.queryByText('Project Managers')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  test('highlights the link matching currentPath', () => {
    renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-3' }), { currentPath: '/app/projects' })

    const allProjects = screen.getByRole('link', { name: 'All Projects' })
    const dashboard = screen.getByRole('link', { name: /^Dashboard$/ })
    expect(allProjects.className).toContain('text-[#F2A65A]')
    expect(dashboard.className).not.toContain('text-[#F2A65A]')
  })

  test('shows the averaged portfolio progress for admins once loaded', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-sb-admin-4' }))
      if (url === '/api/dashboard/admin') {
        return okEnvelope(sidebarAdminDashboard([
          { latestProgressPercent: 60, totalDailyLogs: 2 },
          { latestProgressPercent: 40, totalDailyLogs: 1 },
          { latestProgressPercent: 99, totalDailyLogs: 0 }, // no logs → excluded
        ]))
      }
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <Sidebar
          currentPath="/app/admin/dashboard"
          collapsed={false}
          mobileOpen={false}
          onCloseMobile={vi.fn()}
          onToggleCollapsed={vi.fn()}
        />
      </AuthProvider>,
    )

    expect(await screen.findByText('50% · Portfolio average progress')).toBeInTheDocument()
  })

  test('shows assigned-project progress for PMs once loaded', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('PM', { id: 'u-sb-pm-2' }))
      if (url === '/api/dashboard/pm') {
        return okEnvelope(sidebarPmDashboard([{ latestProgressPercent: 70, totalDailyLogs: 3 }], 2))
      }
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <Sidebar
          currentPath="/app/pm/dashboard"
          collapsed={false}
          mobileOpen={false}
          onCloseMobile={vi.fn()}
          onToggleCollapsed={vi.fn()}
        />
      </AuthProvider>,
    )

    expect(await screen.findByText('70% · 2 assigned projects')).toBeInTheDocument()
  })

  test('keeps the fallback progress caption when the progress API fails', async () => {
    const fetchMock = stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-sb-admin-5' }))
      if (url === '/api/dashboard/admin') return errEnvelope('Admin access required', 403)
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <Sidebar
          currentPath="/app/admin/dashboard"
          collapsed={false}
          mobileOpen={false}
          onCloseMobile={vi.fn()}
          onToggleCollapsed={vi.fn()}
        />
      </AuthProvider>,
    )

    // Wait for the failed call to settle, then confirm the fallback caption.
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([input]) => String(input) === '/api/dashboard/admin')).toBe(true),
    )
    await flushAsync()
    expect(screen.getByText('Portfolio overview')).toBeInTheDocument()
  })

  test('collapsed mode hides labels and keeps the toggle button functional', async () => {
    const user = userEvent.setup()
    const { onToggleCollapsed } = renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-6' }), {
      collapsed: true,
    })

    expect(screen.queryByText('All Projects')).not.toBeInTheDocument()
    expect(screen.queryByText('Administration')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar width' }))
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
  })

  test('the expanded-mode collapse button also fires onToggleCollapsed', async () => {
    const user = userEvent.setup()
    const { onToggleCollapsed } = renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-7' }))

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
  })

  test('mobile open state renders the overlay which closes navigation on click', async () => {
    const user = userEvent.setup()
    const { onCloseMobile } = renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-8' }), {
      mobileOpen: true,
    })

    await user.click(screen.getByRole('button', { name: 'Close navigation' }))
    expect(onCloseMobile).toHaveBeenCalledTimes(1)
  })

  test('clicking any nav link also requests mobile close', async () => {
    const user = userEvent.setup()
    const { onCloseMobile } = renderSidebar(makeUser('ADMIN', { id: 'u-sb-admin-9' }), {
      mobileOpen: true,
    })

    await user.click(screen.getByRole('link', { name: 'All Projects' }))
    expect(onCloseMobile).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------

describe('Topbar', () => {
  function renderTopbar(user: AuthUser, onOpenMobileNav = vi.fn()) {
    const fetchMock = stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(user)
      if (url.includes('/api/projects')) {
        return okEnvelope(
          [{ id: 'p1', code: 'SKY-01', name: 'Skyline Residency' }],
          { page: 1, pageSize: 100, limit: 100, total: 1, totalPages: 1 },
        )
      }
      if (url === '/api/dashboard/admin') return okEnvelope(sidebarAdminDashboard([]))
      if (url === '/api/dashboard/pm') return okEnvelope(sidebarPmDashboard([], 1))
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <ProjectsProvider>
          <Topbar collapsed={false} onOpenMobileNav={onOpenMobileNav} />
        </ProjectsProvider>
      </AuthProvider>,
    )
    return { onOpenMobileNav, fetchMock }
  }

  test('renders the admin identity, org pill and opens mobile nav on demand', async () => {
    const user = userEvent.setup()
    const { onOpenMobileNav } = renderTopbar(makeUser('ADMIN', { id: 'u-tb-admin-1' }))

    expect(await screen.findByText('Asha Admin')).toBeInTheDocument()
    expect(screen.getByText('ORGANIZATION VIEW')).toBeInTheDocument()
    expect(screen.getByText('Administrator · asha@forge.test')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(onOpenMobileNav).toHaveBeenCalledTimes(1)
  })

  test('renders the PM identity with the ACTIVE SITE pill', async () => {
    renderTopbar(makeUser('PM', { id: 'u-tb-pm-1' }))

    expect(await screen.findByText('Prakash Manager')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE SITE')).toBeInTheDocument()
    expect(screen.getByText('Project Manager · prakash@forge.test')).toBeInTheDocument()
  })

  test('profile menu navigates to /app/profile', async () => {
    const user = userEvent.setup()
    renderTopbar(makeUser('ADMIN', { id: 'u-tb-admin-2' }))

    await user.click(await screen.findByRole('button', { name: /Asha Admin/ }))
    await user.click(await screen.findByRole('button', { name: 'Profile & password' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/profile'))
  })

  test('logout clears the session, calls the API and returns to /login', async () => {
    const user = userEvent.setup()
    const { fetchMock } = renderTopbar(makeUser('ADMIN', { id: 'u-tb-admin-3' }))

    await user.click(await screen.findByRole('button', { name: /Asha Admin/ }))
    await user.click(await screen.findByRole('button', { name: 'Logout' }))

    await waitFor(() => expect(window.location.hash).toBe('#/login'))
    // Identity resets once the auth context clears (the profile popover stays
    // open, so the fallback "Viewer" identity appears in both places).
    await waitFor(() => expect(screen.getAllByText('Viewer').length).toBeGreaterThan(0))

    const logoutCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/logout')
    expect(logoutCall).toBeDefined()
    expect(logoutCall?.[1]?.method).toBe('POST')
  })

  test('admin notifications load from the audit log and render items', async () => {
    const user = userEvent.setup()
    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString()
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-tb-admin-4' }))
      if (url.includes('/api/projects')) {
        return okEnvelope([], { page: 1, pageSize: 100, limit: 100, total: 0, totalPages: 1 })
      }
      if (url === '/api/dashboard/admin') return okEnvelope(sidebarAdminDashboard([]))
      if (url.startsWith('/api/audit-logs')) {
        return okEnvelope({
          items: [
            {
              id: 'a1',
              action: 'PROJECT_CREATE',
              actorName: 'Asha Admin',
              entityType: 'PROJECT',
              createdAt: tenMinutesAgo,
            },
          ],
        })
      }
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <ProjectsProvider>
          <Topbar collapsed={false} onOpenMobileNav={vi.fn()} />
        </ProjectsProvider>
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Notifications' }))

    expect(await screen.findByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Project create')).toBeInTheDocument()
    expect(screen.getByText('Asha Admin · PROJECT')).toBeInTheDocument()
    expect(screen.getByText('10 min ago')).toBeInTheDocument()
  })

  test('PM notifications load from the PM dashboard recent logs', async () => {
    const user = userEvent.setup()
    const anHourAgo = new Date(Date.now() - 60 * 60_000).toISOString()
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('PM', { id: 'u-tb-pm-2' }))
      if (url.includes('/api/projects')) {
        return okEnvelope([], { page: 1, pageSize: 100, limit: 100, total: 0, totalPages: 1 })
      }
      if (url === '/api/dashboard/pm') {
        return okEnvelope(sidebarPmDashboard([], 0, [
          { id: 'l1', workSummary: 'Slab casting finished', logDate: anHourAgo, projectName: 'Skyline' },
        ]))
      }
      return errEnvelope('unstubbed', 404)
    })
    render(
      <AuthProvider>
        <ProjectsProvider>
          <Topbar collapsed={false} onOpenMobileNav={vi.fn()} />
        </ProjectsProvider>
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Notifications' }))

    expect(await screen.findByText('Daily site log')).toBeInTheDocument()
    expect(screen.getByText('Slab casting finished')).toBeInTheDocument()
    expect(screen.getByText('1 hr ago')).toBeInTheDocument()
  })

  test('the command palette filters commands and navigates on selection', async () => {
    const user = userEvent.setup()
    renderTopbar(makeUser('ADMIN', { id: 'u-tb-admin-5' }))

    await user.click(screen.getByRole('button', { name: 'Search' }))

    const searchInput = screen.getByPlaceholderText('Search pages, projects, and tools...')
    expect(screen.getByRole('button', { name: /Open dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /View projects/ })).toBeInTheDocument()

    await user.type(searchInput, 'wastage')
    expect(screen.queryByRole('button', { name: /View projects/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open wastage analysis/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Open wastage analysis/ }))
    await waitFor(() => expect(window.location.hash).toBe('#/app/wastage'))
  })
})

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

describe('Breadcrumbs', () => {
  test('renders the Operations home link and the current crumb', () => {
    render(<Breadcrumbs current="Projects" />)

    const home = screen.getByRole('link', { name: 'Operations' })
    expect(home).toHaveAttribute('href', '#/app')
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// ProjectSelector
// ---------------------------------------------------------------------------

describe('ProjectSelector', () => {
  function projectRow(id: string, name: string, code: string) {
    return {
      id,
      code,
      name,
      description: null,
      location: 'Pune',
      status: 'ACTIVE' as const,
      startDate: null,
      expectedEndDate: null,
      actualEndDate: null,
      totalBudget: '100',
      wastageThresholdPct: 10,
      assignedPm: null,
      land: null,
    }
  }

  function renderSelector() {
    render(
      <AuthProvider>
        <ProjectsProvider>
          <ProjectSelector />
        </ProjectsProvider>
      </AuthProvider>,
    )
  }

  test('shows the loading caption until the projects resolve', async () => {
    let resolveProjects: ((value: Response) => void) | undefined
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-ps-1' }))
      if (url.includes('/api/projects')) {
        return new Promise<Response>((resolve) => {
          resolveProjects = resolve
        })
      }
      return errEnvelope('unstubbed', 404)
    })

    renderSelector()
    // Pre-auth the selector shows the empty caption; once /auth/me resolves
    // (with the projects fetch still pending) the loading caption appears.
    expect(await screen.findByText('Loading projects…')).toBeInTheDocument()

    resolveProjects?.(
      okEnvelope([projectRow('p1', 'Skyline Residency', 'SKY-01')], {
        page: 1,
        pageSize: 100,
        limit: 100,
        total: 1,
        totalPages: 1,
      }),
    )
    const select = await screen.findByLabelText('Select project')
    await waitFor(() => expect(select).toHaveDisplayValue('Skyline Residency'))
    expect(screen.getByText('SKY-01')).toBeInTheDocument()
  })

  test('renders the selected project, lists all options and persists a switch', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-ps-2' }))
      if (url.includes('/api/projects')) {
        return okEnvelope(
          [projectRow('p1', 'Skyline Residency', 'SKY-01'), projectRow('p2', 'Harbour Gateway', 'HG-07')],
          { page: 1, pageSize: 100, limit: 100, total: 2, totalPages: 1 },
        )
      }
      return errEnvelope('unstubbed', 404)
    })
    const user = userEvent.setup()
    renderSelector()

    const select = await screen.findByLabelText('Select project')
    await waitFor(() => expect(select).toHaveDisplayValue('Skyline Residency'))
    expect(select).toBeEnabled()
    expect(screen.getByText('SKY-01')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(2)

    await user.selectOptions(select, 'p2')
    await waitFor(() => expect(select).toHaveDisplayValue('Harbour Gateway'))
    expect(screen.getByText('HG-07')).toBeInTheDocument()
    expect(sessionStorage.getItem('forgeos_selected_project_u-ps-2')).toBe('p2')
  })

  test('an error shows the unavailable state with a working Retry action', async () => {
    let projectsFail = true
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-ps-3' }))
      if (url.includes('/api/projects')) {
        return projectsFail
          ? errEnvelope('Projects service unavailable', 500)
          : okEnvelope([projectRow('p1', 'Skyline Residency', 'SKY-01')], {
              page: 1,
              pageSize: 100,
              limit: 100,
              total: 1,
              totalPages: 1,
            })
      }
      return errEnvelope('unstubbed', 404)
    })
    const user = userEvent.setup()
    renderSelector()

    expect(await screen.findByText('Projects unavailable')).toBeInTheDocument()
    expect(screen.getByText('Unable to load projects')).toBeInTheDocument()
    expect(screen.getByLabelText('Select project')).toBeDisabled()

    projectsFail = false
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    const select = screen.getByLabelText('Select project')
    await waitFor(() => expect(select).toBeEnabled())
    await waitFor(() => expect(select).toHaveDisplayValue('Skyline Residency'))
  })

  test('an empty project list renders the empty caption with a disabled select', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-ps-4' }))
      if (url.includes('/api/projects')) {
        return okEnvelope([], { page: 1, pageSize: 100, limit: 100, total: 0, totalPages: 1 })
      }
      return errEnvelope('unstubbed', 404)
    })
    renderSelector()

    expect(await screen.findByText('No accessible projects')).toBeInTheDocument()
    expect(screen.getByText('Select an accessible project')).toBeInTheDocument()
    expect(screen.getByLabelText('Select project')).toBeDisabled()
  })
})
