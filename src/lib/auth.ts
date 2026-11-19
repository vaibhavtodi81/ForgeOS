import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/db'
import type { Role, SessionUser } from '@/lib/forgeos-types'

export const SESSION_COOKIE = 'forgeos_session'
export const SESSION_TTL_SECONDS = 8 * 60 * 60 // 8 hours

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

/** scrypt hash format: `scrypt:<salt>:<hash>` */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.startsWith('scrypt:')) return false
  const parts = stored.split(':')
  if (parts.length !== 3) return false
  const [, salt, hash] = parts
  try {
    const test = scryptSync(password, salt, 64)
    const ref = Buffer.from(hash, 'hex')
    return test.length === ref.length && timingSafeEqual(test, ref)
  } catch {
    return false
  }
}

export async function signSession(user: SessionUser): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getJwtSecret())
  return { token, expiresAt }
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (!payload.sub || typeof payload.role !== 'string') return null
    return {
      id: payload.sub,
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      role: payload.role as Role,
    }
  } catch {
    return null
  }
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

/**
 * Reads the session from the httpOnly cookie or an Authorization: Bearer
 * header, then REVALIDATES it against the database on every request:
 *
 *   - the user must still exist and be active (deactivation takes effect
 *     immediately, not at token expiry), and
 *   - the CURRENT database role is authoritative (a role change or demotion
 *     is reflected on the very next request, so a stale elevated role claim
 *     in an old token grants nothing).
 *
 * The JWT's role claim is display-only; authorization always uses the DB role.
 */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const bearer = req.headers.get('authorization')
  const token = bearer?.startsWith('Bearer ')
    ? bearer.slice(7)
    : readCookie(req, SESSION_COOKIE)
  if (!token) return null
  const claims = await verifySessionToken(token)
  if (!claims) return null
  const user = await db.user.findUnique({
    where: { id: claims.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
  if (!user || !user.isActive) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role }
}

export function sessionCookieOptions(maxAgeSeconds: number = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
    secure: process.env.NODE_ENV === 'production',
  }
}
