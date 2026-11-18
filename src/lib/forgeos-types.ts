// ForgeOS — shared types and API contract used by BOTH backend routes and frontend views.
// This file is the single source of truth for request/response shapes.

// ---------------------------------------------------------------------------
// Enums (stored as plain strings in SQLite)
// ---------------------------------------------------------------------------

export type Role = 'ADMIN' | 'PM' | 'VIEWER'
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
export type PlanStatus = 'DRAFT' | 'APPROVED' | 'ARCHIVED'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOID'
export type TxnType = 'IN' | 'OUT' | 'ADJUSTMENT'
export type OutReason = 'USED' | 'DAMAGED' | 'LOST'
export type AdjustmentDirection = 'INCREASE' | 'DECREASE'
export type PaymentMethod = 'CASH' | 'BANK' | 'UPI' | 'CHEQUE'
export type AreaUnit = 'SQFT' | 'SQYD' | 'SQM' | 'ACRE'
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
export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'

export type AuditAction =
  | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE'
  | 'OTP_REQUEST' | 'OTP_LOGIN' | 'OAUTH_LOGIN'
  | 'USER_CREATE' | 'USER_UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE'
  | 'PROJECT_CREATE' | 'PROJECT_UPDATE' | 'PROJECT_DELETE' | 'STATUS_CHANGE' | 'ASSIGN'
  | 'LAND_CREATE' | 'LAND_UPDATE' | 'LAND_DELETE'
  | 'MATERIAL_CREATE' | 'MATERIAL_UPDATE'
  | 'PLAN_CREATE' | 'PLAN_UPDATE' | 'PLAN_DELETE' | 'PLAN_STATUS'
  | 'TXN_CREATE' | 'TXN_VOID'
  | 'LOG_CREATE' | 'LOG_UPDATE' | 'LOG_DELETE'
  | 'MILESTONE_CREATE' | 'MILESTONE_UPDATE' | 'MILESTONE_DELETE'
  | 'SUPPLIER_CREATE' | 'SUPPLIER_UPDATE'
  | 'INVOICE_CREATE' | 'INVOICE_STATUS_CHANGE'
  | 'PAYMENT_CREATE'

export const ROLES: Role[] = ['ADMIN', 'PM', 'VIEWER']
export const INVITE_ROLES: Role[] = ['ADMIN', 'PM']
export const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']
export const PLAN_STATUSES: PlanStatus[] = ['DRAFT', 'APPROVED', 'ARCHIVED']
export const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOID']
export const TXN_TYPES: TxnType[] = ['IN', 'OUT', 'ADJUSTMENT']
export const OUT_REASONS: OutReason[] = ['USED', 'DAMAGED', 'LOST']
export const ADJUSTMENT_DIRECTIONS: AdjustmentDirection[] = ['INCREASE', 'DECREASE']
export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK', 'UPI', 'CHEQUE']
export const AREA_UNITS: AreaUnit[] = ['SQFT', 'SQYD', 'SQM', 'ACRE']
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER',
  'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER',
]
export const MILESTONE_STATUSES: MilestoneStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']
export const GST_OPTIONS = [0, 5, 12, 18, 28]

/** Project status machine: PLANNING→ACTIVE→ON_HOLD↔ACTIVE→COMPLETED */
export const ALLOWED_PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  PLANNING: ['ACTIVE'],
  ACTIVE: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['ACTIVE'],
  COMPLETED: [],
}

/** Plan status machine: DRAFT→APPROVED→ARCHIVED */
export const ALLOWED_PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  DRAFT: ['APPROVED'],
  APPROVED: ['ARCHIVED'],
  ARCHIVED: [],
}

/** Manual invoice status transitions (PAID/PARTIALLY_PAID are set automatically by payments) */
export const ALLOWED_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT', 'VOID'],
  SENT: ['VOID'],
  PARTIALLY_PAID: [],
  PAID: [],
  VOID: [],
}

// ---------------------------------------------------------------------------
// Display labels + badge classes (frontend presentation)
// ---------------------------------------------------------------------------

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  PM: 'Project Manager',
  VIEWER: 'Viewer',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  DRAFT: 'Draft',
  APPROVED: 'Approved',
  ARCHIVED: 'Archived',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  VOID: 'Void',
}

export const TXN_TYPE_LABELS: Record<TxnType, string> = {
  IN: 'Stock In',
  OUT: 'Consumed',
  ADJUSTMENT: 'Adjustment',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK: 'Bank Transfer',
  UPI: 'UPI',
  CHEQUE: 'Cheque',
}

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  SQFT: 'sq ft',
  SQYD: 'sq yd',
  SQM: 'sq m',
  ACRE: 'acres',
}

