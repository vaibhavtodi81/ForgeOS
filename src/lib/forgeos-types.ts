// ForgeOS — shared types and API contract used by BOTH backend routes and frontend views.
// This file is the single source of truth for request/response shapes.

// ---------------------------------------------------------------------------
// Enums (stored as plain strings in SQLite)
// ---------------------------------------------------------------------------

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'ACCOUNTANT' | 'VIEWER'
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
export type PlanStatus = 'DRAFT' | 'APPROVED' | 'ARCHIVED'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOID'
export type TxnType = 'IN' | 'OUT' | 'ADJUSTMENT'
export type PaymentMethod = 'CASH' | 'BANK' | 'UPI' | 'CHEQUE'

export type AuditAction =
  | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE'
  | 'OTP_REQUEST' | 'OTP_LOGIN' | 'OAUTH_LOGIN'
  | 'USER_CREATE' | 'USER_ACTIVATE' | 'USER_DEACTIVATE' | 'ROLE_CHANGE'
  | 'PROJECT_CREATE' | 'PROJECT_UPDATE' | 'PROJECT_DELETE' | 'PROJECT_STATUS_CHANGE' | 'PM_ASSIGN'
  | 'PLAN_CREATE' | 'PLAN_UPDATE' | 'PLAN_DELETE' | 'PLAN_STATUS_CHANGE'
  | 'MATERIAL_CREATE' | 'MATERIAL_ACTIVATE' | 'MATERIAL_DEACTIVATE'
  | 'LAND_CREATE' | 'SUPPLIER_CREATE'
  | 'INVENTORY_CREATE' | 'INVENTORY_VOID'
  | 'INVOICE_CREATE' | 'INVOICE_STATUS_CHANGE'
  | 'PAYMENT_CREATE' | 'DAILY_LOG_CREATE'

export const ROLES: Role[] = ['ADMIN', 'PROJECT_MANAGER', 'ACCOUNTANT', 'VIEWER']
export const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']
export const PLAN_STATUSES: PlanStatus[] = ['DRAFT', 'APPROVED', 'ARCHIVED']
export const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOID']
export const TXN_TYPES: TxnType[] = ['IN', 'OUT', 'ADJUSTMENT']
export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK', 'UPI', 'CHEQUE']
export const GST_OPTIONS = [0, 5, 12, 18, 28]

/** Project status machine: PLANNING→ACTIVE→ON_HOLD↔ACTIVE→COMPLETED */
export const ALLOWED_PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  PLANNING: ['ACTIVE'],
  ACTIVE: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['ACTIVE'],
  COMPLETED: [],
}

/** Plan status machine */
export const ALLOWED_PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  DRAFT: ['APPROVED'],
  APPROVED: ['DRAFT', 'ARCHIVED'],
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
  PROJECT_MANAGER: 'Project Manager',
  ACCOUNTANT: 'Accountant',
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

export interface LoginResponse {
  token: string
  expiresAt: string
  user: SessionUser
}

export interface OtpRequestResponse {
  ok: true
  delivered: boolean
  expiresInSeconds: number
  /** Present only when Gmail SMTP is not configured — dev fallback so the flow still works */
  devCode?: string
}

// ---------------------------------------------------------------------------
// Generic
// ---------------------------------------------------------------------------

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserRow {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  activeProjects: number
}

// ---------------------------------------------------------------------------
// Meta (dropdown data for forms)
// ---------------------------------------------------------------------------

export interface MetaResponse {
  materials: { id: string; name: string; unit: string; category: string }[]
  suppliers: { id: string; name: string; phone: string }[]
  lands: { id: string; name: string; location: string }[]
  projects: { id: string; name: string; code: string; status: ProjectStatus; pmId: string | null; pmName: string | null }[]
  managers: { id: string; name: string }[]
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectRow {
  id: string
  code: string
  name: string
  status: ProjectStatus
  budget: number
  startDate: string
  plannedEndDate: string | null
  actualEndDate: string | null
  landId: string
  landName: string
  pmId: string | null
  pmName: string | null
  spend: number
  invoiced: number
  collected: number
  createdAt: string
}

export interface ProjectDetail extends ProjectRow {
  plans: PlanRow[]
  transactions: TxnRow[]
  logs: LogRow[]
  invoices: InvoiceRow[]
}

// ---------------------------------------------------------------------------
// Material plans
// ---------------------------------------------------------------------------

export interface PlanRow {
  id: string
  projectId: string
  projectName: string
  materialId: string
  materialName: string
  unit: string
  plannedQty: number
  wastagePct: number
  status: PlanStatus
  notes: string | null
  createdByName: string
  createdAt: string
  consumedQty: number
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface TxnRow {
  id: string
  projectId: string
  projectName: string
  materialId: string
  materialName: string
  unit: string
  supplierId: string | null
  supplierName: string | null
  txnType: TxnType
  quantity: number
  unitRate: number
  totalCost: number
  txnDate: string
  voidedAt: string | null
  voidReason: string | null
  recordedByName: string
}

export interface TxnListResponse extends Paginated<TxnRow> {
  summary: { spend: number; txnCount: number; voidedCount: number }
}

// ---------------------------------------------------------------------------
// Daily logs
// ---------------------------------------------------------------------------

export interface LogRow {
  id: string
  projectId: string
  projectName: string
  logDate: string
  workDone: string
  headcount: number
  notes: string | null
  createdByName: string
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export interface InvoiceRow {
  id: string
  invoiceNo: string
  projectId: string
  projectName: string
  amount: number
  gstPct: number
  totalWithGst: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidAmount: number
  balance: number
}

export interface InvoiceListResponse {
  items: InvoiceRow[]
  summary: { invoiced: number; collected: number; receivables: number; overdue: number }
}

export interface PaymentRow {
  id: string
  invoiceId: string
  invoiceNo: string
  amount: number
  method: PaymentMethod
  reference: string | null
  paidAt: string
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
  projects: { id: string; name: string; code: string; status: ProjectStatus; budget: number; spend: number; plannedEndDate: string | null; wastagePct: number | null; progressPct: number | null }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  recentLogs: { id: string; projectName: string; logDate: string; workDone: string; headcount: number }[]
  upcomingEndDates: { id: string; name: string; plannedEndDate: string; status: ProjectStatus }[]
}

// ---------------------------------------------------------------------------
// Wastage
// ---------------------------------------------------------------------------

export interface WastageRow {
  projectId: string
  projectName: string
  materialId: string
  materialName: string
  unit: string
  plannedQty: number
  consumedQty: number
  varianceQty: number
  /** (consumed − estimated) ÷ estimated × 100, where estimated = planned ÷ (1 + wastagePct/100) */
  wastagePct: number | null
  status: PlanStatus
}

export interface WastageOverviewResponse {
  items: WastageRow[]
  portfolio: { totalPlanned: number; totalConsumed: number; avgWastagePct: number | null }
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
  meta: string | null
  ip: string | null
  createdAt: string
}

export interface AuditStatsResponse {
  total: number
  byAction: { action: string; count: number }[]
  byActor: { actorName: string; count: number }[]
  last7Days: { date: string; label: string; count: number }[]
}

// ---------------------------------------------------------------------------
// Masters
// ---------------------------------------------------------------------------

export interface MaterialRow {
  id: string
  name: string
  unit: string
  category: string
  isActive: boolean
  lastRate: number | null
}

export interface LandRow {
  id: string
  name: string
  location: string
  areaSqft: number | null
  khasraNumber: string | null
  projectCount: number
}

export interface SupplierRow {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  txnCount: number
}
