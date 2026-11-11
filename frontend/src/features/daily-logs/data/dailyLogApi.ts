import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export interface DailyLogLabourEntry {
  id: number
  trade: string
  contractorName: string | null
  headCount: number
  hoursWorked: string | number
  remarks: string | null
}

export interface DailyLogMachineryEntry {
  id: number
  machineName: string
  operatorName: string | null
  hoursUsed: string | number
  fuelLitres: string | number | null
  remarks: string | null
}

export interface DailyLog {
  id: number
  projectId: number
  logDate: string
  progressPercent: string | number
  workSummary: string
  weather: string | null
  issues: string | null
  createdAt: string
  updatedAt: string
  createdById?: number
  labourEntries: DailyLogLabourEntry[]
  machineryEntries: DailyLogMachineryEntry[]
  labourHeadCountTotal?: number
  machineryHoursTotal?: number
}

export interface LabourEntryInput {
  trade: string
  contractorName?: string
  headCount: number
  hoursWorked: number
  remarks?: string
}

export interface MachineryEntryInput {
  machineName: string
  operatorName?: string
  hoursUsed: number
  fuelLitres?: number
  remarks?: string
}

export interface DailyLogInput {
  logDate: string
  progressPercent: number
  workSummary: string
  weather?: string
  issues?: string
  labourEntries: LabourEntryInput[]
  machineryEntries: MachineryEntryInput[]
}

export interface DailyLogListQuery {
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface DailyLogListResult {
  logs: DailyLog[]
  totalPages: number
  total: number
}

export async function fetchDailyLogs(projectId: string, query: DailyLogListQuery = {}, signal?: AbortSignal): Promise<DailyLogListResult> {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 100))
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)

  const response = await apiGet<DailyLog[]>(`/projects/${encodeURIComponent(projectId)}/daily-logs?${params}`, { signal })
  return {
    logs: response.data,
    totalPages: Number(response.meta?.totalPages ?? 1),
    total: Number(response.meta?.total ?? response.data.length),
  }
}

export async function fetchAllDailyLogs(projectId: string, query: Omit<DailyLogListQuery, 'page'> = {}, signal?: AbortSignal): Promise<DailyLog[]> {
  const firstPage = await fetchDailyLogs(projectId, { ...query, page: 1 }, signal)
  if (firstPage.totalPages <= 1) return firstPage.logs

  const rest = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      fetchDailyLogs(projectId, { ...query, page: index + 2 }, signal)
    ),
  )
  return [firstPage.logs, ...rest.map((page) => page.logs)].flat()
}

export async function fetchDailyLog(id: string, signal?: AbortSignal): Promise<DailyLog> {
  const response = await apiGet<DailyLog>(`/daily-logs/${encodeURIComponent(id)}`, { signal })
  return response.data
}

export async function createDailyLog(projectId: string, input: DailyLogInput): Promise<DailyLog> {
  const response = await apiPost<DailyLog>(`/projects/${encodeURIComponent(projectId)}/daily-logs`, input)
  return response.data
}

export async function updateDailyLog(id: string, input: DailyLogInput): Promise<DailyLog> {
  const response = await apiRequest<DailyLog>(`/daily-logs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function deleteDailyLog(id: string): Promise<void> {
  await apiRequest<null>(`/daily-logs/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
