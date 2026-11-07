import { projectLogs } from './projectLogs'
import type { ProjectLog } from '../types/projectLog'

const storageKey = 'forgeos-project-logs'

export function getProjectLogs(projectId: string): ProjectLog[] {
  try {
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? JSON.parse(stored) as ProjectLog[] : projectLogs
    return parsed.filter((log) => log.projectId === projectId).map(normalizeProjectLog)
  } catch {
    return projectLogs.filter((log) => log.projectId === projectId).map(normalizeProjectLog)
  }
}

export function saveProjectLog(log: ProjectLog) {
  const allLogs = getAllProjectLogs()
  const next = allLogs.some((item) => item.id === log.id)
    ? allLogs.map((item) => item.id === log.id ? log : item)
    : [...allLogs, log]
  localStorage.setItem(storageKey, JSON.stringify(next))
}

function getAllProjectLogs(): ProjectLog[] {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) as ProjectLog[] : projectLogs
  } catch {
    return projectLogs
  }
}

function normalizeProjectLog(log: ProjectLog): ProjectLog {
  return {
    ...log,
    issues: log.issues ?? '',
    labour: log.labour ?? [],
    machinery: log.machinery ?? [],
  }
}
