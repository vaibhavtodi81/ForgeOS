import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiGet } from '../../lib/api'
import { useAuth } from '../authentication/auth/useAuth'
import { ProjectsContext, type Project } from './projects-context'
import { mapProject, type ApiProject } from './project-utils'

interface ProjectLoadState {
  requestKey: string
  projects: Project[]
  error: string | null
}

const noProjects: Project[] = []

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth()
  const [projectLoadState, setProjectLoadState] = useState<ProjectLoadState | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const storageKey = user ? `forgeos_selected_project_${user.id}` : null
  const requestKey = authStatus === 'authenticated' && user ? `${user.id}:${retryCount}` : null

  useEffect(() => {
    if (!requestKey || !storageKey) return

    let active = true
    const fetchProjects = async () => {
      try {
        const firstPage = await apiGet<ApiProject[]>('/projects?page=1&pageSize=100')
        const totalPages = Number(firstPage.meta?.totalPages ?? 1)
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
            apiGet<ApiProject[]>(`/projects?page=${index + 2}&pageSize=100`)
          ),
        )
        if (!active) return

        const availableProjects = [firstPage, ...remainingPages]
          .flatMap((page) => page.data)
          .map(mapProject)
        const savedProjectId = sessionStorage.getItem(storageKey)
        const selected = availableProjects.find((project) => String(project.id) === savedProjectId)
          ?? availableProjects[0]
        setProjectLoadState({ requestKey, projects: availableProjects, error: null })
        setSelectedProjectId(selected ? String(selected.id) : '')
      } catch (cause) {
        if (!active) return
        setProjectLoadState({
          requestKey,
          projects: [],
          error: cause instanceof Error ? cause.message : 'Unable to load accessible projects.',
        })
      }
    }

    void fetchProjects()
    return () => { active = false }
  }, [requestKey, storageKey])

  const currentLoadState = requestKey && projectLoadState?.requestKey === requestKey
    ? projectLoadState
    : null
  const projects = currentLoadState?.projects ?? noProjects
  const isLoading = Boolean(requestKey && !currentLoadState)
  const error = currentLoadState?.error ?? null

  const selectProject = useCallback((id: string) => {
    if (!projects.some((project) => String(project.id) === id)) return
    setSelectedProjectId(id)
    if (storageKey) sessionStorage.setItem(storageKey, id)
  }, [projects, storageKey])

  const retry = useCallback(() => setRetryCount((count) => count + 1), [])
  const selectedProject = projects.find((project) => String(project.id) === selectedProjectId) ?? null
  const value = useMemo(() => ({
    projects,
    selectedProject,
    selectedProjectId: selectedProject ? String(selectedProject.id) : '',
    isLoading,
    error,
    selectProject,
    retry,
  }), [projects, selectedProject, isLoading, error, selectProject, retry])

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}
