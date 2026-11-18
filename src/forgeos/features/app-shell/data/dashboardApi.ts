import { apiGet } from '../../../lib/api'
import type { Project } from '../../projects/projects-context'

export interface ProjectDashboardSummary {
  latestProgressPercent: number | null
  latestLogDate: string | null
  totalDailyLogs: number
}

export interface DashboardProjectData {
  project: Project
  summary: ProjectDashboardSummary
}

export interface AdminDashboardActivity {
  id: string
  action: string
  actorName: string | null
  entityType: string | null
  createdAt: string
}

export interface AdminDashboardProgress {
  projectId: string
  projectName: string
  code: string
  id: string
  logDate: string
  progressPercent: number
  workSummary: string | null
}

export interface AdminDashboardKpis {
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

export interface AdminDashboardData {
  kpis: AdminDashboardKpis
  projects: DashboardProjectData[]
  recentProgress: AdminDashboardProgress[]
  recentActivity: AdminDashboardActivity[]
}

export interface PmDashboardKpis {
  myProjects: number
  activeProjects: number
  totalBudget: number
  totalSpend: number
  draftPlans: number
  avgWastagePct: number | null
}

export interface PmDashboardProject {
  id: string
  name: string
  code: string
  status: Project['status']
  totalBudget: number
  spend: number
  expectedEndDate: string | null
  wastagePct: number | null
  latestProgressPercent: number | null
  latestLogDate: string | null
  totalDailyLogs: number
}

export interface PmDashboardLog {
  id: string
  projectId: string
  projectName: string
  logDate: string
  progressPercent: number
  workSummary: string | null
}

export interface PmDashboardUpcoming {
  id: string
  name: string
  expectedEndDate: string
  status: Project['status']
}

export interface PmDashboardData {
  kpis: PmDashboardKpis
  projects: PmDashboardProject[]
  spendByMonth: { month: string; label: string; spend: number }[]
  recentLogs: PmDashboardLog[]
  upcomingEndDates: PmDashboardUpcoming[]
}

interface AdminDashboardResponse {
  kpis: AdminDashboardKpis
  statusBreakdown: { status: string; count: number }[]
  spendByMonth: { month: string; label: string; spend: number }[]
  budgetVsSpend: { projectName: string; budget: number; spend: number }[]
  wastageByProject: { projectName: string; wastagePct: number | null; plannedQty: number; consumedQty: number }[]
  recentActivity: AdminDashboardActivity[]
  recentInvoices: {
    id: string
    invoiceNo: string
    projectName: string
    totalWithGst: number
    status: string
    dueDate: string
    balance: number
  }[]
  projects: {
    id: string
    code: string
    name: string
    location: string | null
    status: Project['status']
    totalBudget: number
    expectedEndDate: string | null
    pmName: string | null
    latestProgressPercent: number
    latestLogDate: string | null
    totalDailyLogs: number
  }[]
  recentProgress: AdminDashboardProgress[]
}

interface PmDashboardResponse {
  kpis: PmDashboardKpis
  projects: PmDashboardProject[]
  spendByMonth: { month: string; label: string; spend: number }[]
  recentLogs: PmDashboardLog[]
  upcomingEndDates: PmDashboardUpcoming[]
}

function toDashboardProject(row: AdminDashboardResponse['projects'][number]): DashboardProjectData {
  return {
    project: {
      id: row.id,
      code: row.code,
      name: row.name,
      location: row.location || 'Location not specified',
      status: row.status,
      startDate: null,
      expectedEndDate: row.expectedEndDate,
      actualEndDate: null,
      totalBudget: row.totalBudget,
      assignedPm: row.pmName ? { id: '', name: row.pmName, email: '' } : null,
    },
    summary: {
      latestProgressPercent: row.latestProgressPercent,
      latestLogDate: row.latestLogDate,
      totalDailyLogs: row.totalDailyLogs,
    },
  }
}

export async function fetchAdminDashboard(signal: AbortSignal): Promise<AdminDashboardData> {
  const { data } = await apiGet<AdminDashboardResponse>('/dashboard/admin', { signal })
  return {
    kpis: data.kpis,
    projects: data.projects.map(toDashboardProject),
    recentProgress: data.recentProgress,
    recentActivity: data.recentActivity,
  }
}

export async function fetchPmDashboard(signal: AbortSignal): Promise<PmDashboardData> {
  const { data } = await apiGet<PmDashboardResponse>('/dashboard/pm', { signal })
  return data
}
