import { apiGet } from '../../../lib/api'

export type WastageStatus = 'OK' | 'OVERRUN' | 'NO_BASELINE'

export interface WastageOverviewRow {
  projectId: string
  projectName: string
  materialId: string
  materialName: string
  unit: string
  progressPercent: number
  plannedQuantity: number
  expectedQuantity: number
  consumedQuantity: number
  overrunQuantity: number
  overrunPercent: number | null
  thresholdPercent: number
  recordedWastageQuantity: number
  estimatedLoss: number
  status: WastageStatus
}

export interface WastageOverview {
  items: WastageOverviewRow[]
  portfolio: { totalPlanned: number; totalConsumed: number; avgOverrunPct: number | null }
}

export async function fetchWastageOverview(signal?: AbortSignal): Promise<WastageOverview> {
  return (await apiGet<WastageOverview>('/wastage/overview', { signal })).data
}
