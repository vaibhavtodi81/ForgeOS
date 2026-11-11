import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export interface LabourByTrade {
  trade: string
  workerCount: number
  labourHours: number
  entries: number
}

export interface LabourSummary {
  totalWorkerCount: number
  totalLabourHours: number
  totalLabourEntries: number
  byTrade: LabourByTrade[]
}

export interface WorkerCountHistory {
  dailyLogId: number
  logDate: string
  totalWorkerCount: number
  labourHours: number
  byTrade: LabourByTrade[]
}

export interface MachineryByMachine {
  machineName: string
  hoursUsed: number
  fuelConsumption: number
  entries: number
}

export interface MachinerySummary {
  totalMachineryHours: number
  totalFuelConsumption: number
  totalMachineryEntries: number
  byMachine: MachineryByMachine[]
}

export interface MachineryUsageHistory {
  dailyLogId: number
  logDate: string
  machineName: string
  hoursUsed: number
  fuelConsumption: number
  operatorName: string | null
}

export interface ProjectActivity {
  id: number
  action: string
  entityType: string
  entityId: number
  userId: number | null
  userName: string | null
  oldData: unknown
  newData: unknown
  createdAt: string
}

export interface ActivityPage {
  activities: ProjectActivity[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'

export interface ProjectMilestone {
  id: number
  projectId: number
  name: string
  description: string | null
  sequence: number
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  status: MilestoneStatus
  progressPercent: string | number
  createdAt: string
  updatedAt: string
}

export interface MilestoneInput {
  name: string
  description?: string | null
  sequence: number
  plannedStartDate?: string | null
  plannedEndDate?: string | null
  actualStartDate?: string | null
  actualEndDate?: string | null
  status: MilestoneStatus
  progressPercent: number
}

function dateQuery(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function fetchProjectActivity(projectId: string, page = 1, limit = 20, signal?: AbortSignal): Promise<ActivityPage> {
  const response = await apiGet<ProjectActivity[]>(
    `/projects/${encodeURIComponent(projectId)}/activity?page=${page}&limit=${limit}`,
    { signal },
  )
  return {
    activities: response.data,
    page: Number(response.meta?.page ?? page),
    limit: Number(response.meta?.limit ?? limit),
    total: Number(response.meta?.total ?? response.data.length),
    totalPages: Number(response.meta?.totalPages ?? 1),
  }
}

export async function fetchLabourSummary(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<LabourSummary> {
  const response = await apiGet<LabourSummary>(`/projects/${encodeURIComponent(projectId)}/labour-summary${dateQuery(from, to)}`, { signal })
  return response.data
}

export async function fetchWorkerCountHistory(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<WorkerCountHistory[]> {
  const response = await apiGet<WorkerCountHistory[]>(`/projects/${encodeURIComponent(projectId)}/worker-count-history${dateQuery(from, to)}`, { signal })
  return response.data
}

export async function fetchMachinerySummary(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<MachinerySummary> {
  const response = await apiGet<MachinerySummary>(`/projects/${encodeURIComponent(projectId)}/machinery-summary${dateQuery(from, to)}`, { signal })
  return response.data
}

export async function fetchMachineryUsageHistory(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<MachineryUsageHistory[]> {
  const response = await apiGet<MachineryUsageHistory[]>(`/projects/${encodeURIComponent(projectId)}/machinery-usage-history${dateQuery(from, to)}`, { signal })
  return response.data
}

export async function fetchProjectMilestones(projectId: string, signal?: AbortSignal): Promise<ProjectMilestone[]> {
  const response = await apiGet<ProjectMilestone[]>(`/projects/${encodeURIComponent(projectId)}/milestones`, { signal })
  return response.data
}

export async function createProjectMilestone(projectId: string, input: MilestoneInput): Promise<ProjectMilestone> {
  const response = await apiPost<ProjectMilestone>(`/projects/${encodeURIComponent(projectId)}/milestones`, input)
  return response.data
}

export async function updateProjectMilestone(id: number, input: Partial<MilestoneInput>): Promise<ProjectMilestone> {
  const response = await apiRequest<ProjectMilestone>(`/milestones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function deleteProjectMilestone(id: number): Promise<void> {
  await apiRequest<null>(`/milestones/${id}`, { method: 'DELETE' })
}
