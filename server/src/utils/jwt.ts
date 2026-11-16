import { createHmac, timingSafeEqual } from 'node:crypto' // Imports { createHmac, timingSafeEqual } from 'node:crypto' so this module can reuse that functionality.
import type { Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { env } from '../config/env.js' // Uses validated environment settings so invalid configuration is caught at startup.

type JwtPayload = { // Defines the `JwtPayload` type so TypeScript can describe the data or behavior used here.
  sub: string // Sets `sub` to the sub value.
  role: Role // Sets `role` to the account's permission level.
  iat: number // Sets `iat` to the iat value.
  exp: number // Sets `exp` to the exp value.
} // Closes the current block and marks where its grouped work ends.

function encode(value: unknown): string { // Defines `encode` to encode, keeping this behavior reusable.
  return Buffer.from(JSON.stringify(value)).toString('base64url') // Returns `Buffer.from(JSON.stringify(value)).toString('base64url')` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function sign(input: string): string { // Defines `sign` to sign, keeping this behavior reusable.
  return createHmac('sha256', env.JWT_SECRET).update(input).digest('base64url') // Returns `createHmac('sha256', env.JWT_SECRET).update(input).digest('base64url')` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function expirySeconds(value: string): number { // Defines `expirySeconds` to expiry seconds, keeping this behavior reusable.
  const match = /^(\d+)([smhd])$/.exec(value) // Stores this intermediate `match` value so later lines can use it.
  if (!match) throw new Error('JWT_EXPIRES_IN must use a duration such as 15m or 1h') // Checks whether the value is missing; the block handles that case before continuing.
  const units = { s: 1, m: 60, h: 3600, d: 86400 } as const // Stores this intermediate `units` value so later lines can use it.
  return Number(match[1]) * units[match[2] as keyof typeof units] // Returns `Number(match[1]) * units[match[2] as keyof typeof units]` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export function createAccessToken(user: { id: number; role: Role }): string { // Defines `createAccessToken` to create access token, keeping this behavior reusable.
  const now = Math.floor(Date.now() / 1000) // Stores this intermediate `now` value so later lines can use it.
  const payload: JwtPayload = { // Stores this intermediate `jwt payload` value so later lines can use it.
    sub: String(user.id), // Separates this argument or property from the next item in the surrounding call or object.
    role: user.role, // Separates this argument or property from the next item in the surrounding call or object.
    iat: now, // Separates this argument or property from the next item in the surrounding call or object.
    exp: now + expirySeconds(env.JWT_EXPIRES_IN), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const header = encode({ alg: 'HS256', typ: 'JWT' }) // Stores this intermediate `header` value so later lines can use it.
  const body = encode(payload) // Stores this intermediate `body` value so later lines can use it.
  return `${header}.${body}.${sign(`${header}.${body}`)}` // Returns ``${header}.${body}.${sign(`${header}.${body}`)}`` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export function verifyAccessToken(token: string): JwtPayload { // Defines `verifyAccessToken` to verify access token, keeping this behavior reusable.
  const parts = token.split('.') // Stores this intermediate `parts` value so later lines can use it.
  if (parts.length !== 3) throw new Error('Invalid token') // Checks whether the collection contains any items that need special handling.
  const [header, body, signature] = parts // Stores this intermediate `signature` value so later lines can use it.
  const expected = Buffer.from(sign(`${header}.${body}`)) // Stores this intermediate `expected` value so later lines can use it.
  const actual = Buffer.from(signature) // Stores this intermediate `actual` value so later lines can use it.
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('Invalid token') // Checks whether the collection contains any items that need special handling.

  let payload: JwtPayload // Stores this intermediate `jwt payload` value so later lines can use it.
  try { // Starts a protected block so errors from the following operation can be handled.
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload // Provides `payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload` as part of verify access token.
  } catch { // Opens the object or callback body that groups the settings for this operation.
    throw new Error('Invalid token') // Stops this operation with the error `Invalid token`, so the API reports the failure clearly.
  } // Closes the current block and marks where its grouped work ends.
  if (payload.sub === undefined || !Number.isInteger(Number(payload.sub)) || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) { // Checks whether the value is missing; the block handles that case before continuing.
    throw new Error('Expired or invalid token') // Stops this operation with the error `Expired or invalid token`, so the API reports the failure clearly.
  } // Closes the current block and marks where its grouped work ends.
  if (payload.role !== 'ADMIN' && payload.role !== 'PM') throw new Error('Invalid token') // Checks the caller's role before allowing this role-restricted operation.
  return payload // Returns `payload` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Signs and verifies the access tokens used by API authentication.
