import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { useContext, useEffect, type ReactNode } from 'react'
import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { useAuth } from '@/forgeos/features/authentication/auth/useAuth'
import { ProjectsProvider } from '@/forgeos/features/projects/ProjectsProvider'
import { useProjects } from '@/forgeos/features/projects/useProjects'
import { ProjectsContext, type ProjectsContextValue } from '@/forgeos/features/projects/projects-context'
import { calledUrls, errEnvelope, flushAsync, makeUser, okEnvelope, resetForgeOsState, stubFetch } from './test-utils'
import type { ApiProject } from '@/forgeos/features/projects/project-utils'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

function apiProject(id: string, overrides: Partial<ApiProject> = {}): ApiProject {
  return {
    id,
    code: `${id.toUpperCase()}-01`,
    name: `Project ${id}`,
    description: null,
    location: 'Pune',
    status: 'ACTIVE',
    startDate: null,
    expectedEndDate: null,
    actualEndDate: null,
    totalBudget: '1000000',
    wastageThresholdPct: 10,
    assignedPm: null,
    land: null,
    ...overrides,
  }
}

function pageMeta(page: number, total: number, totalPages: number) {
  return { page, pageSize: 100, limit: 100, total, totalPages }
}

/**
 * Renders both hooks inside the real provider stack so tests can await the
 * auth handshake before asserting on project state.
 */
function renderProvidersHook() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <ProjectsProvider>{children}</ProjectsProvider>
    </AuthProvider>
  )
  return renderHook(
    () => ({ auth: useAuth(), projects: useProjects() }),
    { wrapper },
  )
}

describe('useProjects context guard', () => {
  test('throws when rendered outside ProjectsProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      expect(() => renderHook(() => useProjects())).toThrow(
        'useProjects must be used within ProjectsProvider.',
      )
    } finally {
      consoleSpy.mockRestore()
    }
  })
})

describe('ProjectsProvider — initial load', () => {
  test('does not fetch projects while unauthenticated', async () => {
    const fetchMock = stubFetch((url) =>
      url === '/api/auth/me' ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED') : errEnvelope('unstubbed', 404),
    )

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.auth.status).toBe('unauthenticated'))
    expect(result.current.projects.isLoading).toBe(false)
    expect(result.current.projects.projects).toEqual([])
    expect(result.current.projects.error).toBeNull()
    expect(calledUrls(fetchMock).some((u) => u.includes('/api/projects'))).toBe(false)
  })

  test('loads page 1 with pageSize=100 and maps the rows through mapProject', async () => {
    const admin = makeUser('ADMIN', { id: 'u-proj-1' })
    const fetchMock = stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url.includes('/api/projects')) {
        return okEnvelope(
          [
            apiProject('p1', { name: 'Skyline Residency', location: null, land: { addressLine: null, city: 'Pune', state: null, pincode: null } }),
            apiProject('p2', { name: 'Harbour Gateway' }),
          ],
          pageMeta(1, 2, 1),
        )
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))
    await waitFor(() => expect(result.current.projects.projects).toHaveLength(2))
    expect(result.current.projects.isLoading).toBe(false)
    expect(result.current.projects.error).toBeNull()

    // mapProject applied: null location + land city → composed location
    expect(result.current.projects.projects[0]).toMatchObject({
      id: 'p1',
      name: 'Skyline Residency',
      location: 'Pune',
    })
    expect(result.current.projects.projects[1].name).toBe('Harbour Gateway')

    expect(calledUrls(fetchMock)).toContain('/api/projects?page=1&pageSize=100')
    expect(calledUrls(fetchMock).some((u) => u.includes('page=2'))).toBe(false)
  })

  test('auto-selects the first project when nothing is saved', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-proj-2' }))
      if (url.includes('/api/projects')) {
        return okEnvelope([apiProject('p1'), apiProject('p2')], pageMeta(1, 2, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.projects.selectedProjectId).toBe('p1'))
    expect(result.current.projects.selectedProject?.id).toBe('p1')
  })

  test('fetches every page when meta.totalPages > 1 and merges the results', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-proj-3' }))
      if (url.includes('/api/projects')) {
        const page = new URLSearchParams(url.split('?')[1] ?? '').get('page')
        if (page === '1') return okEnvelope([apiProject('p1')], pageMeta(1, 2, 2))
        if (page === '2') return okEnvelope([apiProject('p2'), apiProject('p3')], pageMeta(2, 2, 2))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.projects.projects).toHaveLength(3))
    expect(result.current.projects.projects.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
    expect(result.current.projects.selectedProjectId).toBe('p1')
  })

  test('with an empty project list, selection is empty and selectedProject is null', async () => {
    const fetchMock = stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-proj-4' }))
      if (url.includes('/api/projects')) return okEnvelope([], pageMeta(1, 0, 1))
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))
    await waitFor(() =>
      expect(calledUrls(fetchMock).some((u) => u.startsWith('/api/projects'))).toBe(true),
    )
    // Let the load promise chain settle so the provider state reflects the
    // completed (empty) load rather than the pre-load default.
    await flushAsync()

    expect(result.current.projects.projects).toEqual([])
    expect(result.current.projects.selectedProjectId).toBe('')
    expect(result.current.projects.selectedProject).toBeNull()
    expect(result.current.projects.isLoading).toBe(false)
    expect(result.current.projects.error).toBeNull()
  })
})

