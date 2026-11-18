import { describe, test, expect } from 'vitest'
import { SignJWT } from 'jose'
import {
  hashPassword,
  verifyPassword,
  signSession,
  verifySessionToken,
  getSessionUser,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from '@/lib/auth'
import type { SessionUser } from '@/lib/forgeos-types'

const user: SessionUser = { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'PM' }

describe('hashPassword / verifyPassword', () => {
  test('roundtrip: scrypt format and verification', () => {
    const hash = hashPassword('S3cret-Pass!')
    expect(hash.startsWith('scrypt:')).toBe(true)
    expect(hash.split(':')).toHaveLength(3)
    expect(verifyPassword('S3cret-Pass!', hash)).toBe(true)
  })

  test('wrong password rejected', () => {
    const hash = hashPassword('S3cret-Pass!')
    expect(verifyPassword('S3cret-Pass', hash)).toBe(false)
    expect(verifyPassword('', hash)).toBe(false)
  })

  test('salts are random — same password yields different hashes', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'))
  })

  test('malformed stored hashes return false', () => {
    expect(verifyPassword('x', '')).toBe(false)
    expect(verifyPassword('x', 'plaintext-no-format')).toBe(false)
    expect(verifyPassword('x', 'bcrypt:$1$abc')).toBe(false)
    expect(verifyPassword('x', 'scrypt:onlytwo')).toBe(false)
    expect(verifyPassword('x', 'scrypt::deadbeef')).toBe(false) // empty salt, short hash
    expect(verifyPassword('x', 'scrypt:abcd:zz-not-hex')).toBe(false) // non-hex hash
  })
})

describe('signSession / verifySessionToken', () => {
  test('roundtrip returns the session user', async () => {
    const { token, expiresAt } = await signSession(user)
    expect(token.split('.')).toHaveLength(3) // JWT shape
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now() + (SESSION_TTL_SECONDS - 60) * 1000)
    const session = await verifySessionToken(token)
    expect(session).toEqual(user)
  })

  test('tampered payload invalidates the signature', async () => {
    const { token } = await signSession(user)
    const [header, payload, signature] = token.split('.')
    expect(await verifySessionToken(`${header}.${payload}x.${signature}`)).toBeNull()
    expect(await verifySessionToken(`${header}x.${payload}.${signature}`)).toBeNull()
  })

  test('expired token is rejected', async () => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const expired = await new SignJWT({ email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret)
    expect(await verifySessionToken(expired)).toBeNull()
  })

  test('token signed with a different secret is rejected', async () => {
    const other = new TextEncoder().encode('a'.repeat(64))
    const forged = await new SignJWT({ email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(other)
    expect(await verifySessionToken(forged)).toBeNull()
  })

  test('garbage tokens are rejected', async () => {
    expect(await verifySessionToken('not.a.token')).toBeNull()
    expect(await verifySessionToken('')).toBeNull()
  })
})

describe('getSessionUser (cookie + bearer parsing)', () => {
  test('reads the token from the Authorization: Bearer header', async () => {
    const { token } = await signSession(user)
    const session = await getSessionUser(
      new Request('http://localhost/', { headers: { authorization: `Bearer ${token}` } })
    )
    expect(session?.id).toBe('user-1')
    expect(session?.role).toBe('PM')
  })

  test('reads the token from the session cookie when no bearer is present', async () => {
    const { token } = await signSession(user)
    const session = await getSessionUser(
      new Request('http://localhost/', {
        headers: { cookie: `other=1; ${SESSION_COOKIE}=${token}; more=2` },
      })
    )
    expect(session?.email).toBe('test@example.com')
  })

  test('no credentials yields null', async () => {
    expect(await getSessionUser(new Request('http://localhost/'))).toBeNull()
  })

  test('invalid bearer / cookie values yield null', async () => {
    expect(
      await getSessionUser(new Request('http://localhost/', { headers: { authorization: 'Bearer garbage' } }))
    ).toBeNull()
    expect(
      await getSessionUser(new Request('http://localhost/', { headers: { cookie: `${SESSION_COOKIE}=nope` } }))
    ).toBeNull()
  })
})
