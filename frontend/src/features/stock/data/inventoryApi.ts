import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export type MaterialCategory =
  | 'CEMENT'
  | 'STEEL'
  | 'SAND_AGGREGATE'
  | 'BRICKS_BLOCKS'
  | 'TIMBER'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'PAINT_FINISH'
  | 'OTHER'

export interface ApiMaterial {
  id: number
  name: string
  category: MaterialCategory
  unit: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MaterialInput {
  name: string
  category: MaterialCategory
  unit: string
  description?: string | null
}

export interface InventoryRow {
  materialId: number
  materialName: string
  category: MaterialCategory
  unit: string
  openingStock: number
  totalIn: number
  totalOut: number
  adjustmentIn: number
  adjustmentOut: number
  availableStock: number
  plannedQuantity: number
  lowStockThreshold: number | null
  isLowStock: boolean
}

export interface InventorySummaryRow {
  materialId: number
  materialName: string
  unit: string
  openingStock: number
  totalReceived: number
  totalConsumed: number
  adjustmentIn: number
  adjustmentOut: number
  availableStock: number
  transactionCount: number
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT'
export type OutReason = 'USED' | 'DAMAGED' | 'LOST'
export type AdjustmentDirection = 'INCREASE' | 'DECREASE'

export interface StockTransaction {
  id: number
  projectId: number
  materialId: number
  txnType: TransactionType
  quantity: number | string
  unitRate: number | string | null
  vendorId: number | null
  billId: number | null
  challanNumber: string | null
  outReason: OutReason | null
  adjustmentDirection: AdjustmentDirection | null
  txnDate: string
  dailyLogId: number | null
  remarks: string | null
  createdById: number
  createdAt: string
  isVoided: boolean
  voidedById: number | null
  voidedAt: string | null
  voidReason: string | null
  material: { name: string; unit: string }
  createdBy: { id: number; name: string }
}

export interface TransactionInput {
  materialId: number
  txnType: TransactionType
  quantity: number
  txnDate: string
  unitRate?: number
  vendorId?: number
  billId?: number
  challanNumber?: string
  outReason?: OutReason
  adjustmentDirection?: AdjustmentDirection
  dailyLogId?: number
  remarks?: string
}

export interface WastageItem {
  materialId: number
  materialName: string
  unit: string
  plannedQuantity: number
  expectedQuantity: number
  consumedQuantity: number
  overrunQuantity: number
  overrunPercent: number
  thresholdPercent: number
  recordedWastageQuantity: number
  estimatedLoss: number
  status: 'OK' | 'OVERRUN' | 'NO_BASELINE'
}

export interface WastageReport {
  progressPercent: number
  items: WastageItem[]
}

export async function fetchMaterials(signal?: AbortSignal): Promise<ApiMaterial[]> {
  return (await apiGet<ApiMaterial[]>('/materials', { signal })).data
}

export async function createMaterial(input: MaterialInput): Promise<ApiMaterial> {
  return (await apiPost<ApiMaterial>('/materials', input)).data
}

export async function updateMaterial(id: number, input: Partial<MaterialInput>): Promise<ApiMaterial> {
  return (await apiRequest<ApiMaterial>(`/materials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).data
}

export async function fetchProjectInventory(projectId: string, signal?: AbortSignal): Promise<InventoryRow[]> {
  return (await apiGet<InventoryRow[]>(`/projects/${encodeURIComponent(projectId)}/inventory`, { signal })).data
}

export async function fetchInventorySummary(projectId: string, signal?: AbortSignal): Promise<InventorySummaryRow[]> {
  return (await apiGet<InventorySummaryRow[]>(`/projects/${encodeURIComponent(projectId)}/inventory/summary`, { signal })).data
}

export async function fetchTransactions(
  projectId: string,
  filters: { materialId?: number; txnType?: TransactionType; from?: string; to?: string; includeVoided?: boolean } = {},
  signal?: AbortSignal,
): Promise<StockTransaction[]> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const suffix = query.size ? `?${query.toString()}` : ''
  return (await apiGet<StockTransaction[]>(`/projects/${encodeURIComponent(projectId)}/inventory/transactions${suffix}`, { signal })).data
}

export async function createStockTransaction(projectId: string, input: TransactionInput): Promise<StockTransaction> {
  return (await apiPost<StockTransaction>(`/projects/${encodeURIComponent(projectId)}/inventory/transactions`, input)).data
}

export async function fetchWastage(projectId: string, signal?: AbortSignal): Promise<WastageReport> {
  return (await apiGet<WastageReport>(`/projects/${encodeURIComponent(projectId)}/inventory/wastage`, { signal })).data
}
