import { randomInt } from 'crypto'
import { db } from '@/lib/db'
import { ok, fail, getClientIp, readJson } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'
import { rateLimit, cooldown } from '@/lib/rate-limit'
import { writeAudit } from '@/lib/audit'
import { sendOtpEmail } from '@/lib/mailer'
import type { OtpRequestResponse } from '@/lib/forgeos-types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_TTL_MS = 10 * 60 * 1000

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const body = await readJson<{ email?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !EMAIL_RE.test(email)) {
    return fail('A valid email address is required', 400)
  }

  if (!rateLimit(`otp:${email}`, 3, 10 * 60_000).ok) {
    return fail('Too many OTP requests. Please try again later.', 429)
  }
  if (!cooldown(`otpcd:${email}`, 60_000)) {
    return fail('Please wait a minute before requesting another code.', 429)
  }

  const user = await db.user.findFirst({ where: { email, isActive: true } })
  if (!user) return fail('No active account found for this email', 404)

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')

  await db.otpCode.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: new Date() },
  })
  await db.otpCode.create({
    data: {
      email,
      codeHash: hashPassword(code),
      purpose: 'LOGIN',
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  })

  const result = await sendOtpEmail(email, code)

  await writeAudit({
    action: 'OTP_REQUEST',
    actorName: email,
    meta: { email, delivered: result.sent },
    ip,
  })

  const payload: OtpRequestResponse = result.sent
    ? { ok: true, delivered: true, expiresInSeconds: 600 }
    : { ok: true, delivered: false, expiresInSeconds: 600, devCode: code }
  return ok(payload)
}
