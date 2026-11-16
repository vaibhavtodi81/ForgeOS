// Imports useContext from react so this module can reuse that component, helper, or library.
import { useContext } from 'react'
// Imports ProjectsContext from ./projects-context so this module can reuse that component, helper, or library.
import { ProjectsContext } from './projects-context'

// Defines useProjects so this module can perform its named task when needed.
export function useProjects() {
  // Stores the value in context so later lines can reuse this data or behavior for the current feature.
  const context = useContext(ProjectsContext)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!context) throw new Error('useProjects must be used within ProjectsProvider.')
  // Returns the result so the caller or React receives the value or interface this function provides.
  return context
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Supports the projects frontend feature with useProjects.
