import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { useAuth } from '@/forgeos/features/authentication/auth/useAuth'
import { AuthContext } from '@/forgeos/features/authentication/auth/auth-context'
import { ApiError } from '@/forgeos/lib/api'
import { calledUrls, errEnvelope, getHeader, makeUser, okEnvelope, resetForgeOsState, requestBody, stubFetch } from './test-utils'
import type { AuthUser } from '@/forgeos/features/authentication/auth/session'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

const TOKEN_KEY = 'forgeos_access_token'

function renderAuthHook() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
  return renderHook(() => useAuth(), { wrapper })
}

describe('useAuth context guard', () => {
  test('throws when rendered outside AuthProvider', () => {
    // Silence React's expected error output for this negative test.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within AuthProvider',
      )
    } finally {
      consoleSpy.mockRestore()
    }
  })
})

describe('AuthProvider — session restore (/api/auth/me)', () => {
  test('starts in the loading state', () => {
    let releaseMe: ((value: Response) => void) | undefined
    stubFetch((url) => {
      if (url === '/api/auth/me') return new Promise<Response>((resolve) => { releaseMe = resolve })
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderAuthHook()
    expect(result.current.status).toBe('loading')
    expect(result.current.user).toBeNull()

    act(() => releaseMe?.(okEnvelope(makeUser('ADMIN'))))
  })

  test('restores an authenticated session from /auth/me', async () => {
    const admin = makeUser('ADMIN', { id: 'u-restore-1' })
    stubFetch((url) => (url === '/api/auth/me' ? okEnvelope(admin) : errEnvelope('unstubbed', 404)))

    const { result } = renderAuthHook()

    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.user).toEqual(admin)
    expect(result.current.error).toBeNull()
  })

  test('sends the stored Bearer token when restoring the session', async () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok-restore')
    const fetchMock = stubFetch((url) =>
      url === '/api/auth/me' ? okEnvelope(makeUser('ADMIN')) : errEnvelope('unstubbed', 404),
    )

    renderAuthHook()
    await waitFor(() => expect(calledUrls(fetchMock)).toContain('/api/auth/me'))
    expect(getHeader(fetchMock.mock.calls[0][1], 'authorization')).toBe('Bearer tok-restore')
  })

  test('a 401 from /auth/me results in the unauthenticated state and clears a stale token', async () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok-stale')
    stubFetch((url) => (url === '/api/auth/me' ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED') : errEnvelope('unstubbed', 404)))

    const { result } = renderAuthHook()

    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('a server error (non-401) surfaces an error message and offers a retry', async () => {
    let meFails = true
    const admin = makeUser('ADMIN', { id: 'u-retry-1' })
    stubFetch((url) => {
      if (url !== '/api/auth/me') return errEnvelope('unstubbed', 404)
      return meFails ? errEnvelope('Session service unavailable', 500, 'INTERNAL') : okEnvelope(admin)
    })

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Session service unavailable')
    expect(result.current.user).toBeNull()

    meFails = false
    act(() => result.current.retrySessionRestore())
    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.error).toBeNull()
    expect(result.current.user).toEqual(admin)
  })
})

describe('AuthProvider — login', () => {
  function renderWithUnauthenticatedSession() {
    stubFetch((url) =>
      url === '/api/auth/me' ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED') : errEnvelope('unstubbed', 404),
    )
    const hook = renderAuthHook()
    return hook
  }

  test('a successful login stores the token, applies the user and resolves with it', async () => {
    const hook = renderWithUnauthenticatedSession()
    await waitFor(() => expect(hook.result.current.status).toBe('unauthenticated'))

    const admin = makeUser('ADMIN', { id: 'u-login-1' })
    stubFetch((url) =>
      url === '/api/auth/me'
        ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
        : url === '/api/auth/login'
          ? okEnvelope({ token: 'tok-login', user: admin })
          : errEnvelope('unstubbed', 404),
    )

    let returned: AuthUser | undefined
    await act(async () => {
      returned = await hook.result.current.login('asha@forge.test', 'secret123', false)
    })

    expect(returned).toEqual(admin)
    expect(hook.result.current.status).toBe('authenticated')
    expect(hook.result.current.user).toEqual(admin)
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-login')
  })

  test('rememberMe=true persists the token in localStorage', async () => {
    const hook = renderWithUnauthenticatedSession()
    await waitFor(() => expect(hook.result.current.status).toBe('unauthenticated'))

    stubFetch((url) =>
      url === '/api/auth/me'
        ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
        : url === '/api/auth/login'
          ? okEnvelope({ token: 'tok-remember', user: makeUser('ADMIN') })
          : errEnvelope('unstubbed', 404),
    )

    await act(async () => {
      await hook.result.current.login('asha@forge.test', 'secret123', true)
    })

    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-remember')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('the login request carries only email and password as a JSON POST', async () => {
    const hook = renderWithUnauthenticatedSession()
    await waitFor(() => expect(hook.result.current.status).toBe('unauthenticated'))

    const fetchMock = stubFetch((url) =>
      url === '/api/auth/me'
        ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
        : url === '/api/auth/login'
          ? okEnvelope({ token: 't', user: makeUser('ADMIN') })
          : errEnvelope('unstubbed', 404),
    )

    await act(async () => {
      await hook.result.current.login('asha@forge.test', 'secret123', false)
    })

    const loginCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/login')
    expect(loginCall).toBeDefined()
    const init = loginCall?.[1]
    expect(init?.method).toBe('POST')
    expect(getHeader(init, 'content-type')).toBe('application/json')
    expect(await requestBody(init)).toEqual({ email: 'asha@forge.test', password: 'secret123' })
  })

  test('a failed login rejects with the ApiError, stores no token and stays unauthenticated', async () => {
    const hook = renderWithUnauthenticatedSession()
    await waitFor(() => expect(hook.result.current.status).toBe('unauthenticated'))

    stubFetch((url) =>
      url === '/api/auth/me'
        ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
        : url === '/api/auth/login'
          ? errEnvelope('Invalid email or password', 401, 'INVALID_CREDENTIALS')
          : errEnvelope('unstubbed', 404),
    )

    let caught: unknown
    await act(async () => {
      caught = await hook.result.current.login('asha@forge.test', 'wrong-password', false).catch((cause: unknown) => cause)
    })

    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as ApiError).message).toBe('Invalid email or password')
    expect(hook.result.current.status).toBe('unauthenticated')
    expect(hook.result.current.user).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('a failed login clears any pre-existing token', async () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok-previous')
    const hook = renderWithUnauthenticatedSession()
    await waitFor(() => expect(hook.result.current.status).toBe('unauthenticated'))

    stubFetch((url) =>
      url === '/api/auth/me'
        ? errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
        : url === '/api/auth/login'
          ? errEnvelope('Invalid email or password', 401, 'INVALID_CREDENTIALS')
          : errEnvelope('unstubbed', 404),
    )

    await act(async () => {
      await hook.result.current.login('asha@forge.test', 'wrong', false).catch(() => undefined)
    })

    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})

describe('AuthProvider — logout', () => {
  test('logout clears the user, fires POST /api/auth/logout and forgets the token', async () => {
    const admin = makeUser('ADMIN', { id: 'u-logout-1' })
    const fetchMock = stubFetch((url) => {
      if (url === '/api/auth/me') return okEnvelope(admin)
      if (url === '/api/auth/logout') return okEnvelope({ ok: true })
      return errEnvelope('unstubbed', 404)
    })

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.status).toBe('authenticated'))

    sessionStorage.setItem(TOKEN_KEY, 'tok-logout')

    act(() => result.current.logout())

    expect(result.current.status).toBe('unauthenticated')
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()

    await waitFor(() => {
      const logoutCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/logout')
      expect(logoutCall).toBeDefined()
      expect(logoutCall?.[1]?.method).toBe('POST')
    })
  })
})

describe('AuthProvider — forgeos:unauthorized event', () => {
  test('a forced unauthorized event resets the session to unauthenticated', async () => {
    const admin = makeUser('ADMIN', { id: 'u-event-1' })
    stubFetch((url) => (url === '/api/auth/me' ? okEnvelope(admin) : errEnvelope('unstubbed', 404)))

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.status).toBe('authenticated'))

    act(() => {
      window.dispatchEvent(new Event('forgeos:unauthorized'))
    })

    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    expect(result.current.user).toBeNull()
  })
})

describe('AuthContext default value', () => {
  test('the context resolves to null when no AuthProvider is mounted', () => {
    render(
      <AuthContext.Consumer>
        {(value) => <p>{value === null ? 'no-provider' : 'provider'}</p>}
      </AuthContext.Consumer>,
    )
    expect(screen.getByText('no-provider')).toBeInTheDocument()
  })
})
