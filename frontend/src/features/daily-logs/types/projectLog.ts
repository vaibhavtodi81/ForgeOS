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
  issues: string
  status: 'Draft' | 'Submitted' | 'Approved'
  labour: LabourRow[]
  machinery: MachineryRow[]
}

export interface LabourRow {
  id: string
  trade: string
  customTrade: string
  contractor: string
  workers: number
  hours: number
  remarks: string
}

export interface MachineryRow {
  id: string
  machine: string
  operator: string
  hours: number
  fuel: number
  remarks: string
}

export interface ProjectLogFormValues {
  date: string
  summary: string
  progress: number
  workerCount: number
  machineryHours: number
  weather: string
  issues: string
  status: ProjectLog['status']
  labour: LabourRow[]
  machinery: MachineryRow[]
}
