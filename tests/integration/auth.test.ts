import { describe, test, expect, afterAll } from 'vitest'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as changePasswordPOST } from '@/app/api/auth/change-password/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { POST as usersPOST } from '@/app/api/users/route'
import { PATCH as usersIdPATCH } from '@/app/api/users/[id]/route'
import { db } from '@/lib/db'
import {
  req,
  auth,
  loginAs,
  okBody,
  errBody,
  randIp,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  ROHIT_EMAIL,
  DEMO_PASSWORD,
} from '../helpers'

const cpEmail = `t8cp-${RUN_TAG}@forgeos.local`
const cpOldPassword = 'Password-123'
const cpNewPassword = 'NewPassword-456'

const login = (email: string, password: string, ip = randIp()) =>
  loginPOST(req('/api/auth/login', { body: { email, password }, headers: { 'x-forwarded-for': ip } }))

afterAll(async () => {
  await db.user.deleteMany({ where: { email: { startsWith: `t8cp-${RUN_TAG}` } } })
})

describe('POST /api/auth/login', () => {
  test('admin login returns envelope + token + user with role ADMIN', async () => {
    const res = await login(ADMIN_EMAIL, DEMO_PASSWORD)
    const body = await okBody<{
      token: string
      expiresAt: string
      user: { id: string; email: string; role: string; isActive: boolean; phone: string | null }
    }>(res)
    expect(body.message).toBe('OK')
    expect(body.meta).toBeNull()
    expect(typeof body.data.token).toBe('string')
    expect(body.data.token.split('.')).toHaveLength(3)
    expect(new Date(body.data.expiresAt).getTime()).toBeGreaterThan(Date.now())
    expect(body.data.user).toMatchObject({ email: ADMIN_EMAIL, role: 'ADMIN', isActive: true })
    expect(body.data.user.id).toBeTruthy()
    expect((body.data.user as { passwordHash?: string }).passwordHash).toBeUndefined()
    expect(res.headers.get('set-cookie')).toContain('forgeos_session=')
  })

  test('PM login returns role PM', async () => {
    const body = await okBody<{ user: { role: string } }>(await login(RIYA_EMAIL, DEMO_PASSWORD))
    expect(body.data.user.role).toBe('PM')
  })

  test('wrong password → 401 + LOGIN_FAILED audit row', async () => {
    const res = await login(ADMIN_EMAIL, 'totally-wrong')
    const body = await errBody(res, 401)
    expect(body.message).toBe('Invalid email or password')
    const audit = await db.auditLog.findFirst({
      where: { action: 'LOGIN_FAILED', actorName: ADMIN_EMAIL },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('inactive user → 403', async () => {
    const body = await errBody(await login(ROHIT_EMAIL, DEMO_PASSWORD), 403)
    expect(body.message).toContain('deactivated')
  })

  test('missing fields / malformed body → 400', async () => {
    await errBody(await loginPOST(req('/api/auth/login', { body: { email: ADMIN_EMAIL }, headers: { 'x-forwarded-for': randIp() } })), 400)
    await errBody(await loginPOST(req('/api/auth/login', { body: { email: '', password: '' }, headers: { 'x-forwarded-for': randIp() } })), 400)
    await errBody(await loginPOST(req('/api/auth/login', { body: 'not-json', method: 'POST', headers: { 'x-forwarded-for': randIp() } })), 400)
  })

  test('rate limit: 11th attempt from the same IP is 429 even with valid credentials', async () => {
    const ip = randIp()
    for (let i = 0; i < 10; i++) {
      const res = await login(ADMIN_EMAIL, 'nope', ip)
      expect(res.status).toBe(401)
    }
    const blocked = await login(ADMIN_EMAIL, DEMO_PASSWORD, ip)
    const body = await errBody(blocked, 429)
    expect(body.message).toContain('Too many login attempts')
    // a different IP is unaffected
    expect((await login(ADMIN_EMAIL, DEMO_PASSWORD)).status).toBe(200)
  })
})

describe('GET /api/auth/me', () => {
  test('returns the full user row for a Bearer token', async () => {
    const token = await loginAs(RIYA_EMAIL)
    const res = await meGET(auth('/api/auth/me', token))
    const body = await okBody<{
      id: string
      email: string
      role: string
      phone: string | null
      isActive: boolean
      createdAt: string
      updatedAt: string
    }>(res)
    expect(body.data).toMatchObject({ email: RIYA_EMAIL, role: 'PM', isActive: true })
    expect(typeof body.data.createdAt).toBe('string')
    expect(typeof body.data.updatedAt).toBe('string')
    expect(body.data.phone).not.toBeUndefined()
    expect((body.data as { passwordHash?: string }).passwordHash).toBeUndefined()
  })

  test('no token → 401', async () => {
    await errBody(await meGET(req('/api/auth/me')), 401)
  })
})

describe('POST /api/auth/change-password', () => {
  test('wrong current password → 401', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const invite = await usersPOST(
      auth('/api/users', adminToken, { body: { name: 'T8 ChangePass', email: cpEmail, password: cpOldPassword, role: 'PM' } })
    )
    expect(invite.status).toBe(200)

    const token = await loginAs(cpEmail, cpOldPassword)
    const res = await changePasswordPOST(
      auth('/api/auth/change-password', token, { body: { currentPassword: 'wrong-current', newPassword: cpNewPassword } })
    )
    const body = await errBody(res, 401)
    expect(body.message).toBe('Current password is incorrect')
  })

  test('new password too short → 400', async () => {
    const token = await loginAs(cpEmail, cpOldPassword)
    await errBody(
      await changePasswordPOST(
        auth('/api/auth/change-password', token, { body: { currentPassword: cpOldPassword, newPassword: 'short' } })
      ),
      400
    )
  })

  test('successful change → 200, old password stops working, new one works, then revert', async () => {
    const token = await loginAs(cpEmail, cpOldPassword)
    const res = await changePasswordPOST(
      auth('/api/auth/change-password', token, { body: { currentPassword: cpOldPassword, newPassword: cpNewPassword } })
    )
    const body = await okBody<{ ok: boolean }>(res)
    expect(body.data.ok).toBe(true)

    await errBody(await login(cpEmail, cpOldPassword), 401)
    expect((await login(cpEmail, cpNewPassword)).status).toBe(200)

    // revert so re-runs / cleanup stay consistent
    const token2 = await loginAs(cpEmail, cpNewPassword)
    await okBody(
      await changePasswordPOST(
        auth('/api/auth/change-password', token2, { body: { currentPassword: cpNewPassword, newPassword: cpOldPassword } })
      )
    )
    const row = await db.user.findUnique({ where: { email: cpEmail } })
    const audit = await db.auditLog.findFirst({
      where: { action: 'PASSWORD_CHANGE', entityId: row!.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })
})

describe('POST /api/auth/logout', () => {
  test('returns ok, clears the session cookie and writes a LOGOUT audit row', async () => {
    const token = await loginAs(ADMIN_EMAIL)
    const res = await logoutPOST(auth('/api/auth/logout', token, { method: 'POST' }))
    await okBody(res)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('forgeos_session=')
    expect(setCookie).toContain('Max-Age=0')
    const audit = await db.auditLog.findFirst({ where: { action: 'LOGOUT' }, orderBy: { createdAt: 'desc' } })
    expect(audit).toBeTruthy()
  })

  test('requires authentication', async () => {
    await errBody(await logoutPOST(req('/api/auth/logout', { method: 'POST' })), 401)
  })
})

// ---------------------------------------------------------------------------
// Session revalidation — stale-token hardening. getSessionUser revalidates
// every session against the database, so deactivation and role changes take
// effect on the very next request instead of at token expiry (8h).
// ---------------------------------------------------------------------------
describe('session revalidation (stale-token hardening)', () => {
  const stEmail = `t8st-${RUN_TAG}@forgeos.local`
  const stPassword = 'Password-123'
  let userId = ''

  afterAll(async () => {
    await db.user.deleteMany({ where: { email: stEmail } })
  })

  test('deactivating a user kills their existing token immediately', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)

    // Invite a throwaway PM and sign in.
    await okBody(
      await usersPOST(
        auth('/api/users', adminToken, { body: { name: 'Stale Token', email: stEmail, password: stPassword, role: 'PM' } })
      )
    )
    const row = await db.user.findUniqueOrThrow({ where: { email: stEmail } })
    userId = row.id

    const pmToken = (await okBody<{ token: string }>(
      await login(stEmail, stPassword)
    )).data.token
    await okBody(await meGET(auth('/api/auth/me', pmToken))) // works while active

    // Admin deactivates the user; the PM's still-valid JWT must stop working.
    await okBody(
      await usersIdPATCH(auth(`/api/users/${userId}`, adminToken, { method: 'PATCH', body: { isActive: false } }), {
        params: Promise.resolve({ id: userId }),
      })
    )
    await errBody(await meGET(auth('/api/auth/me', pmToken)), 401)
  })

  test('a role change is reflected on the next request using the OLD token', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)

    // Reactivate and sign back in as PM.
    await okBody(
      await usersIdPATCH(auth(`/api/users/${userId}`, adminToken, { method: 'PATCH', body: { isActive: true } }), {
        params: Promise.resolve({ id: userId }),
      })
    )
    const oldToken = (await okBody<{ token: string }>(
      await login(stEmail, stPassword)
    )).data.token
    const asPm = await okBody<{ role: string }>(await meGET(auth('/api/auth/me', oldToken)))
    expect(asPm.data.role).toBe('PM')

    // Promote PM -> ADMIN. The existing token was signed with role PM, but
    // authorization must now see ADMIN because the DB row is authoritative.
    await okBody(
      await usersIdPATCH(auth(`/api/users/${userId}`, adminToken, { method: 'PATCH', body: { role: 'ADMIN' } }), {
        params: Promise.resolve({ id: userId }),
      })
    )
    const after = await okBody<{ role: string }>(await meGET(auth('/api/auth/me', oldToken)))
    expect(after.data.role).toBe('ADMIN')
  })
})
