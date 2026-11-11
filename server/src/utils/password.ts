import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, expected] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !expected || expected.length % 2 !== 0) return false

  const actual = scryptSync(password, salt, expected.length / 2)
  const expectedBuffer = Buffer.from(expected, 'hex')
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)
}