describe('ProjectsProvider — selection persistence', () => {
  test('restores the project saved in sessionStorage for that user', async () => {
    const admin = makeUser('ADMIN', { id: 'u-proj-5' })
    sessionStorage.setItem('forgeos_selected_project_u-proj-5', 'p2')
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url.includes('/api/projects')) {
        return okEnvelope([apiProject('p1'), apiProject('p2')], pageMeta(1, 2, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.projects.selectedProjectId).toBe('p2'))
    expect(result.current.projects.selectedProject?.name).toBe('Project p2')
  })

  test('falls back to the first project when the saved id no longer exists', async () => {
    const admin = makeUser('ADMIN', { id: 'u-proj-6' })
    sessionStorage.setItem('forgeos_selected_project_u-proj-6', 'deleted-project')
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url.includes('/api/projects')) {
        return okEnvelope([apiProject('p1')], pageMeta(1, 1, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.projects.selectedProjectId).toBe('p1'))
  })

  test('selectProject updates state and persists the choice to sessionStorage', async () => {
    const admin = makeUser('ADMIN', { id: 'u-proj-7' })
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url.includes('/api/projects')) {
        return okEnvelope([apiProject('p1'), apiProject('p2')], pageMeta(1, 2, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()
    await waitFor(() => expect(result.current.projects.selectedProjectId).toBe('p1'))

    act(() => result.current.projects.selectProject('p2'))

    expect(result.current.projects.selectedProjectId).toBe('p2')
    expect(result.current.projects.selectedProject?.id).toBe('p2')
    expect(sessionStorage.getItem('forgeos_selected_project_u-proj-7')).toBe('p2')
  })

  test('selectProject ignores ids that are not in the loaded list', async () => {
    const admin = makeUser('ADMIN', { id: 'u-proj-8' })
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url.includes('/api/projects')) {
        return okEnvelope([apiProject('p1')], pageMeta(1, 1, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()
    await waitFor(() => expect(result.current.projects.selectedProjectId).toBe('p1'))

    act(() => result.current.projects.selectProject('not-a-project'))
    expect(result.current.projects.selectedProjectId).toBe('p1')
    expect(sessionStorage.getItem('forgeos_selected_project_u-proj-8')).toBeNull()
  })
})

describe('ProjectsProvider — error and retry', () => {
  test('a failed load surfaces the server error message', async () => {
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-proj-9' }))
      if (url.includes('/api/projects')) return errEnvelope('Projects service unavailable', 500, 'INTERNAL')
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()

    await waitFor(() => expect(result.current.projects.error).toBe('Projects service unavailable'))
    expect(result.current.projects.projects).toEqual([])
    expect(result.current.projects.isLoading).toBe(false)
    expect(result.current.projects.selectedProjectId).toBe('')
  })

  test('retry re-runs the load and recovers when the API comes back', async () => {
    let projectsFail = true
    stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(makeUser('ADMIN', { id: 'u-proj-10' }))
      if (url.includes('/api/projects')) {
        return projectsFail
          ? errEnvelope('Projects service unavailable', 500, 'INTERNAL')
          : okEnvelope([apiProject('p1')], pageMeta(1, 1, 1))
      }
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderProvidersHook()
    await waitFor(() => expect(result.current.projects.error).toBe('Projects service unavailable'))

    projectsFail = false
    act(() => result.current.projects.retry())

    await waitFor(() => expect(result.current.projects.projects).toHaveLength(1))
    expect(result.current.projects.error).toBeNull()
    expect(result.current.projects.selectedProjectId).toBe('p1')
  })
})

describe('ProjectsContext default value', () => {
  test('the context resolves to null when no ProjectsProvider is mounted', () => {
    let observed: ProjectsContextValue | null | undefined
    function Probe() {
      const value = useContext(ProjectsContext)
      useEffect(() => {
        observed = value
      })
      return null
    }

    render(<Probe />)

    expect(observed).toBeNull()
  })
})
