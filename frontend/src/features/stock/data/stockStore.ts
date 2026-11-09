import type {
  MaterialBalanceRow,
  StockOutReason,
  StockTransaction,
  WastageRow,
  WastageStatus,
} from '../types/stock'
import {
  getProjectProgress,
  getStoredMaterials,
  getStoredPlans,
} from '../../materials/data/materialStore'

const STORAGE_KEY = 'forgeos_stock_transactions'
const DEFAULT_WASTAGE_THRESHOLD = 10

export const initialTransactions: StockTransaction[] = [
  // Green Valley Residency — Stock IN
  { id: 'STK-001', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 3200, date: '2026-09-12', vendorName: 'UltraTech Cement Ltd', challanNumber: 'CH-8821', rate: 395, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-12T10:00:00Z', voided: false },
  { id: 'STK-002', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 2800, date: '2026-10-18', vendorName: 'UltraTech Cement Ltd', challanNumber: 'CH-9034', rate: 392, billReference: 'BILL-001', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-18T09:30:00Z', voided: false },
  { id: 'STK-003', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-003', materialName: 'TMT Rebar Fe 550D 12mm', materialUnit: 'Tonne', quantity: 42, date: '2026-09-20', vendorName: 'Kamdhenu Steel Traders', challanNumber: 'CH-4910', rate: 58500, billReference: 'BILL-002', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-20T11:00:00Z', voided: false },
  { id: 'STK-004', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-004', materialName: 'TMT Rebar Fe 500D 8mm', materialUnit: 'Tonne', quantity: 21, date: '2026-10-02', vendorName: 'Kamdhenu Steel Traders', challanNumber: 'CH-5011', rate: 56000, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-02T10:00:00Z', voided: false },
  { id: 'STK-005', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-005', materialName: 'M25 Ready Mix Concrete', materialUnit: 'Cum', quantity: 385, date: '2026-10-15', vendorName: 'Shree Ram RMC Plant', challanNumber: 'RMC-CH-092', rate: 4650, billReference: 'BILL-003', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-15T14:00:00Z', voided: false },
  { id: 'STK-006', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-006', materialName: 'River Sand', materialUnit: 'Cum', quantity: 610, date: '2026-09-15', vendorName: 'Yamuna Sand Suppliers', rate: 1450, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-15T08:30:00Z', voided: false },
  { id: 'STK-007', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-007', materialName: 'Aggregate 20mm', materialUnit: 'Cum', quantity: 480, date: '2026-09-16', vendorName: 'Aravalli Aggregates', rate: 1150, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-16T08:45:00Z', voided: false },
  { id: 'STK-008', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-008', materialName: 'Red Clay Bricks', materialUnit: 'Nos', quantity: 72000, date: '2026-10-05', vendorName: 'Jaipur Bricks & Aggregates', challanNumber: 'JBA-CH-09', rate: 9, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-05T12:00:00Z', voided: false },
  { id: 'STK-009', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-010', materialName: 'Binding Wire', materialUnit: 'Kg', quantity: 640, date: '2026-10-08', rate: 85, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-08T09:00:00Z', voided: false },
  { id: 'STK-010', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-011', materialName: 'Shuttering Ply 12mm', materialUnit: 'Nos', quantity: 520, date: '2026-09-28', rate: 1150, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-28T10:30:00Z', voided: false },
  // Green Valley Residency — Stock OUT
  { id: 'STK-011', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 2450, date: '2026-09-30', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-09-30T18:00:00Z', voided: false },
  { id: 'STK-012', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 2180, date: '2026-10-25', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-25T18:00:00Z', voided: false },
  { id: 'STK-013', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 96, date: '2026-10-26', reason: 'DAMAGED', notes: 'Bags soaked in unexpected rain at ground floor storage', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-26T09:00:00Z', voided: false },
  { id: 'STK-014', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-003', materialName: 'TMT Rebar Fe 550D 12mm', materialUnit: 'Tonne', quantity: 36.5, date: '2026-10-10', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-10T18:00:00Z', voided: false },
  { id: 'STK-015', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-004', materialName: 'TMT Rebar Fe 500D 8mm', materialUnit: 'Tonne', quantity: 17.2, date: '2026-10-12', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-12T18:00:00Z', voided: false },
  { id: 'STK-016', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-005', materialName: 'M25 Ready Mix Concrete', materialUnit: 'Cum', quantity: 361, date: '2026-10-15', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-15T19:00:00Z', voided: false },
  { id: 'STK-017', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-006', materialName: 'River Sand', materialUnit: 'Cum', quantity: 488, date: '2026-10-20', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-20T18:00:00Z', voided: false },
  { id: 'STK-018', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-007', materialName: 'Aggregate 20mm', materialUnit: 'Cum', quantity: 402, date: '2026-10-22', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-22T18:00:00Z', voided: false },
  { id: 'STK-019', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-008', materialName: 'Red Clay Bricks', materialUnit: 'Nos', quantity: 55400, date: '2026-10-18', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-18T18:00:00Z', voided: false },
  { id: 'STK-020', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-010', materialName: 'Binding Wire', materialUnit: 'Kg', quantity: 512, date: '2026-10-28', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-28T18:00:00Z', voided: false },
  { id: 'STK-021', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-011', materialName: 'Shuttering Ply 12mm', materialUnit: 'Nos', quantity: 318, date: '2026-10-30', reason: 'USED', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-30T18:00:00Z', voided: false },
  { id: 'STK-022', type: 'OUT', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-011', materialName: 'Shuttering Ply 12mm', materialUnit: 'Nos', quantity: 14, date: '2026-10-30', reason: 'DAMAGED', notes: 'Edges delaminated during deshuttering', recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-30T18:15:00Z', voided: false },
  // Voided duplicate entry example
  { id: 'STK-030', type: 'IN', projectId: '1', projectCode: 'PRJ-001', projectName: 'Green Valley Residency', materialId: 'MAT-008', materialName: 'Red Clay Bricks', materialUnit: 'Nos', quantity: 5000, date: '2026-10-11', vendorName: 'Jaipur Bricks & Aggregates', challanNumber: 'JBA-CH-11', rate: 9, recordedBy: 'Aarav Sharma (PM)', createdAt: '2026-10-11T11:00:00Z', voided: true, voidReason: 'Duplicate challan entry — same delivery recorded under JBA-CH-09' },
  // Skyline Commercial Hub — Stock IN
  { id: 'STK-101', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 5200, date: '2026-10-04', vendorName: 'UltraTech Cement Ltd', challanNumber: 'CH-9180', rate: 396, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-04T10:00:00Z', voided: false },
  { id: 'STK-102', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 3600, date: '2026-11-02', vendorName: 'UltraTech Cement Ltd', challanNumber: 'CH-9422', rate: 398, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-11-02T10:00:00Z', voided: false },
  { id: 'STK-103', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-003', materialName: 'TMT Rebar Fe 550D 12mm', materialUnit: 'Tonne', quantity: 58, date: '2026-10-09', vendorName: 'Jindal Steel & Power', challanNumber: 'CH-2210', rate: 58800, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-09T11:00:00Z', voided: false },
  { id: 'STK-104', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-005', materialName: 'M25 Ready Mix Concrete', materialUnit: 'Cum', quantity: 420, date: '2026-10-19', vendorName: 'Shree Ram RMC Plant', rate: 4680, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-19T15:00:00Z', voided: false },
  { id: 'STK-105', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-007', materialName: 'Aggregate 20mm', materialUnit: 'Cum', quantity: 540, date: '2026-10-06', vendorName: 'Aravalli Aggregates', rate: 1180, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-06T09:00:00Z', voided: false },
  { id: 'STK-106', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-006', materialName: 'River Sand', materialUnit: 'Cum', quantity: 660, date: '2026-10-07', vendorName: 'Yamuna Sand Suppliers', rate: 1480, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-07T09:00:00Z', voided: false },
  { id: 'STK-107', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-009', materialName: 'AAC Block 200mm', materialUnit: 'Nos', quantity: 18500, date: '2026-10-24', vendorName: 'UltraTech Blocks', rate: 68, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-24T12:00:00Z', voided: false },
  { id: 'STK-117', type: 'IN', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-010', materialName: 'Binding Wire', materialUnit: 'Kg', quantity: 90, date: '2026-10-20', rate: 85, recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-20T10:00:00Z', voided: false },
  // Skyline Commercial Hub — Stock OUT
  { id: 'STK-108', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 4350, date: '2026-10-28', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-28T18:00:00Z', voided: false },
  { id: 'STK-109', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 1980, date: '2026-11-06', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-11-06T18:00:00Z', voided: false },
  { id: 'STK-110', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-001', materialName: 'OPC 53 Grade Cement', materialUnit: 'Bag', quantity: 140, date: '2026-11-07', reason: 'DAMAGED', notes: 'Hardened lumps found in 140 bags from last consignment', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-11-07T09:00:00Z', voided: false },
  { id: 'STK-111', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-003', materialName: 'TMT Rebar Fe 550D 12mm', materialUnit: 'Tonne', quantity: 44.5, date: '2026-10-30', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-30T18:00:00Z', voided: false },
  { id: 'STK-112', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-005', materialName: 'M25 Ready Mix Concrete', materialUnit: 'Cum', quantity: 402, date: '2026-10-19', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-19T19:00:00Z', voided: false },
  { id: 'STK-113', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-007', materialName: 'Aggregate 20mm', materialUnit: 'Cum', quantity: 470, date: '2026-10-27', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-27T18:00:00Z', voided: false },
  { id: 'STK-114', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-007', materialName: 'Aggregate 20mm', materialUnit: 'Cum', quantity: 46, date: '2026-10-28', reason: 'LOST', notes: 'Stock count shortfall at basement storage bay', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-28T18:10:00Z', voided: false },
  { id: 'STK-115', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-006', materialName: 'River Sand', materialUnit: 'Cum', quantity: 528, date: '2026-10-29', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-29T18:00:00Z', voided: false },
  { id: 'STK-116', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-009', materialName: 'AAC Block 200mm', materialUnit: 'Nos', quantity: 9200, date: '2026-11-03', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-11-03T18:00:00Z', voided: false },
  { id: 'STK-118', type: 'OUT', projectId: '2', projectCode: 'PRJ-002', projectName: 'Skyline Commercial Hub', materialId: 'MAT-010', materialName: 'Binding Wire', materialUnit: 'Kg', quantity: 74, date: '2026-10-31', reason: 'USED', recordedBy: 'Priya Mehta (PM)', createdAt: '2026-10-31T18:00:00Z', voided: false },
]

export function getStoredStockTransactions(): StockTransaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTransactions))
      return initialTransactions
    }
    return JSON.parse(data) as StockTransaction[]
  } catch {
    return initialTransactions
  }
}

export function saveStoredStockTransactions(transactions: StockTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (error) {
    console.error('Failed to save stock transactions in localStorage', error)
  }
}

function activeTransactions(transactions: StockTransaction[]): StockTransaction[] {
  return transactions.filter((tx) => !tx.voided)
}

export function getAvailableBalance(
  transactions: StockTransaction[],
  projectId: string,
  materialId: string
): number {
  return activeTransactions(transactions)
    .filter((tx) => tx.projectId === projectId && tx.materialId === materialId)
    .reduce((balance, tx) => balance + (tx.type === 'IN' ? tx.quantity : -tx.quantity), 0)
}

export function addStockIn(
  data: Omit<StockTransaction, 'id' | 'type' | 'voided' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }
): StockTransaction {
  const transactions = getStoredStockTransactions()
  const transaction: StockTransaction = {
    ...data,
    id: `STK-${Date.now().toString().slice(-6)}`,
    type: 'IN',
    voided: false,
    recordedBy: data.recordedBy || 'System',
    createdAt: new Date().toISOString(),
  }
  saveStoredStockTransactions([transaction, ...transactions])
  return transaction
}

export function addStockOut(
  data: Omit<StockTransaction, 'id' | 'type' | 'voided' | 'createdAt' | 'recordedBy'> & {
    reason: StockOutReason
    recordedBy?: string
  }
): { ok: true; transaction: StockTransaction } | { ok: false; error: string } {
  const transactions = getStoredStockTransactions()
  const balance = getAvailableBalance(transactions, data.projectId, data.materialId)

  if (data.quantity > balance) {
    return {
      ok: false,
      error: `Rejected: requested ${data.quantity} ${data.materialUnit} exceeds available balance of ${balance} ${data.materialUnit}.`,
    }
  }

  const transaction: StockTransaction = {
    ...data,
    id: `STK-${Date.now().toString().slice(-6)}`,
    type: 'OUT',
    voided: false,
    recordedBy: data.recordedBy || 'System',
    createdAt: new Date().toISOString(),
  }
  saveStoredStockTransactions([transaction, ...transactions])
  return { ok: true, transaction }
}

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000

export function voidStockTransaction(
  id: string,
  reason: string,
  allowOldEntries: boolean
): { ok: true } | { ok: false; error: string } {
  const transactions = getStoredStockTransactions()
  const index = transactions.findIndex((tx) => tx.id === id)
  if (index === -1) return { ok: false, error: 'Transaction not found.' }

  const transaction = transactions[index]
  if (transaction.voided) return { ok: false, error: 'Transaction is already void.' }

  if (!allowOldEntries) {
    const age = Date.now() - new Date(transaction.createdAt).getTime()
    if (age > EDIT_WINDOW_MS) {
      return { ok: false, error: 'PM entries can only be voided within 48 hours of creation. Ask an Admin to void this entry.' }
    }
  }

  if (transaction.type === 'IN') {
    const balanceAfter = getAvailableBalance(transactions, transaction.projectId, transaction.materialId) - transaction.quantity
    if (balanceAfter < 0) {
      return { ok: false, error: 'Cannot void: stock has already been consumed. The balance would go negative.' }
    }
  }

  transactions[index] = { ...transaction, voided: true, voidReason: reason }
  saveStoredStockTransactions(transactions)
  return { ok: true }
}

export function computeBalances(projectId?: string): MaterialBalanceRow[] {
  const transactions = activeTransactions(getStoredStockTransactions()).filter(
    (tx) => !projectId || tx.projectId === projectId
  )
  const materials = getStoredMaterials()
  const plans = getStoredPlans().filter((p) => !projectId || p.projectId === projectId)

  const byMaterial = new Map<string, MaterialBalanceRow>()
  for (const tx of transactions) {
    const row =
      byMaterial.get(tx.materialId) ??
      ({
        materialId: tx.materialId,
        materialName: tx.materialName,
        materialUnit: tx.materialUnit,
        totalIn: 0,
        totalOut: 0,
        balance: 0,
        isLow: false,
      } as MaterialBalanceRow)
    if (tx.type === 'IN') row.totalIn += tx.quantity
    else row.totalOut += tx.quantity
    row.balance = row.totalIn - row.totalOut
    byMaterial.set(tx.materialId, row)
  }

  for (const plan of plans) {
    const material = materials.find((m) => m.id === plan.materialId)
    const row =
      byMaterial.get(plan.materialId) ??
      ({
        materialId: plan.materialId,
        materialName: material?.name ?? plan.materialId,
        materialUnit: material?.unit ?? '',
        totalIn: 0,
        totalOut: 0,
        balance: 0,
        isLow: false,
      } as MaterialBalanceRow)
    row.plannedQty = plan.plannedQty
    row.lowStockThreshold = plan.lowStockThreshold
    byMaterial.set(plan.materialId, row)
  }

  const rows = [...byMaterial.values()]
  for (const row of rows) {
    row.isLow =
      row.lowStockThreshold !== undefined &&
      row.lowStockThreshold > 0 &&
      row.balance <= row.lowStockThreshold
  }
  return rows.sort((a, b) => a.materialName.localeCompare(b.materialName))
}

export function computeWastage(projectId?: string): WastageRow[] {
  const transactions = activeTransactions(getStoredStockTransactions()).filter(
    (tx) => !projectId || tx.projectId === projectId
  )
  const materials = getStoredMaterials()
  const plans = getStoredPlans().filter((p) => !projectId || p.projectId === projectId)

  const projectsSeen = new Map<string, { code: string; name: string }>()
  for (const tx of transactions) {
    if (!projectsSeen.has(tx.projectId)) {
      projectsSeen.set(tx.projectId, { code: tx.projectCode, name: tx.projectName })
    }
  }

  interface Accumulator {
    consumed: number
    recordedWastage: number
  }
  const consumedByProjectMaterial = new Map<string, Accumulator>()
  for (const tx of transactions) {
    if (tx.type !== 'OUT') continue
    const key = `${tx.projectId}::${tx.materialId}`
    const acc =
      consumedByProjectMaterial.get(key) ?? { consumed: 0, recordedWastage: 0 }
    acc.consumed += tx.quantity
    if (tx.reason === 'DAMAGED' || tx.reason === 'LOST') acc.recordedWastage += tx.quantity
    consumedByProjectMaterial.set(key, acc)
  }

  const rows: WastageRow[] = []

  const buildRow = (
    projectIdValue: string,
    materialId: string,
    plan: (typeof plans)[number] | undefined,
    acc: Accumulator | undefined
  ) => {
    const material = materials.find((m) => m.id === materialId)
    const meta = projectsSeen.get(projectIdValue)
    const progressPercent = getProjectProgress(projectIdValue)
    const plannedQty = plan?.plannedQty ?? 0
    const plannedRate = plan?.plannedRate ?? material?.referenceRate
    const expectedToDate = (plannedQty * progressPercent) / 100
    const consumed = acc?.consumed ?? 0
    const overrunQty = Math.max(0, consumed - expectedToDate)
    const overrunPercent = expectedToDate > 0 ? (overrunQty / expectedToDate) * 100 : consumed > 0 ? 100 : 0
    const wastageThreshold = plan?.wastageThreshold ?? DEFAULT_WASTAGE_THRESHOLD

    let status: WastageStatus = 'OK'
    if (!plan) status = 'NO_BASELINE'
    else if (overrunPercent >= wastageThreshold) status = 'OVERRUN'

    rows.push({
      projectId: projectIdValue,
      projectCode: meta?.code ?? '',
      projectName: meta?.name ?? '',
      materialId,
      materialName: material?.name ?? materialId,
      materialUnit: material?.unit ?? '',
      progressPercent,
      plannedQty,
      expectedToDate,
      consumed,
      overrunQty,
      overrunPercent,
      recordedWastageQty: acc?.recordedWastage ?? 0,
      estimatedLoss: overrunQty > 0 && plannedRate ? overrunQty * plannedRate : 0,
      wastageThreshold,
      status,
    })
  }

  const seenPairs = new Set<string>()
  for (const plan of plans) {
    const key = `${plan.projectId}::${plan.materialId}`
    seenPairs.add(key)
    buildRow(plan.projectId, plan.materialId, plan, consumedByProjectMaterial.get(key))
  }
  for (const [key, acc] of consumedByProjectMaterial) {
    if (seenPairs.has(key)) continue
    const [pid, mid] = key.split('::')
    buildRow(pid, mid, undefined, acc)
  }

  return rows.sort((a, b) => b.estimatedLoss - a.estimatedLoss || b.overrunPercent - a.overrunPercent)
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
}

export function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
