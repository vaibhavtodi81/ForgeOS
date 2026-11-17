import { getAuthUserSnapshot, type AuthUser } from '../auth/session'

export type UserRole = 'Admin' | 'Project Manager'

export function getCurrentUser(): AuthUser | null {
  return getAuthUserSnapshot()
}

export function getCurrentRole(): UserRole | null {
  const role = getCurrentUser()?.role
  if (role === 'ADMIN') return 'Admin'
  if (role === 'PM') return 'Project Manager'
  return null
}

export function hasPermission(allowedRoles: UserRole[]): boolean {
  const role = getCurrentRole()
  return role !== null && allowedRoles.includes(role)
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === 'ADMIN'
}

export function isProjectManager(): boolean {
  return getCurrentUser()?.role === 'PM'
}
