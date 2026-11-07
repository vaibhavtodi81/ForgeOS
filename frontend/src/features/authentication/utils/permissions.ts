export type UserRole = 'Admin' | 'Project Manager'

export const getCurrentUser = () => {
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
