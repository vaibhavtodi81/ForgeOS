import { NextResponse } from 'next/server'
import type { PageMeta, Role, SessionUser } from '@/lib/forgeos-types'
import { getSessionUser } from '@/lib/auth'

/** Success envelope: { success: true, message: 'OK', data, meta } */
export function ok<T>(data: T, meta?: unknown): NextResponse {
  return NextResponse.json({ success: true, message: 'OK', data, meta: meta ?? null })
}

/** Error envelope: { success: false, message, error: { code, message } } */
export function fail(message: string, status = 400, code = 'ERROR'): NextResponse {
  return NextResponse.json(
    { success: false, message, error: { code, message } },
    { status }
  )
}

/** Pagination meta superset — old UI pages read different keys on different endpoints. */
export function pageMeta(page: number, limit: number, total: number): PageMeta {
  return {
    page,
    pageSize: limit,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

type GuardResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse }

/**
 * Authenticates the request and optionally enforces roles.
 * ADMIN always passes; VIEWER never passes write guards; when `roles` is
 * omitted any authenticated user (incl. VIEWER) may read.
 */
export async function guardAuth(req: Request, roles?: Role[]): Promise<GuardResult> {
  const user = await getSessionUser(req)
  if (!user) {
    return { ok: false, response: fail('Not authenticated', 401, 'UNAUTHORIZED') }
  }
  if (roles && roles.length > 0 && user.role !== 'ADMIN' && !roles.includes(user.role)) {
    return { ok: false, response: fail('You do not have permission to perform this action', 403, 'FORBIDDEN') }
  }
  return { ok: true, user }
}

/** True when the acting user may access the given project (PMs are limited to their own). */
export function pmOwns(user: SessionUser, pmId: string | null): boolean {
  if (user.role !== 'PM') return true
  return pmId === user.id
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Reads `page` plus `limit` (or `pageSize`) capped at 100. */
export function parsePagination(url: URL, defaultLimit = 20) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const rawLimit = url.searchParams.get('limit') ?? url.searchParams.get('pageSize') ?? String(defaultLimit)
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit, 10) || defaultLimit))
  return { page, limit, offset: (page - 1) * limit }
}

/** Safely parses a JSON body; returns null on malformed input. */
export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T
  } catch {
    return null
  }
}

/** Parses a date-ish string ('2026-02-12' or ISO) into a Date, or null. */
export function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/** Parses a 'YYYY-MM-DD' string into a UTC-midnight Date, or null. */
export function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null
  return new Date(`${value.trim()}T00:00:00.000Z`)
}

/** Coerces an unknown value to a finite number (or NaN). */
export function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

/** Optional string: trimmed non-empty string or null. */
export function optString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}
