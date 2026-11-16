// Imports getAuthUserSnapshot, type AuthUser from ../auth/session so this module can reuse that component, helper, or library.
import { getAuthUserSnapshot, type AuthUser } from '../auth/session'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type UserRole = 'Admin' | 'Project Manager'

// Defines getCurrentUser so this module can perform its named task when needed.
export function getCurrentUser(): AuthUser | null {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return getAuthUserSnapshot()
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines getCurrentRole so this module can perform its named task when needed.
export function getCurrentRole(): UserRole | null {
  // Stores the value in role so later lines can reuse this data or behavior for the current feature.
  const role = getCurrentUser()?.role
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (role === 'ADMIN') return 'Admin'
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (role === 'PM') return 'Project Manager'
  // Returns the result so the caller or React receives the value or interface this function provides.
  return null
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines hasPermission so this module can perform its named task when needed.
export function hasPermission(allowedRoles: UserRole[]): boolean {
  // Stores the value in role so later lines can reuse this data or behavior for the current feature.
  const role = getCurrentRole()
  // Returns the result so the caller or React receives the value or interface this function provides.
  return role !== null && allowedRoles.includes(role)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines isAdmin so this module can perform its named task when needed.
export function isAdmin(): boolean {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return getCurrentUser()?.role === 'ADMIN'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines isProjectManager so this module can perform its named task when needed.
export function isProjectManager(): boolean {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return getCurrentUser()?.role === 'PM'
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Maps the signed-in user's role to frontend permission checks.