export const BADGE_CLASSES: Record<string, string> = {
  // project statuses
  PLANNING: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30',
  ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  'ON_HOLD': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  COMPLETED: 'bg-stone-200 text-stone-700 border-stone-400 dark:bg-stone-500/20 dark:text-stone-300 dark:border-stone-500/40',
  // plan statuses
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  ARCHIVED: 'bg-stone-200 text-stone-700 border-stone-400 dark:bg-stone-500/20 dark:text-stone-300 dark:border-stone-500/40',
  // invoice statuses
  SENT: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  VOID: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  // wastage statuses
  OVERRUN: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  NO_BASELINE: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  OK: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
}

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export interface PageMeta {
  page: number
  pageSize: number
  limit: number
  total: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

/** Full user row as returned by /auth/me and login payloads */
export interface AuthUserRow {
  id: string
  name: string
  email: string
  role: Role
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: AuthUserRow
}

export interface OtpRequestResponse {
  ok: true
  delivered: boolean
  expiresInSeconds: number
  devCode?: string
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserRow {
  id: string
  name: string
  email: string
  role: Role
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  /** Count of projects this user manages as PM (0 for non-PMs) */
  managedProjects: number
}

// ---------------------------------------------------------------------------
// Lands
// ---------------------------------------------------------------------------

export interface LandRow {
  id: string
  name: string
  addressLine: string | null
  city: string
  state: string
  pincode: string | null
  areaValue: number
  areaUnit: AreaUnit
  surveyNumber: string | null
  ownerName: string | null
  purchaseDate: string | null
  purchaseCost: number | null
  notes: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  /** Number of projects on this land */
  projects: number
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectRow {
  id: string
  code: string
  name: string
  description: string | null
  location: string | null
  status: ProjectStatus
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
  totalBudget: number
  wastageThresholdPct: number
  landId: string
  assignedPmId: string | null
  assignedPm: { id: string; name: string; email: string } | null
  land: {
    id: string
    name: string
    addressLine: string | null
    city: string
    state: string
    pincode: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export interface ProjectDetailRow extends ProjectRow {
  _count: {
    logs: number
    transactions: number
    plans: number
    milestones: number
    invoices: number
  }
}

export interface ProjectSummaryRow {
  latestProgressPercent: number
  latestLogDate: string | null
  totalDailyLogs: number
  totalLabourHeadCount: number
  totalLabourHours: number
  totalMachineryHours: number
  totalMachineryFuel: number
}

export interface ProgressHistoryRow {
  id: string
  logDate: string
  progressPercent: number
  workSummary: string
}

export interface ActivityRow {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  userId: string | null
  userName: string | null
  oldData: unknown
  newData: unknown
  createdAt: string
}

// ---------------------------------------------------------------------------
// Daily logs
// ---------------------------------------------------------------------------

export interface LabourEntryRow {
  id: string
  trade: string
  contractorName: string | null
  headCount: number
  hoursWorked: number
  remarks: string | null
}

export interface MachineryEntryRow {
  id: string
  machineName: string
  operatorName: string | null
  hoursUsed: number
  fuelLitres: number | null
  remarks: string | null
}

export interface DailyLogRow {
  id: string
  projectId: string
  logDate: string
  progressPercent: number
  workSummary: string
  weather: string | null
  issues: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  labourEntries: LabourEntryRow[]
  machineryEntries: MachineryEntryRow[]
  createdBy?: { id: string; name: string }
  labourHeadCountTotal?: number
  machineryHoursTotal?: number
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

export interface LabourByTrade {
  trade: string
  workerCount: number
  labourHours: number
  entries: number
}

export interface LabourSummary {
  totalWorkerCount: number
  totalLabourHours: number
  totalLabourEntries: number
  byTrade: LabourByTrade[]
}

export interface WorkerCountHistoryRow {
  dailyLogId: string
  logDate: string
  totalWorkerCount: number
  labourHours: number
  byTrade: LabourByTrade[]
}

export interface MachineryByMachine {
  machineName: string
  hoursUsed: number
  fuelConsumption: number
  entries: number
}

export interface MachinerySummary {
  totalMachineryHours: number
  totalFuelConsumption: number
  totalMachineryEntries: number
  byMachine: MachineryByMachine[]
}

export interface MachineryUsageHistoryRow {
  dailyLogId: string
  logDate: string
  machineName: string
  hoursUsed: number
  fuelConsumption: number
  operatorName: string | null
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export interface MilestoneRow {
  id: string
  projectId: string
  name: string
  description: string | null
  sequence: number
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  status: MilestoneStatus
  progressPercent: number
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Materials + material plans
// ---------------------------------------------------------------------------

export interface MaterialRow {
  id: string
  name: string
  category: MaterialCategory
  unit: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PlanRow {
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

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface InventoryRow {
  materialId: string
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
  materialId: string
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

export interface StockTxnRow {
  id: string
  projectId: string
  materialId: string
  txnType: TxnType
  quantity: number
  unitRate: number | null
  vendorId: string | null
  challanNumber: string | null
  outReason: OutReason | null
  adjustmentDirection: AdjustmentDirection | null
  txnDate: string
  dailyLogId: string | null
  remarks: string | null
  createdById: string
  createdAt: string
  isVoided: boolean
  voidedAt: string | null
  voidReason: string | null
  voidedById: string | null
  material: { name: string; unit: string }
  createdBy: { id: string; name: string }
}

export type WastageStatus = 'OK' | 'OVERRUN' | 'NO_BASELINE'

export interface WastageItemRow {
  materialId: string
  materialName: string
  unit: string
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

export interface WastageReport {
  progressPercent: number
  items: WastageItemRow[]
}

// ---------------------------------------------------------------------------
// Billing (invoices + payments)
// ---------------------------------------------------------------------------

export interface PaymentRow {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference: string | null
  paidAt: string
}

export interface InvoiceRow {
  id: string
  invoiceNo: string
  projectId: string
  project: { code: string; name: string }
  amount: number
  gstPct: number
  totalWithGst: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidAmount: number
  balance: number
  payments: PaymentRow[]
}

export interface InvoiceListResponse {
  items: InvoiceRow[]
  summary: { invoiced: number; collected: number; receivables: number; overdue: number }
}

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

export interface SupplierRow {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  supplyTxnCount: number
}

// ---------------------------------------------------------------------------
// Meta (dropdown data for forms)
// ---------------------------------------------------------------------------

export interface MetaResponse {
  materials: { id: string; name: string; unit: string; category: string }[]
  suppliers: { id: string; name: string; phone: string }[]
  lands: { id: string; name: string; city: string; state: string }[]
  projects: { id: string; name: string; code: string; status: ProjectStatus; pmId: string | null; pmName: string | null }[]
  managers: { id: string; name: string }[]
}

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

export interface AdminDashboardResponse {
  kpis: {
    totalProjects: number
    activeProjects: number
    onHoldProjects: number
    planningProjects: number
    completedProjects: number
    totalBudget: number
    totalSpend: number
    budgetUtilization: number | null
    receivables: number
    overdueInvoices: number
    avgWastagePct: number | null
    worstProjectName: string | null
    worstWastagePct: number | null
  }
  statusBreakdown: { status: ProjectStatus; count: number }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  budgetVsSpend: { projectName: string; budget: number; spend: number }[]
  wastageByProject: { projectName: string; wastagePct: number | null; plannedQty: number; consumedQty: number }[]
  recentActivity: { id: string; action: string; actorName: string | null; entityType: string | null; createdAt: string }[]
  recentInvoices: { id: string; invoiceNo: string; projectName: string; totalWithGst: number; status: InvoiceStatus; dueDate: string; balance: number }[]
  projects: {
    id: string
    code: string
    name: string
    location: string | null
    status: ProjectStatus
    totalBudget: number
    expectedEndDate: string | null
    pmName: string | null
    latestProgressPercent: number
    latestLogDate: string | null
    totalDailyLogs: number
  }[]
  recentProgress: {
    projectId: string
    projectName: string
    code: string
    id: string
    logDate: string
    progressPercent: number
    workSummary: string
  }[]
}

export interface PmDashboardResponse {
  kpis: {
    myProjects: number
    activeProjects: number
    totalBudget: number
    totalSpend: number
    draftPlans: number
    avgWastagePct: number | null
  }
  projects: {
    id: string
    name: string
    code: string
    status: ProjectStatus
    totalBudget: number
    spend: number
    expectedEndDate: string | null
    wastagePct: number | null
    latestProgressPercent: number | null
    latestLogDate: string | null
    totalDailyLogs: number
  }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  recentLogs: { id: string; projectId: string; projectName: string; logDate: string; progressPercent: number; workSummary: string }[]
  upcomingEndDates: { id: string; name: string; expectedEndDate: string; status: ProjectStatus }[]
}

// ---------------------------------------------------------------------------
// Wastage overview (portfolio)
// ---------------------------------------------------------------------------

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

export interface WastageOverviewResponse {
  items: WastageOverviewRow[]
  portfolio: { totalPlanned: number; totalConsumed: number; avgOverrunPct: number | null }
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export interface AuditRow {
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

export interface AuditListResponse {
  items: AuditRow[]
  total: number
  page: number
  limit: number
}

export interface AuditStatsResponse {
  total: number
  byAction: { action: string; count: number }[]
  byActor: { actorName: string; count: number }[]
  last7Days: { date: string; label: string; count: number }[]
}
