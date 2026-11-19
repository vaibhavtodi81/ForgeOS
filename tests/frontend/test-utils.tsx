// Shared helpers for the ForgeOS frontend suite. This file is NOT a test file
// (vitest only picks up `*.test.{ts,tsx}`); it provides fetch stubbing, API
// envelope builders, user fixtures and per-test state resets.
import { vi } from 'vitest'
import { act } from '@testing-library/react'
import { clearAccessToken, setAuthUser, type AuthUser } from '@/forgeos/features/authentication/auth/session'

// ---------------------------------------------------------------------------
// Fetch stubbing
// ---------------------------------------------------------------------------

/** Handler invoked for every `fetch(url, init)` call made by app code. */
export type StubFetchHandler = (
  url: string,
  init: RequestInit | undefined,
) => Response | Promise<Response>

/**
 * Installs a URL-routing `fetch` double via `vi.stubGlobal` (auto-removed by
 * the global `vi.unstubAllGlobals()` in `tests/frontend-setup.ts`).
 * Returns the mock so tests can assert on calls.
 */
export function stubFetch(handler: StubFetchHandler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    return Promise.resolve(handler(url, init))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Convenience: stub fetch with a plain URL-prefix → Response route table. */
export function stubFetchRoutes(routes: Record<string, () => Response>, fallback?: () => Response) {
  return stubFetch((url) => {
    const match = Object.keys(routes)
      .sort((a, b) => b.length - a.length)
      .find((prefix) => url === prefix || url.startsWith(prefix))
    if (match) return routes[match]()
    if (fallback) return fallback()
    return errEnvelope(`No route stubbed for ${url}`, 404, 'NOT_STUBBED')
  })
}

// ---------------------------------------------------------------------------
// API envelope builders (mirrors src/lib/api-helpers.ts)
// ---------------------------------------------------------------------------

/** Success envelope: { success: true, message: 'OK', data, meta } */
export function okEnvelope<T>(data: T, meta?: unknown): Response {
  return new Response(
    JSON.stringify({ success: true, message: 'OK', data, meta: meta ?? null }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

/** Error envelope: { success: false, message, error: { code, message } } */
export function errEnvelope(message: string, status = 400, code = 'ERROR'): Response {
  return new Response(
    JSON.stringify({ success: false, message, error: { code, message } }),
    { status, headers: { 'content-type': 'application/json' } },
  )
}

/** Raw non-JSON response body. */
export function textResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/plain' } })
}

// ---------------------------------------------------------------------------
// Fetch call inspection helpers
// ---------------------------------------------------------------------------

/** Matches the call signature produced by `stubFetch` and plain fetch doubles. */
export type FetchMockLike = {
  mock: { calls: ReadonlyArray<[input: RequestInfo | URL, init?: RequestInit | undefined]> }
}

export function calledUrls(fetchMock: FetchMockLike): string[] {
  return fetchMock.mock.calls.map(([input]) =>
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
  )
}

export function getHeader(init: RequestInit | undefined, name: string): string | null {
  if (!init?.headers) return null
  if (init.headers instanceof Headers) return init.headers.get(name)
  if (Array.isArray(init.headers)) {
    const found = init.headers.find(([key]) => key.toLowerCase() === name.toLowerCase())
    return found ? String(found[1]) : null
  }
  const record = init.headers as Record<string, string>
  const key = Object.keys(record).find((k) => k.toLowerCase() === name.toLowerCase())
  return key ? record[key] : null
}

export async function requestBody(init: RequestInit | undefined): Promise<unknown> {
  return init?.body ? JSON.parse(String(init.body)) : null
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

export function makeUser(role: AuthUser['role'], overrides: Partial<AuthUser> = {}): AuthUser {
  const id = overrides.id ?? `u-${role.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    name: role === 'ADMIN' ? 'Asha Admin' : role === 'PM' ? 'Prakash Manager' : 'Vera Viewer',
    email: role === 'ADMIN' ? 'asha@forge.test' : role === 'PM' ? 'prakash@forge.test' : 'vera@forge.test',
    role,
    phone: null,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Per-test state reset
// ---------------------------------------------------------------------------

/** Clears storage, the session-module user snapshot, and the jsdom URL. */
export function resetForgeOsState(): void {
  localStorage.clear()
  sessionStorage.clear()
  clearAccessToken()
  setAuthUser(null)
  window.history.replaceState(null, '', '/')
}

/**
 * Pumps the microtask queue inside `act` so pending mocked-fetch promise
 * chains (fetch → response.json() → setState) settle before assertions.
 */
export async function flushAsync(ticks = 8): Promise<void> {
  for (let i = 0; i < ticks; i += 1) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}
