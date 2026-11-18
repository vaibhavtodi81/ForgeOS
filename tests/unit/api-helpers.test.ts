import { describe, test, expect } from 'vitest'
import { SignJWT } from 'jose'
import {
  parsePagination,
  parseDate,
  parseDay,
  num,
  optString,
  pageMeta,
  ok,
  fail,
  guardAuth,
  pmOwns,
  getClientIp,
  readJson,
} from '@/lib/api-helpers'
import { signSession } from '@/lib/auth'
import type { SessionUser } from '@/lib/forgeos-types'

const url = (query: string) => new URL(`http://localhost:3000/api/x?${query}`)

describe('parsePagination', () => {
  test('defaults', () => {
    expect(parsePagination(url(''))).toEqual({ page: 1, limit: 20, offset: 0 })
    expect(parsePagination(url(''), 7)).toEqual({ page: 1, limit: 7, offset: 0 })
  })

  test('reads page and limit', () => {
    expect(parsePagination(url('page=3&limit=10'))).toEqual({ page: 3, limit: 10, offset: 20 })
  })

  test('pageSize is honoured when limit is absent', () => {
    expect(parsePagination(url('pageSize=5'))).toEqual({ page: 1, limit: 5, offset: 0 })
    expect(parsePagination(url('limit=9&pageSize=5')).limit).toBe(9)
  })

  test('clamps: page below 1, limit above 100, zero / NaN / negative limit', () => {
    expect(parsePagination(url('page=0')).page).toBe(1)
    expect(parsePagination(url('page=-4')).page).toBe(1)
    expect(parsePagination(url('page=abc')).page).toBe(1)
    expect(parsePagination(url('limit=500')).limit).toBe(100)
    expect(parsePagination(url('limit=0')).limit).toBe(20) // falls back to default
    expect(parsePagination(url('limit=-3')).limit).toBe(1) // clamped up to 1
    expect(parsePagination(url('limit=nope'), 15).limit).toBe(15)
  })

  test('offset is computed from page and limit', () => {
    expect(parsePagination(url('page=4&limit=25'))).toEqual({ page: 4, limit: 25, offset: 75 })
  })
})

describe('parseDate / parseDay', () => {
  test('parseDate accepts date-only and ISO strings', () => {
    expect(parseDate('2026-02-12')?.toISOString()).toBe('2026-02-12T00:00:00.000Z')
    expect(parseDate('2026-02-12T10:30:00Z')?.getUTCMinutes()).toBe(30)
  })

  test('parseDate rejects invalid, empty and non-string input', () => {
    expect(parseDate('not-a-date')).toBeNull()
    expect(parseDate('')).toBeNull()
    expect(parseDate('   ')).toBeNull()
    expect(parseDate(42)).toBeNull()
    expect(parseDate(null)).toBeNull()
  })

  test('parseDay only accepts strict YYYY-MM-DD and normalises to UTC midnight', () => {
    expect(parseDay('2026-02-12')?.toISOString()).toBe('2026-02-12T00:00:00.000Z')
    expect(parseDay(' 2026-02-12 ')?.toISOString()).toBe('2026-02-12T00:00:00.000Z')
  })

  test('parseDay rejects loose formats', () => {
    expect(parseDay('2026-2-12')).toBeNull()
    expect(parseDay('12/02/2026')).toBeNull()
    expect(parseDay('2026-02-12T10:00:00Z')).toBeNull()
    expect(parseDay('')).toBeNull()
    expect(parseDay(undefined)).toBeNull()
  })
})

describe('num / optString / readJson', () => {
  test('num coerces numbers and numeric strings, NaN otherwise', () => {
    expect(num(3.5)).toBe(3.5)
    expect(num('42')).toBe(42)
    expect(num(' 7 ')).toBe(7)
    expect(Number.isNaN(num(''))).toBe(true)
    expect(Number.isNaN(num('abc'))).toBe(true)
    expect(Number.isNaN(num(null))).toBe(true)
  })

  test('optString trims, maps empty to null, rejects non-strings', () => {
    expect(optString('  hello ')).toBe('hello')
    expect(optString('   ')).toBeNull()
    expect(optString(123)).toBeNull()
    expect(optString(null)).toBeNull()
  })

  test('readJson parses bodies and returns null on malformed JSON', async () => {
    const good = await readJson<{ a: number }>(new Request('http://localhost/', { method: 'POST', body: '{"a":1}' }))
    expect(good).toEqual({ a: 1 })
    const bad = await readJson(new Request('http://localhost/', { method: 'POST', body: 'not-json{{' }))
    expect(bad).toBeNull()
  })
})

