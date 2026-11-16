// Imports useCallback, useEffect, useState from react so this module can reuse that component, helper, or library.
import { useCallback, useEffect, useState } from 'react'
// Imports type  Project from ../../projects/projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../../projects/projects-context'
// Imports fetchDashboardProjectData, type DashboardProjectData from ../data/dashboardApi so this module can reuse that component, helper, or library.
import { fetchDashboardProjectData, type DashboardProjectData } from '../data/dashboardApi'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface DashboardLoadState {
  // Sets the requestKey field so the surrounding object or component receives this setting.
  requestKey: string
  // Sets the projects field so the surrounding object or component receives this setting.
  projects: DashboardProjectData[]
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines useDashboardData so this module can perform its named task when needed.
export function useDashboardData(projects: Project[]) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadState, setLoadState] = useState<DashboardLoadState | null>(null)
  // Stores the value in projectIds so later lines can reuse this data or behavior for the current feature.
  const projectIds = projects.map((project) => project.id).join(',')
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectIds}:${retryCount}`

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!projectIds) return

    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    void Promise.all(projects.map((project) => fetchDashboardProjectData(project, controller.signal))).then((dashboardProjects) => {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setLoadState({ requestKey, projects: dashboardProjects, error: null })
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (controller.signal.aborted) return
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setLoadState({
        // Continues the component or data expression so its related values and behavior stay grouped together.
        requestKey,
        // Sets the projects field so the surrounding object or component receives this setting.
        projects: [],
        // Sets the error field so the surrounding object or component receives this setting.
        error: cause instanceof Error ? cause.message : 'Unable to load dashboard data.',
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })

    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projects, projectIds, requestKey])

  // Stores the value in currentState so later lines can reuse this data or behavior for the current feature.
  const currentState = loadState?.requestKey === requestKey ? loadState : null
  // Stores the value in retry so later lines can reuse this data or behavior for the current feature.
  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the projects field so the surrounding object or component receives this setting.
    projects: currentState?.projects ?? [],
    // Sets the isLoading field so the surrounding object or component receives this setting.
    isLoading: Boolean(projectIds && !currentState),
    // Sets the error field so the surrounding object or component receives this setting.
    error: currentState?.error ?? null,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    retry,
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Encapsulates reusable React state and effects for useDashboardData.
