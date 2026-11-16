// Imports createContext from react so this module can reuse that component, helper, or library.
import { createContext } from 'react'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface Project {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the code field so the surrounding object or component receives this setting.
  code: string
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the location field so the surrounding object or component receives this setting.
  location: string
  // Sets the status field so the surrounding object or component receives this setting.
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  // Sets the startDate field so the surrounding object or component receives this setting.
  startDate: string | null
  // Sets the expectedEndDate field so the surrounding object or component receives this setting.
  expectedEndDate: string | null
  // Sets the actualEndDate field so the surrounding object or component receives this setting.
  actualEndDate: string | null
  // Sets the totalBudget field so the surrounding object or component receives this setting.
  totalBudget: string | number
  // Sets the assignedPm field so the surrounding object or component receives this setting.
  assignedPm: { id: number; name: string; email: string } | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectsContextValue {
  // Sets the projects field so the surrounding object or component receives this setting.
  projects: Project[]
  // Sets the selectedProject field so the surrounding object or component receives this setting.
  selectedProject: Project | null
  // Sets the selectedProjectId field so the surrounding object or component receives this setting.
  selectedProjectId: string
  // Sets the isLoading field so the surrounding object or component receives this setting.
  isLoading: boolean
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
  // Sets the selectProject field so the surrounding object or component receives this setting.
  selectProject: (id: string) => void
  // Sets the retry field so the surrounding object or component receives this setting.
  retry: () => void
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in ProjectsContext so later lines can reuse this data or behavior for the current feature.
export const ProjectsContext = createContext<ProjectsContextValue | null>(null)
// File purpose: Supports the projects frontend feature with projects context.
