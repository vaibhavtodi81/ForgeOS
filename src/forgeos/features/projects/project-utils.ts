import type { Project } from './projects-context'

/** Raw project row as returned by GET /api/projects (original contract). */
export interface ApiProject {
  id: string
  code: string
  name: string
  description?: string | null
  location?: string | null
  status: Project['status']
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
  totalBudget: string | number
  wastageThresholdPct?: number
  assignedPm: { id: string; name: string; email: string } | null
  land?: {
    name?: string | null
    addressLine?: string | null
    city?: string | null
    state?: string | null
    pincode?: string | null
  } | null
}

export function mapProject(project: ApiProject): Project {
  const location = [project.location, project.land?.addressLine, project.land?.city, project.land?.state]
    .filter(Boolean)
    .join(', ')
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
    wastageThresholdPct: project.wastageThresholdPct,
    assignedPm: project.assignedPm,
  }
}
