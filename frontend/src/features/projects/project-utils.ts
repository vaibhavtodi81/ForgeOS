// Imports type  Project from ./projects-context so this module can reuse that component, helper, or library.
import type { Project } from './projects-context'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ApiProject {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the code field so the surrounding object or component receives this setting.
  code: string
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the status field so the surrounding object or component receives this setting.
  status: Project['status']
  // Sets the startDate field so the surrounding object or component receives this setting.
  startDate: string | null
  // Sets the expectedEndDate field so the surrounding object or component receives this setting.
  expectedEndDate: string | null
  // Sets the actualEndDate field so the surrounding object or component receives this setting.
  actualEndDate: string | null
  // Sets the totalBudget field so the surrounding object or component receives this setting.
  totalBudget: string | number
  // Sets the assignedPm field so the surrounding object or component receives this setting.
  assignedPm: Project['assignedPm']
  // Continues the component or data expression so its related values and behavior stay grouped together.
  land?: {
    // Continues the component or data expression so its related values and behavior stay grouped together.
    addressLine?: string | null
    // Continues the component or data expression so its related values and behavior stay grouped together.
    city?: string | null
    // Continues the component or data expression so its related values and behavior stay grouped together.
    state?: string | null
    // Continues the component or data expression so its related values and behavior stay grouped together.
    pincode?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  } | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines mapProject so this module can perform its named task when needed.
export function mapProject(project: ApiProject): Project {
  // Stores the value in location so later lines can reuse this data or behavior for the current feature.
  const location = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    project.land?.addressLine,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    project.land?.city,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    project.land?.state,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    project.land?.pincode,
  // Keeps only items matching this condition so the result contains relevant data.
  ].filter(Boolean).join(', ')
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the id field so the surrounding object or component receives this setting.
    id: project.id,
    // Sets the code field so the surrounding object or component receives this setting.
    code: project.code,
    // Sets the name field so the surrounding object or component receives this setting.
    name: project.name,
    // Sets the location field so the surrounding object or component receives this setting.
    location: location || 'Location not specified',
    // Sets the status field so the surrounding object or component receives this setting.
    status: project.status,
    // Sets the startDate field so the surrounding object or component receives this setting.
    startDate: project.startDate,
    // Sets the expectedEndDate field so the surrounding object or component receives this setting.
    expectedEndDate: project.expectedEndDate,
    // Sets the actualEndDate field so the surrounding object or component receives this setting.
    actualEndDate: project.actualEndDate,
    // Sets the totalBudget field so the surrounding object or component receives this setting.
    totalBudget: project.totalBudget,
    // Sets the assignedPm field so the surrounding object or component receives this setting.
    assignedPm: project.assignedPm,
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Supports the projects frontend feature with project utils.
