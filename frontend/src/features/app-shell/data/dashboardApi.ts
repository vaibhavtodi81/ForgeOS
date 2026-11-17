import { apiGet } from '../../../lib/api'
import { fetchProjectActivity, type ActivityPage, type ProjectActivity } from '../../daily-logs/data/projectReportingApi'
import type { Project } from '../../projects/projects-context'

export interface ProjectDashboardSummary {
  latestProgressPercent: number | string
  latestLogDate: string | null
  totalDailyLogs: number
  totalLabourHeadCount: number
  totalLabourHours: number
  totalMachineryHours: number
  totalMachineryFuel: number
}

export interface ProjectProgressEntry {
  id: number
  logDate: string
  progressPercent: number | string
  workSummary: string | null
}

export interface DashboardProjectData {
  project: Project
  summary: ProjectDashboardSummary
  progressHistory: ProjectProgressEntry[]
  activity: ActivityPage
}

export async function fetchDashboardProjectData(project: Project, signal: AbortSignal): Promise<DashboardProjectData> {
  const projectId = encodeURIComponent(String(project.id))
  const [summary, progressHistory, activity] = await Promise.all([
    apiGet<ProjectDashboardSummary>(`/projects/${projectId}/summary`, { signal }),
    apiGet<ProjectProgressEntry[]>(`/projects/${projectId}/progress-history`, { signal }),
    fetchProjectActivity(String(project.id), 1, 10, signal),
  ])

  return {
    project,
    summary: summary.data,
    progressHistory: progressHistory.data,
    activity,
  }
}

export function latestProjectActivity(projects: DashboardProjectData[]): Array<ProjectActivity & { project: Project }> {
  return projects
    .flatMap(({ project, activity }) => activity.activities.map((item) => ({ ...item, project })))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}
