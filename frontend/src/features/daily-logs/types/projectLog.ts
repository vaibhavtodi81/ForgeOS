export interface ProjectLog {
  id: string
  projectId: string
  date: string
  summary: string
  progress: number
  progressChange: number
  workerCount: number
  machineryHours: number
  weather: string
  status: 'Draft' | 'Submitted' | 'Approved'
}

export interface ProjectLogFormValues {
  date: string
  summary: string
  progress: number
  workerCount: number
  machineryHours: number
  weather: string
  status: ProjectLog['status']
}
