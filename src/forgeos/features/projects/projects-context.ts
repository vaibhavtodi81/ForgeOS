import { createContext } from 'react'

export interface Project {
  id: string
  code: string
  name: string
  location: string
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
  totalBudget: string | number
  wastageThresholdPct?: number
  assignedPm: { id: string; name: string; email: string } | null
}

export interface ProjectsContextValue {
  projects: Project[]
  selectedProject: Project | null
  selectedProjectId: string
  isLoading: boolean
  error: string | null
  selectProject: (id: string) => void
  retry: () => void
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null)
