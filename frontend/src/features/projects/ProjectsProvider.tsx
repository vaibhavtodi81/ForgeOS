// Imports useCallback, useEffect, useMemo, useState, type ReactNode from react so this module can reuse that component, helper, or library.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
// Imports apiGet from ../../lib/api so this module can reuse that component, helper, or library.
import { apiGet } from '../../lib/api'
// Imports useAuth from ../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../authentication/auth/useAuth'
// Imports ProjectsContext, type Project from ./projects-context so this module can reuse that component, helper, or library.
import { ProjectsContext, type Project } from './projects-context'
// Imports mapProject, type ApiProject from ./project-utils so this module can reuse that component, helper, or library.
import { mapProject, type ApiProject } from './project-utils'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectLoadState {
  // Sets the requestKey field so the surrounding object or component receives this setting.
  requestKey: string
  // Sets the projects field so the surrounding object or component receives this setting.
  projects: Project[]
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in noProjects so later lines can reuse this data or behavior for the current feature.
const noProjects: Project[] = []

// Defines ProjectsProvider so this module can perform its named task when needed.
export function ProjectsProvider({ children }: { children: ReactNode }) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user, status: authStatus } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [projectLoadState, setProjectLoadState] = useState<ProjectLoadState | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [selectedProjectId, setSelectedProjectId] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Stores the value in storageKey so later lines can reuse this data or behavior for the current feature.
  const storageKey = user ? `forgeos_selected_project_${user.id}` : null
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = authStatus === 'authenticated' && user ? `${user.id}:${retryCount}` : null

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!requestKey || !storageKey) return

    // Stores the value in active so later lines can reuse this data or behavior for the current feature.
    let active = true
    // Stores the value in fetchProjects so later lines can reuse this data or behavior for the current feature.
    const fetchProjects = async () => {
      // Starts an error-handling region so failures can be caught and handled safely.
      try {
        // Stores the value in firstPage so later lines can reuse this data or behavior for the current feature.
        const firstPage = await apiGet<ApiProject[]>('/projects?page=1&pageSize=100')
        // Stores the value in totalPages so later lines can reuse this data or behavior for the current feature.
        const totalPages = Number(firstPage.meta?.totalPages ?? 1)
        // Stores the value in remainingPages so later lines can reuse this data or behavior for the current feature.
        const remainingPages = await Promise.all(
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            apiGet<ApiProject[]>(`/projects?page=${index + 2}&pageSize=100`)
          // Closes this function call or grouped expression so the surrounding code can continue.
          ),
        // Closes this function call or grouped expression so the surrounding code can continue.
        )
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!active) return

        // Stores the value in availableProjects so later lines can reuse this data or behavior for the current feature.
        const availableProjects = [firstPage, ...remainingPages]
          // Continues the component or data expression so its related values and behavior stay grouped together.
          .flatMap((page) => page.data)
          // Transforms each collection item so the corresponding values or interface elements can be produced.
          .map(mapProject)
        // Stores the value in savedProjectId so later lines can reuse this data or behavior for the current feature.
        const savedProjectId = sessionStorage.getItem(storageKey)
        // Stores the value in selected so later lines can reuse this data or behavior for the current feature.
        const selected = availableProjects.find((project) => String(project.id) === savedProjectId)
          // Continues the component or data expression so its related values and behavior stay grouped together.
          ?? availableProjects[0]
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setProjectLoadState({ requestKey, projects: availableProjects, error: null })
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSelectedProjectId(selected ? String(selected.id) : '')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      } catch (cause) {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!active) return
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setProjectLoadState({
          // Continues the component or data expression so its related values and behavior stay grouped together.
          requestKey,
          // Sets the projects field so the surrounding object or component receives this setting.
          projects: [],
          // Sets the error field so the surrounding object or component receives this setting.
          error: cause instanceof Error ? cause.message : 'Unable to load accessible projects.',
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Closes the current block or object so the grouped statements or settings end here.
    }

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    void fetchProjects()
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => { active = false }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [requestKey, storageKey])

  // Stores the value in currentLoadState so later lines can reuse this data or behavior for the current feature.
  const currentLoadState = requestKey && projectLoadState?.requestKey === requestKey
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? projectLoadState
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : null
  // Stores the value in projects so later lines can reuse this data or behavior for the current feature.
  const projects = currentLoadState?.projects ?? noProjects
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = Boolean(requestKey && !currentLoadState)
  // Stores the value in error so later lines can reuse this data or behavior for the current feature.
  const error = currentLoadState?.error ?? null

  // Stores the value in selectProject so later lines can reuse this data or behavior for the current feature.
  const selectProject = useCallback((id: string) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!projects.some((project) => String(project.id) === id)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSelectedProjectId(id)
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (storageKey) sessionStorage.setItem(storageKey, id)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projects, storageKey])

  // Stores the value in retry so later lines can reuse this data or behavior for the current feature.
  const retry = useCallback(() => setRetryCount((count) => count + 1), [])
  // Stores the value in selectedProject so later lines can reuse this data or behavior for the current feature.
  const selectedProject = projects.find((project) => String(project.id) === selectedProjectId) ?? null
  // Caches value so its calculation is repeated only when its inputs change.
  // Caches value so its calculation is repeated only when its inputs change.
  const value = useMemo(() => ({
    // Continues the component or data expression so its related values and behavior stay grouped together.
    projects,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    selectedProject,
    // Sets the selectedProjectId field so the surrounding object or component receives this setting.
    selectedProjectId: selectedProject ? String(selectedProject.id) : '',
    // Continues the component or data expression so its related values and behavior stay grouped together.
    isLoading,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    error,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    selectProject,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    retry,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [projects, selectedProject, isLoading, error, selectProject, retry])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Loads and shares project state with frontend pages and components.
