import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiError, apiGet, apiPost, apiRequest } from '@/forgeos/lib/api'
import { saveAccessToken } from '@/forgeos/features/authentication/auth/session'
import {
  calledUrls,
  errEnvelope,
  getHeader,
  okEnvelope,
  requestBody,
  resetForgeOsState,
  stubFetch,
  textResponse,
} from './test-utils'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

describe('apiRequest — URL building', () => {
  test('prefixes the relative path with /api', async () => {
    const fetchMock = stubFetch(() => okEnvelope({ hello: 'world' }))

    await apiGet<{ hello: string }>('/things')
    expect(calledUrls(fetchMock)).toEqual(['/api/things'])
  })

  test('strips leading slashes from the path before joining the base URL', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/projects')
    await apiGet('//projects')
    await apiGet('projects')

    expect(calledUrls(fetchMock)).toEqual(['/api/projects', '/api/projects', '/api/projects'])
  })

  test('query strings in the path are preserved', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/projects?page=2&pageSize=100')
    expect(calledUrls(fetchMock)).toEqual(['/api/projects?page=2&pageSize=100'])
  })

  test('requests are sent with same-origin credentials', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(fetchMock.mock.calls[0][1]?.credentials).toBe('same-origin')
  })
})

describe('apiRequest — headers', () => {
  test('always sends Accept: application/json', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(getHeader(fetchMock.mock.calls[0][1], 'accept')).toBe('application/json')
  })

  test('GET without a body does not set Content-Type', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(getHeader(fetchMock.mock.calls[0][1], 'content-type')).toBeNull()
  })

  test('attaches a Bearer token from session/local storage when present', async () => {
    saveAccessToken('tok-abc-123', false)
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(getHeader(fetchMock.mock.calls[0][1], 'authorization')).toBe('Bearer tok-abc-123')
  })

  test('prefers a sessionStorage token over a localStorage token', async () => {
    saveAccessToken('tok-local', true)
    saveAccessToken('tok-session', false)
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(getHeader(fetchMock.mock.calls[0][1], 'authorization')).toBe('Bearer tok-session')
  })

  test('no Authorization header when no token is stored', async () => {
    const fetchMock = stubFetch(() => okEnvelope([]))

    await apiGet('/things')
    expect(getHeader(fetchMock.mock.calls[0][1], 'authorization')).toBeNull()
  })
})

describe('apiRequest — success envelope', () => {
  test('returns the full envelope: data, message and meta', async () => {
    stubFetch(() => okEnvelope({ id: 'p1' }, { page: 1, totalPages: 3 }))

    const envelope = await apiGet<{ id: string }>('/projects')
    expect(envelope.success).toBe(true)
    expect(envelope.message).toBe('OK')
    expect(envelope.data).toEqual({ id: 'p1' })
    expect(envelope.meta).toEqual({ page: 1, totalPages: 3 })
  })

  test('meta is null when the server sends none', async () => {
    stubFetch(() => okEnvelope({ x: 1 }))

    const envelope = await apiGet<{ x: number }>('/things')
    expect(envelope.meta).toBeNull()
  })
})

describe('apiRequest — error mapping', () => {
  test('maps a 4xx error envelope to an ApiError with status, code and message', async () => {
    stubFetch(() => errEnvelope('You do not have permission to perform this action', 403, 'FORBIDDEN'))

    const error = await apiGet('/projects').catch((cause: unknown) => cause)
    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.message).toBe('You do not have permission to perform this action')
    expect(apiError.status).toBe(403)
    expect(apiError.code).toBe('FORBIDDEN')
    expect(apiError.name).toBe('ApiError')
  })

  test('falls back to the envelope-level message when error.message is missing', async () => {
    stubFetch(
      () =>
        new Response(JSON.stringify({ success: false, message: 'Envelope-level failure' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        }),
    )

    const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Envelope-level failure')
    expect(error.status).toBe(409)
    expect(error.code).toBeUndefined()
  })

  test('uses a generic status message when the body carries neither message field', async () => {
    stubFetch(() => new Response('Bad Gateway', { status: 502, headers: { 'content-type': 'text/plain' } }))

    const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Request failed with status 502.')
    expect(error.status).toBe(502)
  })

  test('an HTTP 200 response without a success envelope is rejected as INVALID_RESPONSE', async () => {
    stubFetch(() => textResponse('just some html'))

    const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('The server returned an unexpected response.')
    expect(error.code).toBe('INVALID_RESPONSE')
    expect(error.status).toBe(200)
  })

  test('success:true without a data key is rejected as INVALID_RESPONSE', async () => {
    stubFetch(
      () =>
        new Response(JSON.stringify({ success: true, message: 'OK' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    )

    const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('INVALID_RESPONSE')
  })
})

describe('apiRequest — network failures', () => {
  test('a rejected fetch becomes a NETWORK_ERROR ApiError with status 0', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed')
    })

    const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe(
      'Unable to reach the ForgeOS server. Check your connection and try again.',
    )
    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
  })
})

describe('apiRequest — 401 handling', () => {
  test('a 401 clears the stored token and dispatches forgeos:unauthorized', async () => {
    saveAccessToken('tok-stale', false)
    stubFetch(() => errEnvelope('Not authenticated', 401, 'UNAUTHORIZED'))

    const onUnauthorized = vi.fn()
    window.addEventListener('forgeos:unauthorized', onUnauthorized)
    try {
      const error = (await apiGet('/projects').catch((cause: unknown) => cause)) as ApiError
      expect(error.status).toBe(401)

      expect(onUnauthorized).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem('forgeos_access_token')).toBeNull()
      expect(localStorage.getItem('forgeos_access_token')).toBeNull()
    } finally {
      window.removeEventListener('forgeos:unauthorized', onUnauthorized)
    }
  })

  test('a 401 on /auth/login does NOT clear tokens or dispatch the event', async () => {
    saveAccessToken('tok-kept', false)
    stubFetch(() => errEnvelope('Invalid email or password', 401, 'INVALID_CREDENTIALS'))

    const onUnauthorized = vi.fn()
    window.addEventListener('forgeos:unauthorized', onUnauthorized)
    try {
      await expect(apiPost('/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
        status: 401,
      })

      expect(onUnauthorized).not.toHaveBeenCalled()
      expect(sessionStorage.getItem('forgeos_access_token')).toBe('tok-kept')
    } finally {
      window.removeEventListener('forgeos:unauthorized', onUnauthorized)
    }
  })

  test('a 401 on /auth/otp/verify does NOT dispatch the event', async () => {
    const onUnauthorized = vi.fn()
    window.addEventListener('forgeos:unauthorized', onUnauthorized)
    try {
      stubFetch(() => errEnvelope('Invalid code', 401, 'INVALID_OTP'))
      await expect(apiPost('/auth/otp/verify', { email: 'a@b.c', code: '000000' })).rejects.toMatchObject({
        status: 401,
      })
      expect(onUnauthorized).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('forgeos:unauthorized', onUnauthorized)
    }
  })
})

describe('apiPost', () => {
  test('sends a POST with a JSON-serialized body and JSON content type', async () => {
    const fetchMock = stubFetch(() => okEnvelope({ ok: true }))

    await apiPost('/daily-logs', { projectId: 'p1', progressPercent: 42 })

    const [, init] = fetchMock.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(getHeader(init, 'content-type')).toBe('application/json')
    expect(await requestBody(init)).toEqual({ projectId: 'p1', progressPercent: 42 })
  })
})
