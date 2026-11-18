import { apiGet, apiPost, apiRequest } from '../../../lib/api'
import type { ApiProject } from '../project-utils'

export interface LandOption {
  id: string
  name: string
  city: string
}

export interface ManagerOption {
  id: string
  name: string
}

export interface ProjectFormInput {
  name: string
  location: string
  landId: string
  totalBudget: number
  startDate: string
  expectedEndDate: string
  wastageThresholdPct: number
}

export async function fetchLandOptions(signal: AbortSignal): Promise<LandOption[]> {
  const firstPage = await apiGet<LandOption[]>('/lands?page=1&limit=100', { signal })
  const totalPages = Number(firstPage.meta?.totalPages ?? 1)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
      apiGet<LandOption[]>(`/lands?page=${index + 2}&limit=100`, { signal }),
    ),
  )
  return [firstPage, ...remainingPages].flatMap((page) => page.data)
}

export async function fetchManagerOptions(signal: AbortSignal): Promise<ManagerOption[]> {
  const { data } = await apiGet<{ managers: ManagerOption[] }>('/meta', { signal })
  return data.managers
}

export interface ApiProjectDetailRow extends ApiProject {
  landId: string | null
  assignedPmId: string | null
  createdAt: string
  updatedAt: string
}

export async function fetchProjectForEdit(projectId: string, signal: AbortSignal): Promise<ApiProjectDetailRow> {
  const { data } = await apiGet<ApiProjectDetailRow>(`/projects/${encodeURIComponent(projectId)}`, { signal })
  return data
}

export async function createProject(input: ProjectFormInput): Promise<ApiProject> {
  const { data } = await apiPost<{ project: ApiProject }>('/projects', input)
  return data.project
}

export async function updateProject(projectId: string, input: ProjectFormInput): Promise<ApiProject> {
  const { data } = await apiRequest<{ project: ApiProject }>(`/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.project
}

export async function assignProjectPm(projectId: string, pmId: string | null): Promise<ApiProject> {
  const { data } = await apiRequest<{ project: ApiProject }>(`/projects/${encodeURIComponent(projectId)}/assign-pm`, {
    method: 'PATCH',
    body: JSON.stringify({ pmId }),
  })
  return data.project
}

export async function updateProjectStatus(projectId: string, status: string): Promise<ApiProject> {
  const { data } = await apiRequest<{ project: ApiProject }>(`/projects/${encodeURIComponent(projectId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return data.project
}
