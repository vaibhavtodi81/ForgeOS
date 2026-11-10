export type UserRole = 'Admin' | 'Project Manager'

/** The shape stored in localStorage under `forgeos_demo_user`. */
export interface StoredUser {
  id?: string | number
  name?: string
  email?: string
  role: 'admin' | 'pm'
  rememberMe?: boolean
  /** PM-only: the project assigned at login. */
  assignedProjectId?: string
  assignedProjectCode?: string
  assignedProjectName?: string
}

/** All projects available for PM selection at login. */
export const AVAILABLE_PROJECTS = [
  { id: '1', code: 'PRJ-001', name: 'Green Valley Residency' },
  { id: '2', code: 'PRJ-002', name: 'Skyline Commercial Hub' },
  { id: '3', code: 'PRJ-003', name: 'Riverside Heights' },
  { id: '4', code: 'PRJ-004', name: 'Urban Square' },
]

/** PM access codes that admin gives to project managers. */
export const PM_ACCESS_CODES = ['FORGE-PM-2026', 'FORGEOS-SITE', 'PM-ACCESS-01']

export const getCurrentUser = (): StoredUser | null => {
  try {
    const storedUser = localStorage.getItem('forgeos_demo_user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export const getCurrentRole = (): UserRole | null => {
  const role = String(getCurrentUser()?.role ?? '').toLowerCase().trim()

  if (role === 'admin') return 'Admin'
  if (role === 'pm' || role === 'project manager') return 'Project Manager'

  return null
}

export const hasPermission = (allowedRoles: UserRole[]) => {
  const role = getCurrentRole()
  return role !== null && allowedRoles.includes(role)
}

export const isAdmin = () => getCurrentRole() === 'Admin'
export const isProjectManager = () => getCurrentRole() === 'Project Manager'

/** Get the project assigned to the current PM at login. Returns null for admins. */
export const getAssignedProject = () => {
  const user = getCurrentUser()
  if (!user || user.role !== 'pm') return null
  if (!user.assignedProjectId) return null
  return {
    id: user.assignedProjectId,
    code: user.assignedProjectCode || '',
    name: user.assignedProjectName || '',
  }
}
