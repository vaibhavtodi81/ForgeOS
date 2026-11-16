import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto' // Imports { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto' so this module can reuse that functionality.

export function hashPassword(password: string): string { // Defines `hashPassword` to hash password, keeping this behavior reusable.
  const salt = randomBytes(16).toString('hex') // Stores this intermediate `salt` value so later lines can use it.
  const hash = scryptSync(password, salt, 64).toString('hex') // Stores this intermediate `hash` value so later lines can use it.
  return `scrypt$${salt}$${hash}` // Returns ``scrypt$${salt}$${hash}`` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export function verifyPassword(password: string, storedHash: string): boolean { // Defines `verifyPassword` to verify password, keeping this behavior reusable.
  const [algorithm, salt, expected] = storedHash.split('$') // Stores this intermediate `expected` value so later lines can use it.
  if (algorithm !== 'scrypt' || !salt || !expected || expected.length % 2 !== 0) return false // Checks whether the collection contains any items that need special handling.

  const actual = scryptSync(password, salt, expected.length / 2) // Stores this intermediate `actual` value so later lines can use it.
  const expectedBuffer = Buffer.from(expected, 'hex') // Stores this intermediate `expected buffer` value so later lines can use it.
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer) // Returns `actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Hashes passwords and verifies submitted credentials.
