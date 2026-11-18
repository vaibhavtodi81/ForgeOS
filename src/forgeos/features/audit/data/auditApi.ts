import { apiGet } from '../../../lib/api'

export interface AuditLogRow {
  id: string
  action: string
  actorId: string | null
  actorName: string | null
  entityType: string | null
  entityId: string | null
  projectId: string | null
  meta: string | null
  ip: string | null
  createdAt: string
}

export interface AuditLogListResult {
  items: AuditLogRow[]
  total: number
  page: number
  limit: number
}

export interface AuditLogStats {
  total: number
  byAction: { action: string; count: number }[]
  byActor: { actorName: string; count: number }[]
  last7Days: { date: string; label: string; count: number }[]
}

export interface AuditLogListQuery {
  action?: string
  entityType?: string
  search?: string
  page?: number
  limit?: number
}

export async function fetchAuditLogs(query: AuditLogListQuery = {}, signal?: AbortSignal): Promise<AuditLogListResult> {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 25))
  if (query.action) params.set('action', query.action)
  if (query.entityType) params.set('entityType', query.entityType)
  if (query.search && query.search.trim()) params.set('search', query.search.trim())
  const response = await apiGet<AuditLogListResult>(`/audit-logs?${params.toString()}`, { signal })
  return response.data
}

export async function fetchAuditStats(signal?: AbortSignal): Promise<AuditLogStats> {
  const response = await apiGet<AuditLogStats>('/audit-logs/stats', { signal })
  return response.data
}
