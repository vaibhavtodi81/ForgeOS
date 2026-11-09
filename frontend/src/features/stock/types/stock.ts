export type StockMovementType = 'IN' | 'OUT'

export type StockOutReason = 'USED' | 'DAMAGED' | 'LOST'

export interface StockTransaction {
  id: string
  type: StockMovementType
  projectId: string
  projectCode: string
  projectName: string
  materialId: string
  materialName: string
  materialUnit: string
  quantity: number
  date: string
  vendorName?: string
  challanNumber?: string
  rate?: number
  billReference?: string
  reason?: StockOutReason
  notes?: string
  voided: boolean
  voidReason?: string
  recordedBy: string
  createdAt: string
}

export interface MaterialBalanceRow {
  materialId: string
  materialName: string
  materialUnit: string
  totalIn: number
  totalOut: number
  balance: number
  plannedQty?: number
  lowStockThreshold?: number
  isLow: boolean
}

export type WastageStatus = 'OK' | 'OVERRUN' | 'NO_BASELINE'

export interface WastageRow {
  projectId: string
  projectCode: string
  projectName: string
  materialId: string
  materialName: string
  materialUnit: string
  progressPercent: number
  plannedQty: number
  expectedToDate: number
  consumed: number
  overrunQty: number
  overrunPercent: number
  recordedWastageQty: number
  estimatedLoss: number
  wastageThreshold: number
  status: WastageStatus
}
