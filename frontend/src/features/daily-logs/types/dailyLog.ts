export type DailyLogStatus = 'Draft' | 'Submitted' | 'Approved'

export type AttendanceStatus = 'Present' | 'Absent' | 'Half day'

export interface LabourEntry {
  id: string
  name: string
  trade: string
  company: string
  status: AttendanceStatus
  hours: number
}

export interface MachineryEntry {
  id: string
  name: string
  type: string
  operator: string
  hours: number
  status: 'In use' | 'Idle' | 'Maintenance'
}

export interface ProgressEntry {
  id: string
  date: string
  activity: string
  completion: number
  note: string
}

export interface ActivityEntry {
  id: string
  time: string
  title: string
  description: string
  type: 'update' | 'delivery' | 'issue' | 'approval'
}

export interface DailyLog {
  id: string
  date: string
  project: string
  weather: string
  status: DailyLogStatus
  summary: string
  progress: number
  labour: LabourEntry[]
  machinery: MachineryEntry[]
  progressHistory: ProgressEntry[]
  activity: ActivityEntry[]
}