describe('envelopes', () => {
  test('ok() wraps payload with success envelope and null meta', async () => {
    const res = ok({ x: 1 })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, message: 'OK', data: { x: 1 }, meta: null })
  })

  test('ok() passes meta through', async () => {
    const res = ok([1, 2], pageMeta(2, 10, 35))
    const body = (await res.json()) as { meta: unknown }
    expect(body.meta).toEqual({ page: 2, pageSize: 10, limit: 10, total: 35, totalPages: 4 })
  })

  test('pageMeta always reports at least one page', () => {
    expect(pageMeta(1, 20, 0)).toEqual({ page: 1, pageSize: 20, limit: 20, total: 0, totalPages: 1 })
  })

  test('fail() carries status + error code', async () => {
    const res = fail('Nope', 422, 'UNPROCESSABLE')
    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({
      success: false,
      message: 'Nope',
      error: { code: 'UNPROCESSABLE', message: 'Nope' },
    })
  })
})

describe('guardAuth', () => {
  const admin: SessionUser = { id: 'a1', name: 'A', email: 'a@x.dev', role: 'ADMIN' }
  const pm: SessionUser = { id: 'p1', name: 'P', email: 'p@x.dev', role: 'PM' }
  const viewer: SessionUser = { id: 'v1', name: 'V', email: 'v@x.dev', role: 'VIEWER' }

  async function as(u: SessionUser): Promise<Request> {
    const { token } = await signSession(u)
    return new Request('http://localhost/', { headers: { authorization: `Bearer ${token}` } })
  }

  test('401 when unauthenticated', async () => {
    const result = await guardAuth(new Request('http://localhost/'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(401)
  })

  test('any authenticated user passes when no roles are required (incl. VIEWER)', async () => {
    expect((await guardAuth(await as(viewer))).ok).toBe(true)
    expect((await guardAuth(await as(pm))).ok).toBe(true)
  })

  test('role list enforced — PM blocked from ADMIN guard, VIEWER blocked from write guards', async () => {
    expect((await guardAuth(await as(pm), ['ADMIN'])).ok).toBe(false)
    expect((await guardAuth(await as(viewer), ['PM'])).ok).toBe(false)
    expect((await guardAuth(await as(pm), ['PM'])).ok).toBe(true)
    expect((await guardAuth(await as(pm), ['ADMIN', 'PM'])).ok).toBe(true)
  })

  test('ADMIN always passes role guards', async () => {
    expect((await guardAuth(await as(admin), ['PM'])).ok).toBe(true)
    expect((await guardAuth(await as(admin), ['ADMIN'])).ok).toBe(true)
  })

  test('403 response for wrong role', async () => {
    const result = await guardAuth(await as(pm), ['ADMIN'])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
      const body = (await result.response.json()) as { error: { code: string } }
      expect(body.error.code).toBe('FORBIDDEN')
    }
  })
})

describe('pmOwns / getClientIp', () => {
  const pm: SessionUser = { id: 'p1', name: 'P', email: 'p@x.dev', role: 'PM' }
  const admin: SessionUser = { id: 'a1', name: 'A', email: 'a@x.dev', role: 'ADMIN' }

  test('pmOwns: admins pass for any project, PMs only for their own', () => {
    expect(pmOwns(admin, 'someone-else')).toBe(true)
    expect(pmOwns(admin, null)).toBe(true)
    expect(pmOwns(pm, 'p1')).toBe(true)
    expect(pmOwns(pm, null)).toBe(false)
    expect(pmOwns(pm, 'other-pm')).toBe(false)
  })

  test('getClientIp prefers x-forwarded-for (first hop), then x-real-ip, else unknown', () => {
    expect(getClientIp(new Request('http://x/', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } }))).toBe('1.1.1.1')
    expect(getClientIp(new Request('http://x/', { headers: { 'x-real-ip': '3.3.3.3' } }))).toBe('3.3.3.3')
    expect(getClientIp(new Request('http://x/'))).toBe('unknown')
  })
})
