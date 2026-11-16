// Imports apiGet from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet } from '../../../lib/api'
// Imports fetchProjectActivity, type ActivityPage, type ProjectActivity from ../../daily-logs/data/projectReportingApi so this module can reuse that component, helper, or library.
import { fetchProjectActivity, type ActivityPage, type ProjectActivity } from '../../daily-logs/data/projectReportingApi'
// Imports type  Project from ../../projects/projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../../projects/projects-context'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectDashboardSummary {
  // Sets the latestProgressPercent field so the surrounding object or component receives this setting.
  latestProgressPercent: number | string
  // Sets the latestLogDate field so the surrounding object or component receives this setting.
  latestLogDate: string | null
  // Sets the totalDailyLogs field so the surrounding object or component receives this setting.
  totalDailyLogs: number
  // Sets the totalLabourHeadCount field so the surrounding object or component receives this setting.
  totalLabourHeadCount: number
  // Sets the totalLabourHours field so the surrounding object or component receives this setting.
  totalLabourHours: number
  // Sets the totalMachineryHours field so the surrounding object or component receives this setting.
  totalMachineryHours: number
  // Sets the totalMachineryFuel field so the surrounding object or component receives this setting.
  totalMachineryFuel: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectProgressEntry {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: number | string
  // Sets the workSummary field so the surrounding object or component receives this setting.
  workSummary: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface DashboardProjectData {
  // Sets the project field so the surrounding object or component receives this setting.
  project: Project
  // Sets the summary field so the surrounding object or component receives this setting.
  summary: ProjectDashboardSummary
  // Sets the progressHistory field so the surrounding object or component receives this setting.
  progressHistory: ProjectProgressEntry[]
  // Sets the activity field so the surrounding object or component receives this setting.
  activity: ActivityPage
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchDashboardProjectData so this module can perform its named task when needed.
export async function fetchDashboardProjectData(project: Project, signal: AbortSignal): Promise<DashboardProjectData> {
  // Stores the value in projectId so later lines can reuse this data or behavior for the current feature.
  const projectId = encodeURIComponent(String(project.id))
  // Waits for the asynchronous result before using it, so later work receives completed data.
  const [summary, progressHistory, activity] = await Promise.all([
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    apiGet<ProjectDashboardSummary>(`/projects/${projectId}/summary`, { signal }),
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    apiGet<ProjectProgressEntry[]>(`/projects/${projectId}/progress-history`, { signal }),
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchProjectActivity(String(project.id), 1, 10, signal),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Continues the component or data expression so its related values and behavior stay grouped together.
    project,
    // Sets the summary field so the surrounding object or component receives this setting.
    summary: summary.data,
    // Sets the progressHistory field so the surrounding object or component receives this setting.
    progressHistory: progressHistory.data,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    activity,
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines latestProjectActivity so this module can perform its named task when needed.
export function latestProjectActivity(projects: DashboardProjectData[]): Array<ProjectActivity & { project: Project }> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return projects
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    .flatMap(({ project, activity }) => activity.activities.map((item) => ({ ...item, project })))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the app shell feature.
