// Imports createContext from react so this module can reuse that component, helper, or library.
import { createContext } from 'react'
// Imports type  AuthUser from ./session so this module can reuse that component, helper, or library.
import type { AuthUser } from './session'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface AuthContextValue {
  // Sets the user field so the surrounding object or component receives this setting.
  user: AuthUser | null
  // Sets the status field so the surrounding object or component receives this setting.
  status: AuthStatus
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
  // Sets the login field so the surrounding object or component receives this setting.
  login: (email: string, password: string, rememberMe: boolean) => Promise<AuthUser>
  // Sets the logout field so the surrounding object or component receives this setting.
  logout: () => void
  // Sets the retrySessionRestore field so the surrounding object or component receives this setting.
  retrySessionRestore: () => void
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in AuthContext so later lines can reuse this data or behavior for the current feature.
export const AuthContext = createContext<AuthContextValue | null>(null)
// File purpose: Supports frontend authentication through auth context.
