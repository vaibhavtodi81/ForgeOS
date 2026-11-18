import { describe, test, expect } from 'vitest'
import { POST as otpRequestPOST } from '@/app/api/auth/otp/request/route'
import { POST as otpVerifyPOST } from '@/app/api/auth/otp/verify/route'
import { db } from '@/lib/db'
import { req, okBody, errBody, randIp, RIYA_EMAIL, VINAYAK_EMAIL, AISHA_EMAIL, ROHIT_EMAIL } from '../helpers'

const request = (email: string) =>
  otpRequestPOST(req('/api/auth/otp/request', { body: { email }, headers: { 'x-forwarded-for': randIp() } }))
const verify = (email: string, code: string) =>
  otpVerifyPOST(req('/api/auth/otp/verify', { body: { email, code }, headers: { 'x-forwarded-for': randIp() } }))

let aishaDevCode = ''

describe('POST /api/auth/otp/request', () => {
  test('returns devCode (SMTP unconfigured) and creates an OtpCode row', async () => {
    const res = await request(RIYA_EMAIL)
    const body = await okBody<{ ok: boolean; delivered: boolean; expiresInSeconds: number; devCode?: string }>(res)
    expect(body.data.ok).toBe(true)
    expect(body.data.delivered).toBe(false)
    expect(body.data.expiresInSeconds).toBe(600)
    expect(body.data.devCode).toMatch(/^\d{6}$/)

    const row = await db.otpCode.findFirst({
      where: { email: RIYA_EMAIL, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    expect(row).toBeTruthy()
    expect(row!.purpose).toBe('LOGIN')
    expect(row!.expiresAt.getTime()).toBeGreaterThan(Date.now())
    // the code is stored hashed, never in plain text
    expect(row!.codeHash.startsWith('scrypt:')).toBe(true)
    expect(row!.codeHash).not.toContain(body.data.devCode!)

    const audit = await db.auditLog.findFirst({
      where: { action: 'OTP_REQUEST', actorName: RIYA_EMAIL },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('invalid email → 400; unknown/inactive email → same OK shape (no enumeration, no code)', async () => {
    await errBody(await request('not-an-email'), 400)
    for (const email of [`nobody-${Date.now()}@forgeos.local`, ROHIT_EMAIL]) {
      const res = await request(email)
      expect(res.status).toBe(200)
      const body = (await res.json()) as { success: boolean; data: { delivered: boolean; devCode?: string } }
      expect(body.success).toBe(true)
      expect(body.data.delivered).toBe(false)
      expect(body.data.devCode).toBeUndefined()
    }
  })

  test('immediate re-request for the same email → 429 cooldown', async () => {
    const res = await request(RIYA_EMAIL)
    const body = await errBody(res, 429)
    expect(body.message).toContain('wait a minute')
  })

  test('requesting a new code consumes previous unconsumed codes for that email', async () => {
    // simulate a stale code left over from an earlier session
    const stale = await db.otpCode.create({
      data: {
        email: AISHA_EMAIL,
        codeHash: 'scrypt:stale:stale',
        purpose: 'LOGIN',
        expiresAt: new Date(Date.now() + 60_000),
      },
    })
    const res = await request(AISHA_EMAIL)
    const body = await okBody<{ devCode?: string }>(res)
    aishaDevCode = body.data.devCode!
    expect(aishaDevCode).toMatch(/^\d{6}$/)

    const refreshed = await db.otpCode.findUnique({ where: { id: stale.id } })
    expect(refreshed?.consumedAt).not.toBeNull()
    const open = await db.otpCode.count({ where: { email: AISHA_EMAIL, consumedAt: null } })
    expect(open).toBe(1)
  })
})

describe('POST /api/auth/otp/verify', () => {
  test('wrong code ×5 → 400s; 6th attempt → 429 and the code is consumed; correct code after that → 400', async () => {
    const res = await request(VINAYAK_EMAIL)
    const body = await okBody<{ devCode?: string }>(res)
    const devCode = body.data.devCode!
    const wrongCode = devCode === '123456' ? '654321' : '123456'

    for (let i = 0; i < 5; i++) {
      const wrong = await verify(VINAYAK_EMAIL, wrongCode)
      const err = await errBody(wrong, 400)
      expect(err.message).toBe('Incorrect code')
    }
    const locked = await verify(VINAYAK_EMAIL, wrongCode)
    await errBody(locked, 429)

    const row = await db.otpCode.findFirst({
      where: { email: VINAYAK_EMAIL },
      orderBy: { createdAt: 'desc' },
    })
    expect(row).toBeTruthy()
    expect(row!.consumedAt).not.toBeNull()
    expect(row!.attempts).toBeGreaterThanOrEqual(5)

    // even the correct code no longer works once consumed
    await errBody(await verify(VINAYAK_EMAIL, devCode), 400)
  })

  test('correct code → 200 with token + user + OTP_LOGIN audit row', async () => {
    const res = await verify(AISHA_EMAIL, aishaDevCode)
    const body = await okBody<{
      token: string
      expiresAt: string
      user: { email: string; role: string; isActive: boolean }
    }>(res)
    expect(body.data.token.split('.')).toHaveLength(3)
    expect(body.data.user).toMatchObject({ email: AISHA_EMAIL, role: 'VIEWER', isActive: true })
    expect(res.headers.get('set-cookie')).toContain('forgeos_session=')

    const row = await db.otpCode.findFirst({
      where: { email: AISHA_EMAIL },
      orderBy: { createdAt: 'desc' },
    })
    expect(row!.consumedAt).not.toBeNull()

    const audit = await db.auditLog.findFirst({
      where: { action: 'OTP_LOGIN', actorName: 'Aisha Rao' },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('missing fields → 400; verify without any prior request → 400', async () => {
    await errBody(await otpVerifyPOST(req('/api/auth/otp/verify', { body: { email: AISHA_EMAIL } })), 400)
    await errBody(await otpVerifyPOST(req('/api/auth/otp/verify', { body: { code: '123456' } })), 400)
    await errBody(await verify(`fresh-${Date.now()}@forgeos.local`, '123456'), 400)
  })
})
