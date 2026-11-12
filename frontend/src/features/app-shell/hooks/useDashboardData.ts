import { useCallback, useEffect, useState } from 'react'
import type { Project } from '../../projects/projects-context'
import { fetchDashboardProjectData, type DashboardProjectData } from '../data/dashboardApi'

interface DashboardLoadState {
  requestKey: string
  projects: DashboardProjectData[]
  error: string | null
}

export function useDashboardData(projects: Project[]) {
  const [retryCount, setRetryCount] = useState(0)
  const [loadState, setLoadState] = useState<DashboardLoadState | null>(null)
  const projectIds = projects.map((project) => project.id).join(',')
  const requestKey = `${projectIds}:${retryCount}`

  useEffect(() => {
    if (!projectIds) return

    const controller = new AbortController()
    void Promise.all(projects.map((project) => fetchDashboardProjectData(project, controller.signal))).then((dashboardProjects) => {
      setLoadState({ requestKey, projects: dashboardProjects, error: null })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      setLoadState({
        requestKey,
        projects: [],
        error: cause instanceof Error ? cause.message : 'Unable to load dashboard data.',
      })
    })

    return () => controller.abort()
  }, [projects, projectIds, requestKey])

  const currentState = loadState?.requestKey === requestKey ? loadState : null
  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  return {
    projects: currentState?.projects ?? [],
    isLoading: Boolean(projectIds && !currentState),
    error: currentState?.error ?? null,
    retry,
  }
}
