// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLogLabourEntry {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the trade field so the surrounding object or component receives this setting.
  trade: string
  // Sets the contractorName field so the surrounding object or component receives this setting.
  contractorName: string | null
  // Sets the headCount field so the surrounding object or component receives this setting.
  headCount: number
  // Sets the hoursWorked field so the surrounding object or component receives this setting.
  hoursWorked: string | number
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLogMachineryEntry {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the machineName field so the surrounding object or component receives this setting.
  machineName: string
  // Sets the operatorName field so the surrounding object or component receives this setting.
  operatorName: string | null
  // Sets the hoursUsed field so the surrounding object or component receives this setting.
  hoursUsed: string | number
  // Sets the fuelLitres field so the surrounding object or component receives this setting.
  fuelLitres: string | number | null
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLog {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: string | number
  // Sets the workSummary field so the surrounding object or component receives this setting.
  workSummary: string
  // Sets the weather field so the surrounding object or component receives this setting.
  weather: string | null
  // Sets the issues field so the surrounding object or component receives this setting.
  issues: string | null
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createdById?: number
  // Sets the labourEntries field so the surrounding object or component receives this setting.
  labourEntries: DailyLogLabourEntry[]
  // Sets the machineryEntries field so the surrounding object or component receives this setting.
  machineryEntries: DailyLogMachineryEntry[]
  // Continues the component or data expression so its related values and behavior stay grouped together.
  labourHeadCountTotal?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  machineryHoursTotal?: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface LabourEntryInput {
  // Sets the trade field so the surrounding object or component receives this setting.
  trade: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  contractorName?: string
  // Sets the headCount field so the surrounding object or component receives this setting.
  headCount: number
  // Sets the hoursWorked field so the surrounding object or component receives this setting.
  hoursWorked: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  remarks?: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MachineryEntryInput {
  // Sets the machineName field so the surrounding object or component receives this setting.
  machineName: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  operatorName?: string
  // Sets the hoursUsed field so the surrounding object or component receives this setting.
  hoursUsed: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fuelLitres?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  remarks?: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLogInput {
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: number
  // Sets the workSummary field so the surrounding object or component receives this setting.
  workSummary: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  weather?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  issues?: string
  // Sets the labourEntries field so the surrounding object or component receives this setting.
  labourEntries: LabourEntryInput[]
  // Sets the machineryEntries field so the surrounding object or component receives this setting.
  machineryEntries: MachineryEntryInput[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLogListQuery {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  from?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  to?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  page?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  limit?: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DailyLogListResult {
  // Sets the logs field so the surrounding object or component receives this setting.
  logs: DailyLog[]
  // Sets the totalPages field so the surrounding object or component receives this setting.
  totalPages: number
  // Sets the total field so the surrounding object or component receives this setting.
  total: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchDailyLogs so this module can perform its named task when needed.
export async function fetchDailyLogs(projectId: string, query: DailyLogListQuery = {}, signal?: AbortSignal): Promise<DailyLogListResult> {
  // Stores the value in params so later lines can reuse this data or behavior for the current feature.
  const params = new URLSearchParams()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  params.set('page', String(query.page ?? 1))
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  params.set('limit', String(query.limit ?? 100))
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (query.from) params.set('from', query.from)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (query.to) params.set('to', query.to)

  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<DailyLog[]>(`/projects/${encodeURIComponent(projectId)}/daily-logs?${params}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the logs field so the surrounding object or component receives this setting.
    logs: response.data,
    // Sets the totalPages field so the surrounding object or component receives this setting.
    totalPages: Number(response.meta?.totalPages ?? 1),
    // Sets the total field so the surrounding object or component receives this setting.
    total: Number(response.meta?.total ?? response.data.length),
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchAllDailyLogs so this module can perform its named task when needed.
export async function fetchAllDailyLogs(projectId: string, query: Omit<DailyLogListQuery, 'page'> = {}, signal?: AbortSignal): Promise<DailyLog[]> {
  // Stores the value in firstPage so later lines can reuse this data or behavior for the current feature.
  const firstPage = await fetchDailyLogs(projectId, { ...query, page: 1 }, signal)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (firstPage.totalPages <= 1) return firstPage.logs

  // Stores the value in rest so later lines can reuse this data or behavior for the current feature.
  const rest = await Promise.all(
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchDailyLogs(projectId, { ...query, page: index + 2 }, signal)
    // Closes this function call or grouped expression so the surrounding code can continue.
    ),
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
  // Returns the result so the caller or React receives the value or interface this function provides.
  return [firstPage.logs, ...rest.map((page) => page.logs)].flat()
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchDailyLog so this module can perform its named task when needed.
export async function fetchDailyLog(id: string, signal?: AbortSignal): Promise<DailyLog> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<DailyLog>(`/daily-logs/${encodeURIComponent(id)}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createDailyLog so this module can perform its named task when needed.
export async function createDailyLog(projectId: string, input: DailyLogInput): Promise<DailyLog> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiPost<DailyLog>(`/projects/${encodeURIComponent(projectId)}/daily-logs`, input)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return response.data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateDailyLog so this module can perform its named task when needed.
export async function updateDailyLog(id: string, input: DailyLogInput): Promise<DailyLog> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiRequest<DailyLog>(`/daily-logs/${encodeURIComponent(id)}`, {
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

// Defines deleteDailyLog so this module can perform its named task when needed.
export async function deleteDailyLog(id: string): Promise<void> {
  // Waits for the asynchronous result before using it, so later work receives completed data.
  await apiRequest<null>(`/daily-logs/${encodeURIComponent(id)}`, { method: 'DELETE' })
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the daily logs feature.
