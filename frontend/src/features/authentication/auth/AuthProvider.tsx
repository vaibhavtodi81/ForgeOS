import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiGet, apiPost, ApiError } from '../../../lib/api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
  setAuthUser,
  type AuthUser,
} from './session'

interface LoginResponse {
  token: string
  user: AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => getAccessToken() ? 'loading' : 'unauthenticated')
  const [error, setError] = useState<string | null>(null)
  const [restoreAttempt, setRestoreAttempt] = useState(0)

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setAuthUser(nextUser)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    applyUser(null)
    setError(null)
    setStatus('unauthenticated')
  }, [applyUser])

  useEffect(() => {
    const handleUnauthorized = () => {
      applyUser(null)
      setError(null)
      setStatus('unauthenticated')
    }
    window.addEventListener('forgeos:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('forgeos:unauthorized', handleUnauthorized)
  }, [applyUser])

  useEffect(() => {
    let active = true
    const token = getAccessToken()
    if (!token) {
      return () => { active = false }
    }

    apiGet<AuthUser>('/auth/me')
      .then(({ data }) => {
        if (!active) return
        applyUser(data)
        setStatus('authenticated')
      })
      .catch((cause: unknown) => {
        if (!active) return
        if (cause instanceof ApiError && cause.status === 401) {
          clearAccessToken()
          applyUser(null)
          setStatus('unauthenticated')
          return
        }
        setError(cause instanceof Error ? cause.message : 'Unable to restore your session.')
        setStatus('error')
      })

    return () => { active = false }
  }, [applyUser, restoreAttempt])

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    setError(null)
    try {
      const { data } = await apiPost<LoginResponse>('/auth/login', { email, password })
      saveAccessToken(data.token, rememberMe)
      applyUser(data.user)
      setStatus('authenticated')
      return data.user
    } catch (cause) {
      clearAccessToken()
      applyUser(null)
      setStatus('unauthenticated')
      throw cause
    }
  }, [applyUser])

  const retrySessionRestore = useCallback(() => {
    setError(null)
    setStatus('loading')
    setRestoreAttempt((attempt) => attempt + 1)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    error,
    login,
    logout,
    retrySessionRestore,
  }), [user, status, error, login, logout, retrySessionRestore])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
