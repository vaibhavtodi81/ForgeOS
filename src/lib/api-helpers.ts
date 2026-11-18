import { NextResponse } from 'next/server'
import type { Role, SessionUser } from '@/lib/forgeos-types'
import { getSessionUser } from '@/lib/auth'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

type GuardResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse }

/**
 * Authenticates the request and optionally enforces roles.
 * ADMIN always passes; other roles must be included in `roles` when provided.
 */
export async function guardAuth(req: Request, roles?: Role[]): Promise<GuardResult> {
  const user = await getSessionUser(req)
  if (!user) {
    return { ok: false, response: fail('Not authenticated', 401) }
  }
  if (roles && roles.length > 0 && user.role !== 'ADMIN' && !roles.includes(user.role)) {
    return { ok: false, response: fail('You do not have permission to perform this action', 403) }
  }
  return { ok: true, user }
}

/** True when the acting user may access the given project (PMs are limited to their own). */
export function pmOwns(user: SessionUser, pmId: string | null): boolean {
  if (user.role !== 'PROJECT_MANAGER') return true
  return pmId === user.id
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export function parsePagination(url: URL, defaultLimit = 20) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(defaultLimit), 10) || defaultLimit))
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
