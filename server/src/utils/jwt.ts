import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Role } from '@prisma/client'
import { env } from '../config/env.js'

type JwtPayload = {
  sub: string
  role: Role
  iat: number
  exp: number
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function sign(input: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(input).digest('base64url')
}

function expirySeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value)
  if (!match) throw new Error('JWT_EXPIRES_IN must use a duration such as 15m or 1h')
  const units = { s: 1, m: 60, h: 3600, d: 86400 } as const
  return Number(match[1]) * units[match[2] as keyof typeof units]
}

export function createAccessToken(user: { id: number; role: Role }): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: String(user.id),
    role: user.role,
    iat: now,
    exp: now + expirySeconds(env.JWT_EXPIRES_IN),
  }
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const body = encode(payload)
  return `${header}.${body}.${sign(`${header}.${body}`)}`
}

export function verifyAccessToken(token: string): JwtPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  const [header, body, signature] = parts
  const expected = Buffer.from(sign(`${header}.${body}`))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('Invalid token')

  let payload: JwtPayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload
  } catch {
    throw new Error('Invalid token')
  }
  if (payload.sub === undefined || !Number.isInteger(Number(payload.sub)) || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('Expired or invalid token')
  }
  if (payload.role !== 'ADMIN' && payload.role !== 'PM') throw new Error('Invalid token')
  return payload
}
