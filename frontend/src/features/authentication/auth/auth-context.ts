import { createContext } from 'react'
import type { AuthUser } from './session'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<AuthUser>
  logout: () => void
  retrySessionRestore: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
