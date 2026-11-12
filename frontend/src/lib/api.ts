import { clearAccessToken, getAccessToken } from '../features/authentication/auth/session'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '')

interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  meta?: Record<string, unknown>
  error?: { code?: string; message?: string }
}

export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Unable to reach the ForgeOS server. Check your connection and try again.', 0, 'NETWORK_ERROR')
  }

  let body: Partial<ApiEnvelope<T>>
  try {
    body = await response.json() as Partial<ApiEnvelope<T>>
  } catch {
    body = {}
  }

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      clearAccessToken()
      window.dispatchEvent(new Event('forgeos:unauthorized'))
    }
    throw new ApiError(
      body.error?.message ?? body.message ?? `Request failed with status ${response.status}.`,
      response.status,
      body.error?.code,
    )
  }

  if (body.success !== true || !('data' in body)) {
    throw new ApiError('The server returned an unexpected response.', response.status, 'INVALID_RESPONSE')
  }

  return body as ApiEnvelope<T>
}

export function apiGet<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  return apiRequest<T>(path, options)
}

export function apiPost<T>(path: string, data: unknown): Promise<ApiEnvelope<T>> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(data) })
}
