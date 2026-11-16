// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type MaterialCategory =
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'CEMENT'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'STEEL'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'SAND_AGGREGATE'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'BRICKS_BLOCKS'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'TIMBER'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'ELECTRICAL'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'PLUMBING'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'PAINT_FINISH'
  // Continues the component or data expression so its related values and behavior stay grouped together.
  | 'OTHER'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ApiMaterial {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the category field so the surrounding object or component receives this setting.
  category: MaterialCategory
  // Sets the unit field so the surrounding object or component receives this setting.
  unit: string
  // Sets the description field so the surrounding object or component receives this setting.
  description: string | null
  // Sets the isActive field so the surrounding object or component receives this setting.
  isActive: boolean
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface MaterialInput {
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the category field so the surrounding object or component receives this setting.
  category: MaterialCategory
  // Sets the unit field so the surrounding object or component receives this setting.
  unit: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  description?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface InventoryRow {
  // Sets the materialId field so the surrounding object or component receives this setting.
  materialId: number
  // Sets the materialName field so the surrounding object or component receives this setting.
  materialName: string
  // Sets the category field so the surrounding object or component receives this setting.
  category: MaterialCategory
  // Sets the unit field so the surrounding object or component receives this setting.
  unit: string
  // Sets the openingStock field so the surrounding object or component receives this setting.
  openingStock: number
  // Sets the totalIn field so the surrounding object or component receives this setting.
  totalIn: number
  // Sets the totalOut field so the surrounding object or component receives this setting.
  totalOut: number
  // Sets the adjustmentIn field so the surrounding object or component receives this setting.
  adjustmentIn: number
  // Sets the adjustmentOut field so the surrounding object or component receives this setting.
  adjustmentOut: number
  // Sets the availableStock field so the surrounding object or component receives this setting.
  availableStock: number
  // Sets the plannedQuantity field so the surrounding object or component receives this setting.
  plannedQuantity: number
  // Sets the lowStockThreshold field so the surrounding object or component receives this setting.
  lowStockThreshold: number | null
  // Sets the isLowStock field so the surrounding object or component receives this setting.
  isLowStock: boolean
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface InventorySummaryRow {
  // Sets the materialId field so the surrounding object or component receives this setting.
  materialId: number
  // Sets the materialName field so the surrounding object or component receives this setting.
  materialName: string
  // Sets the unit field so the surrounding object or component receives this setting.
  unit: string
  // Sets the openingStock field so the surrounding object or component receives this setting.
  openingStock: number
  // Sets the totalReceived field so the surrounding object or component receives this setting.
  totalReceived: number
  // Sets the totalConsumed field so the surrounding object or component receives this setting.
  totalConsumed: number
  // Sets the adjustmentIn field so the surrounding object or component receives this setting.
  adjustmentIn: number
  // Sets the adjustmentOut field so the surrounding object or component receives this setting.
  adjustmentOut: number
  // Sets the availableStock field so the surrounding object or component receives this setting.
  availableStock: number
  // Sets the transactionCount field so the surrounding object or component receives this setting.
  transactionCount: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT'
// Continues the component or data expression so its related values and behavior stay grouped together.
export type OutReason = 'USED' | 'DAMAGED' | 'LOST'
// Continues the component or data expression so its related values and behavior stay grouped together.
export type AdjustmentDirection = 'INCREASE' | 'DECREASE'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface StockTransaction {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the materialId field so the surrounding object or component receives this setting.
  materialId: number
  // Sets the txnType field so the surrounding object or component receives this setting.
  txnType: TransactionType
  // Sets the quantity field so the surrounding object or component receives this setting.
  quantity: number | string
  // Sets the unitRate field so the surrounding object or component receives this setting.
  unitRate: number | string | null
  // Sets the vendorId field so the surrounding object or component receives this setting.
  vendorId: number | null
  // Sets the billId field so the surrounding object or component receives this setting.
  billId: number | null
  // Sets the challanNumber field so the surrounding object or component receives this setting.
  challanNumber: string | null
  // Sets the outReason field so the surrounding object or component receives this setting.
  outReason: OutReason | null
  // Sets the adjustmentDirection field so the surrounding object or component receives this setting.
  adjustmentDirection: AdjustmentDirection | null
  // Sets the txnDate field so the surrounding object or component receives this setting.
  txnDate: string
  // Sets the dailyLogId field so the surrounding object or component receives this setting.
  dailyLogId: number | null
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string | null
  // Sets the createdById field so the surrounding object or component receives this setting.
  createdById: number
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the isVoided field so the surrounding object or component receives this setting.
  isVoided: boolean
  // Sets the voidedById field so the surrounding object or component receives this setting.
  voidedById: number | null
  // Sets the voidedAt field so the surrounding object or component receives this setting.
  voidedAt: string | null
  // Sets the voidReason field so the surrounding object or component receives this setting.
  voidReason: string | null
  // Sets the material field so the surrounding object or component receives this setting.
  material: { name: string; unit: string }
  // Sets the createdBy field so the surrounding object or component receives this setting.
  createdBy: { id: number; name: string }
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface TransactionInput {
  // Sets the materialId field so the surrounding object or component receives this setting.
  materialId: number
  // Sets the txnType field so the surrounding object or component receives this setting.
  txnType: TransactionType
  // Sets the quantity field so the surrounding object or component receives this setting.
  quantity: number
  // Sets the txnDate field so the surrounding object or component receives this setting.
  txnDate: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  unitRate?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  vendorId?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  billId?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  challanNumber?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  outReason?: OutReason
  // Continues the component or data expression so its related values and behavior stay grouped together.
  adjustmentDirection?: AdjustmentDirection
  // Continues the component or data expression so its related values and behavior stay grouped together.
  dailyLogId?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  remarks?: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface WastageItem {
  // Sets the materialId field so the surrounding object or component receives this setting.
  materialId: number
  // Sets the materialName field so the surrounding object or component receives this setting.
  materialName: string
  // Sets the unit field so the surrounding object or component receives this setting.
  unit: string
  // Sets the plannedQuantity field so the surrounding object or component receives this setting.
  plannedQuantity: number
  // Sets the expectedQuantity field so the surrounding object or component receives this setting.
  expectedQuantity: number
  // Sets the consumedQuantity field so the surrounding object or component receives this setting.
  consumedQuantity: number
  // Sets the overrunQuantity field so the surrounding object or component receives this setting.
  overrunQuantity: number
  // Sets the overrunPercent field so the surrounding object or component receives this setting.
  overrunPercent: number
  // Sets the thresholdPercent field so the surrounding object or component receives this setting.
  thresholdPercent: number
  // Sets the recordedWastageQuantity field so the surrounding object or component receives this setting.
  recordedWastageQuantity: number
  // Sets the estimatedLoss field so the surrounding object or component receives this setting.
  estimatedLoss: number
  // Sets the status field so the surrounding object or component receives this setting.
  status: 'OK' | 'OVERRUN' | 'NO_BASELINE'
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface WastageReport {
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: number
  // Sets the items field so the surrounding object or component receives this setting.
  items: WastageItem[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchMaterials so this module can perform its named task when needed.
export async function fetchMaterials(signal?: AbortSignal): Promise<ApiMaterial[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<ApiMaterial[]>('/materials', { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createMaterial so this module can perform its named task when needed.
export async function createMaterial(input: MaterialInput): Promise<ApiMaterial> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<ApiMaterial>('/materials', input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateMaterial so this module can perform its named task when needed.
export async function updateMaterial(id: number, input: Partial<MaterialInput>): Promise<ApiMaterial> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<ApiMaterial>(`/materials/${id}`, {
    // Sets the method field so the surrounding object or component receives this setting.
    method: 'PATCH',
    // Sets the body field so the surrounding object or component receives this setting.
    body: JSON.stringify(input),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchProjectInventory so this module can perform its named task when needed.
export async function fetchProjectInventory(projectId: string, signal?: AbortSignal): Promise<InventoryRow[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<InventoryRow[]>(`/projects/${encodeURIComponent(projectId)}/inventory`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchInventorySummary so this module can perform its named task when needed.
export async function fetchInventorySummary(projectId: string, signal?: AbortSignal): Promise<InventorySummaryRow[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<InventorySummaryRow[]>(`/projects/${encodeURIComponent(projectId)}/inventory/summary`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchTransactions so this module can perform its named task when needed.
export async function fetchTransactions(
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string,
  // Sets the filters field so the surrounding object or component receives this setting.
  filters: { materialId?: number; txnType?: TransactionType; from?: string; to?: string; includeVoided?: boolean } = {},
  // Continues the component or data expression so its related values and behavior stay grouped together.
  signal?: AbortSignal,
// Continues the component or data expression so its related values and behavior stay grouped together.
): Promise<StockTransaction[]> {
  // Stores the value in query so later lines can reuse this data or behavior for the current feature.
  const query = new URLSearchParams()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  for (const [key, value] of Object.entries(filters)) {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (value !== undefined) query.set(key, String(value))
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in suffix so later lines can reuse this data or behavior for the current feature.
  const suffix = query.size ? `?${query.toString()}` : ''
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<StockTransaction[]>(`/projects/${encodeURIComponent(projectId)}/inventory/transactions${suffix}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createStockTransaction so this module can perform its named task when needed.
export async function createStockTransaction(projectId: string, input: TransactionInput): Promise<StockTransaction> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<StockTransaction>(`/projects/${encodeURIComponent(projectId)}/inventory/transactions`, input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchWastage so this module can perform its named task when needed.
export async function fetchWastage(projectId: string, signal?: AbortSignal): Promise<WastageReport> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<WastageReport>(`/projects/${encodeURIComponent(projectId)}/inventory/wastage`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the stock feature.
