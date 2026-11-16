// Imports useCallback, useEffect, useMemo, useState, type ReactNode from react so this module can reuse that component, helper, or library.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
// Imports apiGet, apiPost, ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, ApiError } from '../../../lib/api'
// Imports AuthContext, type AuthContextValue, type AuthStatus from ./auth-context so this module can reuse that component, helper, or library.
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  clearAccessToken,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  getAccessToken,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  saveAccessToken,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  setAuthUser,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type AuthUser,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from './session'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface LoginResponse {
  // Sets the token field so the surrounding object or component receives this setting.
  token: string
  // Sets the user field so the surrounding object or component receives this setting.
  user: AuthUser
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines AuthProvider so this module can perform its named task when needed.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [user, setUser] = useState<AuthUser | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [status, setStatus] = useState<AuthStatus>(() => getAccessToken() ? 'loading' : 'unauthenticated')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [restoreAttempt, setRestoreAttempt] = useState(0)

  // Stores the value in applyUser so later lines can reuse this data or behavior for the current feature.
  const applyUser = useCallback((nextUser: AuthUser | null) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setAuthUser(nextUser)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setUser(nextUser)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  // Stores the value in logout so later lines can reuse this data or behavior for the current feature.
  const logout = useCallback(() => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    clearAccessToken()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    applyUser(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setStatus('unauthenticated')
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [applyUser])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in handleUnauthorized so later lines can reuse this data or behavior for the current feature.
    const handleUnauthorized = () => {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      applyUser(null)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(null)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setStatus('unauthenticated')
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    window.addEventListener('forgeos:unauthorized', handleUnauthorized)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => window.removeEventListener('forgeos:unauthorized', handleUnauthorized)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [applyUser])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in active so later lines can reuse this data or behavior for the current feature.
    let active = true
    // Stores the value in token so later lines can reuse this data or behavior for the current feature.
    const token = getAccessToken()
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!token) {
      // Returns the result so the caller or React receives the value or interface this function provides.
      return () => { active = false }
    // Closes the current block or object so the grouped statements or settings end here.
    }

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    apiGet<AuthUser>('/auth/me')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .then(({ data }) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!active) return
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        applyUser(data)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setStatus('authenticated')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .catch((cause: unknown) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!active) return
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (cause instanceof ApiError && cause.status === 401) {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          clearAccessToken()
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          applyUser(null)
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setStatus('unauthenticated')
          // Returns the result so the caller or React receives the value or interface this function provides.
          return
        // Closes the current block or object so the grouped statements or settings end here.
        }
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(cause instanceof Error ? cause.message : 'Unable to restore your session.')
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setStatus('error')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })

    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => { active = false }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [applyUser, restoreAttempt])

  // Stores the value in login so later lines can reuse this data or behavior for the current feature.
  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      const { data } = await apiPost<LoginResponse>('/auth/login', { email, password })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      saveAccessToken(data.token, rememberMe)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      applyUser(data.user)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setStatus('authenticated')
      // Returns the result so the caller or React receives the value or interface this function provides.
      return data.user
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      clearAccessToken()
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      applyUser(null)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setStatus('unauthenticated')
      // Stops the current operation with an error so the calling code can handle the failure.
      throw cause
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [applyUser])

  // Stores the value in retrySessionRestore so later lines can reuse this data or behavior for the current feature.
  const retrySessionRestore = useCallback(() => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setStatus('loading')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setRestoreAttempt((attempt) => attempt + 1)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  // Stores the value in value so later lines can reuse this data or behavior for the current feature.
  const value = useMemo<AuthContextValue>(() => ({
    // Continues the component or data expression so its related values and behavior stay grouped together.
    user,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    status,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    error,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    login,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    logout,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    retrySessionRestore,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [user, status, error, login, logout, retrySessionRestore])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Restores, updates, and shares the signed-in user's session with React components.
