export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'PM'
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const TOKEN_KEY = 'forgeos_access_token'
let currentUser: AuthUser | null = null

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
}

export function saveAccessToken(token: string, rememberMe: boolean): void {
  clearAccessToken()
  if (rememberMe) localStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function setAuthUser(user: AuthUser | null): void {
  currentUser = user
}

export function getAuthUserSnapshot(): AuthUser | null {
  return currentUser
}
