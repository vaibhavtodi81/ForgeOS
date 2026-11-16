// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface LabourByTrade {
  // Sets the trade field so the surrounding object or component receives this setting.
  trade: string
  // Sets the workerCount field so the surrounding object or component receives this setting.
  workerCount: number
  // Sets the labourHours field so the surrounding object or component receives this setting.
  labourHours: number
  // Sets the entries field so the surrounding object or component receives this setting.
  entries: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface LabourSummary {
  // Sets the totalWorkerCount field so the surrounding object or component receives this setting.
  totalWorkerCount: number
  // Sets the totalLabourHours field so the surrounding object or component receives this setting.
  totalLabourHours: number
  // Sets the totalLabourEntries field so the surrounding object or component receives this setting.
  totalLabourEntries: number
  // Sets the byTrade field so the surrounding object or component receives this setting.
  byTrade: LabourByTrade[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface WorkerCountHistory {
  // Sets the dailyLogId field so the surrounding object or component receives this setting.
  dailyLogId: number
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the totalWorkerCount field so the surrounding object or component receives this setting.
  totalWorkerCount: number
  // Sets the labourHours field so the surrounding object or component receives this setting.
  labourHours: number
  // Sets the byTrade field so the surrounding object or component receives this setting.
  byTrade: LabourByTrade[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MachineryByMachine {
  // Sets the machineName field so the surrounding object or component receives this setting.
  machineName: string
  // Sets the hoursUsed field so the surrounding object or component receives this setting.
  hoursUsed: number
  // Sets the fuelConsumption field so the surrounding object or component receives this setting.
  fuelConsumption: number
  // Sets the entries field so the surrounding object or component receives this setting.
  entries: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MachinerySummary {
  // Sets the totalMachineryHours field so the surrounding object or component receives this setting.
  totalMachineryHours: number
  // Sets the totalFuelConsumption field so the surrounding object or component receives this setting.
  totalFuelConsumption: number
  // Sets the totalMachineryEntries field so the surrounding object or component receives this setting.
  totalMachineryEntries: number
  // Sets the byMachine field so the surrounding object or component receives this setting.
  byMachine: MachineryByMachine[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MachineryUsageHistory {
  // Sets the dailyLogId field so the surrounding object or component receives this setting.
  dailyLogId: number
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the machineName field so the surrounding object or component receives this setting.
  machineName: string
  // Sets the hoursUsed field so the surrounding object or component receives this setting.
  hoursUsed: number
  // Sets the fuelConsumption field so the surrounding object or component receives this setting.
  fuelConsumption: number
  // Sets the operatorName field so the surrounding object or component receives this setting.
  operatorName: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectActivity {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the action field so the surrounding object or component receives this setting.
  action: string
  // Sets the entityType field so the surrounding object or component receives this setting.
  entityType: string
  // Sets the entityId field so the surrounding object or component receives this setting.
  entityId: number
  // Sets the userId field so the surrounding object or component receives this setting.
  userId: number | null
  // Sets the userName field so the surrounding object or component receives this setting.
  userName: string | null
  // Sets the oldData field so the surrounding object or component receives this setting.
  oldData: unknown
  // Sets the newData field so the surrounding object or component receives this setting.
  newData: unknown
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ActivityPage {
  // Sets the activities field so the surrounding object or component receives this setting.
  activities: ProjectActivity[]
  // Sets the page field so the surrounding object or component receives this setting.
  page: number
  // Sets the limit field so the surrounding object or component receives this setting.
  limit: number
  // Sets the total field so the surrounding object or component receives this setting.
  total: number
  // Sets the totalPages field so the surrounding object or component receives this setting.
  totalPages: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectMilestone {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the description field so the surrounding object or component receives this setting.
  description: string | null
  // Sets the sequence field so the surrounding object or component receives this setting.
  sequence: number
  // Sets the plannedStartDate field so the surrounding object or component receives this setting.
  plannedStartDate: string | null
  // Sets the plannedEndDate field so the surrounding object or component receives this setting.
  plannedEndDate: string | null
  // Sets the actualStartDate field so the surrounding object or component receives this setting.
  actualStartDate: string | null
  // Sets the actualEndDate field so the surrounding object or component receives this setting.
  actualEndDate: string | null
  // Sets the status field so the surrounding object or component receives this setting.
  status: MilestoneStatus
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: string | number
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MilestoneInput {
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  description?: string | null
  // Sets the sequence field so the surrounding object or component receives this setting.
  sequence: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  plannedStartDate?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  plannedEndDate?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  actualStartDate?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  actualEndDate?: string | null
  // Sets the status field so the surrounding object or component receives this setting.
  status: MilestoneStatus
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines dateQuery so this module can perform its named task when needed.
function dateQuery(from?: string, to?: string) {
  // Stores the value in params so later lines can reuse this data or behavior for the current feature.
  const params = new URLSearchParams()
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (from) params.set('from', from)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (to) params.set('to', to)
  // Stores the value in query so later lines can reuse this data or behavior for the current feature.
  const query = params.toString()
  // Returns the result so the caller or React receives the value or interface this function provides.
  return query ? `?${query}` : ''
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchProjectActivity so this module can perform its named task when needed.
export async function fetchProjectActivity(projectId: string, page = 1, limit = 20, signal?: AbortSignal): Promise<ActivityPage> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<ProjectActivity[]>(
    // Continues the component or data expression so its related values and behavior stay grouped together.
    `/projects/${encodeURIComponent(projectId)}/activity?page=${page}&limit=${limit}`,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { signal },
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the activities field so the surrounding object or component receives this setting.
    activities: response.data,
    // Sets the page field so the surrounding object or component receives this setting.
    page: Number(response.meta?.page ?? page),
    // Sets the limit field so the surrounding object or component receives this setting.
    limit: Number(response.meta?.limit ?? limit),
    // Sets the total field so the surrounding object or component receives this setting.
    total: Number(response.meta?.total ?? response.data.length),
    // Sets the totalPages field so the surrounding object or component receives this setting.
    totalPages: Number(response.meta?.totalPages ?? 1),
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchLabourSummary so this module can perform its named task when needed.
export async function fetchLabourSummary(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<LabourSummary> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<LabourSummary>(`/projects/${encodeURIComponent(projectId)}/labour-summary${dateQuery(from, to)}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchWorkerCountHistory so this module can perform its named task when needed.
export async function fetchWorkerCountHistory(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<WorkerCountHistory[]> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<WorkerCountHistory[]>(`/projects/${encodeURIComponent(projectId)}/worker-count-history${dateQuery(from, to)}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchMachinerySummary so this module can perform its named task when needed.
export async function fetchMachinerySummary(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<MachinerySummary> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<MachinerySummary>(`/projects/${encodeURIComponent(projectId)}/machinery-summary${dateQuery(from, to)}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchMachineryUsageHistory so this module can perform its named task when needed.
export async function fetchMachineryUsageHistory(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<MachineryUsageHistory[]> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<MachineryUsageHistory[]>(`/projects/${encodeURIComponent(projectId)}/machinery-usage-history${dateQuery(from, to)}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchProjectMilestones so this module can perform its named task when needed.
export async function fetchProjectMilestones(projectId: string, signal?: AbortSignal): Promise<ProjectMilestone[]> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<ProjectMilestone[]>(`/projects/${encodeURIComponent(projectId)}/milestones`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createProjectMilestone so this module can perform its named task when needed.
export async function createProjectMilestone(projectId: string, input: MilestoneInput): Promise<ProjectMilestone> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiPost<ProjectMilestone>(`/projects/${encodeURIComponent(projectId)}/milestones`, input)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateProjectMilestone so this module can perform its named task when needed.
export async function updateProjectMilestone(id: number, input: Partial<MilestoneInput>): Promise<ProjectMilestone> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiRequest<ProjectMilestone>(`/milestones/${id}`, {
    // Sets the method field so the surrounding object or component receives this setting.
    method: 'PATCH',
    // Sets the body field so the surrounding object or component receives this setting.
    body: JSON.stringify(input),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines deleteProjectMilestone so this module can perform its named task when needed.
export async function deleteProjectMilestone(id: number): Promise<void> {
  // Waits for the asynchronous result before using it, so later work receives completed data.
  await apiRequest<null>(`/milestones/${id}`, { method: 'DELETE' })
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the daily logs feature.
