import { db } from '@/lib/db'
import { ok, fail, getClientIp, readJson } from '@/lib/api-helpers'
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { writeAudit } from '@/lib/audit'
import type { LoginResponse, Role, SessionUser } from '@/lib/forgeos-types'

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const limited = rateLimit(`login:${ip}`, 10, 60_000)
  if (!limited.ok) {
    return fail('Too many login attempts. Try again in a minute.', 429)
  }

  const body = await readJson<{ email?: unknown; password?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password) return fail('Email and password are required', 400)

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    await writeAudit({ action: 'LOGIN_FAILED', actorName: email, meta: { email }, ip })
    return fail('Invalid email or password', 401)
  }

  if (!user.isActive) {
    return fail('Your account has been deactivated. Contact an administrator.', 403)
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  }
  const { token, expiresAt } = await signSession(sessionUser)

  const res = ok<LoginResponse>({
    token,
    expiresAt: expiresAt.toISOString(),
    user: sessionUser,
  })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())

  await writeAudit({
    action: 'LOGIN',
    actorId: user.id,
    actorName: user.name,
    ip,
    meta: { method: 'password' },
  })
  return res
}
