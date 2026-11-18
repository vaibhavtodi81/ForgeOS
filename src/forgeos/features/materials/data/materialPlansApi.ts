import { apiGet, apiPost, apiRequest } from '../../../lib/api'
import type { MaterialCategory } from '../../stock/data/inventoryApi'

export type PlanStatus = 'DRAFT' | 'APPROVED' | 'ARCHIVED'

export interface MaterialPlanRow {
  id: string
  projectId: string
  materialId: string
  openingQuantity: number
  plannedQuantity: number
  plannedUnitRate: number | null
  lowStockThreshold: number | null
  wastageThresholdPct: number | null
  status: PlanStatus
  notes: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  material: { name: string; unit: string; category: MaterialCategory }
  project: { name: string; code: string }
}

export interface MaterialPlanInput {
  projectId: string
  materialId: string
  openingQuantity: number
  plannedQuantity: number
  plannedUnitRate?: number | null
  lowStockThreshold?: number | null
  wastageThresholdPct?: number | null
  notes?: string | null
}

export type MaterialPlanPatch = Partial<Omit<MaterialPlanInput, 'projectId' | 'materialId'>> & { status?: PlanStatus }

export async function fetchProjectMaterialPlans(projectId: string, signal?: AbortSignal): Promise<MaterialPlanRow[]> {
  return (await apiGet<MaterialPlanRow[]>(`/projects/${encodeURIComponent(projectId)}/material-plans`, { signal })).data
}

export async function createMaterialPlan(input: MaterialPlanInput): Promise<MaterialPlanRow> {
  return (await apiPost<MaterialPlanRow>('/material-plans', input)).data
}

export async function updateMaterialPlan(id: string, input: MaterialPlanPatch): Promise<MaterialPlanRow> {
  return (await apiRequest<MaterialPlanRow>(`/material-plans/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).data
}

export async function deleteMaterialPlan(id: string): Promise<void> {
  await apiRequest<null>(`/material-plans/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
