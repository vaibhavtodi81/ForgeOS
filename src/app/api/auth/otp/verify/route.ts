import { db } from '@/lib/db'
import { ok, fail, getClientIp, readJson } from '@/lib/api-helpers'
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'
import type { Role, SessionUser } from '@/lib/forgeos-types'

const MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const body = await readJson<{ email?: unknown; code?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  if (!email || !code) return fail('Email and code are required', 400)

  const otp = await db.otpCode.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp) return fail('No code requested. Request a new one.', 400)

  if (otp.expiresAt < new Date()) {
    return fail('Code expired. Request a new one.', 400)
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } })
    return fail('Too many attempts. Request a new code.', 429)
  }

  if (!verifyPassword(code, otp.codeHash)) {
    await db.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })
    return fail('Incorrect code', 400)
  }

  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } })

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    return fail('Account unavailable', 403)
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  }
  const { token, expiresAt } = await signSession(sessionUser)

  const res = ok({
    token,
    expiresAt: expiresAt.toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())

  await writeAudit({
    action: 'OTP_LOGIN',
    actorId: user.id,
    actorName: user.name,
    ip,
  })
  return res
}
