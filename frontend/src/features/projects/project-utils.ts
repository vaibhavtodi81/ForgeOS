import type { Project } from './projects-context'

export interface ApiProject {
  id: number
  code: string
  name: string
  status: Project['status']
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
  totalBudget: string | number
  assignedPm: Project['assignedPm']
  land?: {
    addressLine?: string | null
    city?: string | null
    state?: string | null
    pincode?: string | null
  } | null
}

export function mapProject(project: ApiProject): Project {
  const location = [
    project.land?.addressLine,
    project.land?.city,
    project.land?.state,
    project.land?.pincode,
  ].filter(Boolean).join(', ')
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    location: location || 'Location not specified',
    status: project.status,
    startDate: project.startDate,
    expectedEndDate: project.expectedEndDate,
    actualEndDate: project.actualEndDate,
    totalBudget: project.totalBudget,
    assignedPm: project.assignedPm,
  }
}
