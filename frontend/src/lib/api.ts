// Imports clearAccessToken, getAccessToken from ../features/authentication/auth/session so this module can reuse that component, helper, or library.
import { clearAccessToken, getAccessToken } from '../features/authentication/auth/session'

// Stores the value in API_BASE_URL so later lines can reuse this data or behavior for the current feature.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '')

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ApiEnvelope<T> {
  // Sets the success field so the surrounding object or component receives this setting.
  success: boolean
  // Continues the component or data expression so its related values and behavior stay grouped together.
  message?: string
  // Sets the data field so the surrounding object or component receives this setting.
  data: T
  // Continues the component or data expression so its related values and behavior stay grouped together.
  meta?: Record<string, unknown>
  // Continues the component or data expression so its related values and behavior stay grouped together.
  error?: { code?: string; message?: string }
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export class ApiError extends Error {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  public readonly status: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  public readonly code?: string

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  constructor(message: string, status: number, code?: string) {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    super(message)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    this.name = 'ApiError'
    // Continues the component or data expression so its related values and behavior stay grouped together.
    this.status = status
    // Continues the component or data expression so its related values and behavior stay grouped together.
    this.code = code
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines apiRequest so this module can perform its named task when needed.
export async function apiRequest<T>(
  // Sets the path field so the surrounding object or component receives this setting.
  path: string,
  // Sets the options field so the surrounding object or component receives this setting.
  options: RequestInit = {},
// Continues the component or data expression so its related values and behavior stay grouped together.
): Promise<ApiEnvelope<T>> {
  // Stores the value in headers so later lines can reuse this data or behavior for the current feature.
  const headers = new Headers(options.headers)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  headers.set('Accept', 'application/json')
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  // Stores the value in token so later lines can reuse this data or behavior for the current feature.
  const token = getAccessToken()
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (token) headers.set('Authorization', `Bearer ${token}`)

  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  let response: Response
  // Starts an error-handling region so failures can be caught and handled safely.
  try {
    // Waits for the asynchronous result before using it, so later work receives completed data.
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      // Continues the component or data expression so its related values and behavior stay grouped together.
      ...options,
      // Continues the component or data expression so its related values and behavior stay grouped together.
      headers,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
  // Continues the component or data expression so its related values and behavior stay grouped together.
  } catch {
    // Stops the current operation with an error so the calling code can handle the failure.
    throw new ApiError('Unable to reach the ForgeOS server. Check your connection and try again.', 0, 'NETWORK_ERROR')
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in body so later lines can reuse this data or behavior for the current feature.
  let body: Partial<ApiEnvelope<T>>
  // Starts an error-handling region so failures can be caught and handled safely.
  try {
    // Waits for the asynchronous result before using it, so later work receives completed data.
    body = await response.json() as Partial<ApiEnvelope<T>>
  // Continues the component or data expression so its related values and behavior stay grouped together.
  } catch {
    // Continues the component or data expression so its related values and behavior stay grouped together.
    body = {}
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!response.ok) {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (response.status === 401 && path !== '/auth/login') {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      clearAccessToken()
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      window.dispatchEvent(new Event('forgeos:unauthorized'))
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Stops the current operation with an error so the calling code can handle the failure.
    throw new ApiError(
      // Continues the component or data expression so its related values and behavior stay grouped together.
      body.error?.message ?? body.message ?? `Request failed with status ${response.status}.`,
      // Continues the component or data expression so its related values and behavior stay grouped together.
      response.status,
      // Continues the component or data expression so its related values and behavior stay grouped together.
      body.error?.code,
    // Closes this function call or grouped expression so the surrounding code can continue.
    )
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (body.success !== true || !('data' in body)) {
    // Stops the current operation with an error so the calling code can handle the failure.
    throw new ApiError('The server returned an unexpected response.', response.status, 'INVALID_RESPONSE')
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return body as ApiEnvelope<T>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines apiGet so this module can perform its named task when needed.
export function apiGet<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return apiRequest<T>(path, options)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines apiPost so this module can perform its named task when needed.
export function apiPost<T>(path: string, data: unknown): Promise<ApiEnvelope<T>> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(data) })
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Sends typed HTTP requests and normalizes authentication and API errors for the frontend.
