// Thin fetch wrapper for the ForgeOS API (same-origin, cookie session)

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? 'GET',
    headers: opts.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: 'same-origin',
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data && typeof data.error === 'string') message = data.error
    } catch {
      // keep default message
    }
    throw new ApiError(message, res.status)
  }
  return (await res.json()) as T
}

/** Appends query params, skipping empty/undefined values. */
export function withParams(path: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(path, 'http://local')
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && !(typeof value === 'string' && value === 'all')) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.pathname + (url.search ? url.search : '')
}
