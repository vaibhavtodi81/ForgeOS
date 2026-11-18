import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { rateLimit, cooldown } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('allows up to `limit` hits, then blocks with a retry hint', () => {
    expect(rateLimit('k-a', 3, 60_000)).toEqual({ ok: true, retryAfterSec: 0 })
    expect(rateLimit('k-a', 3, 60_000).ok).toBe(true)
    expect(rateLimit('k-a', 3, 60_000).ok).toBe(true)
    const blocked = rateLimit('k-a', 3, 60_000)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60)
  })

  test('retryAfterSec shrinks as the window elapses', () => {
    rateLimit('k-ttl', 1, 60_000)
    vi.advanceTimersByTime(30_000)
    const blocked = rateLimit('k-ttl', 1, 60_000)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBe(30)
  })

  test('window resets after windowMs', () => {
    expect(rateLimit('k-reset', 2, 1_000).ok).toBe(true)
    expect(rateLimit('k-reset', 2, 1_000).ok).toBe(true)
    expect(rateLimit('k-reset', 2, 1_000).ok).toBe(false)
    vi.advanceTimersByTime(1_000)
    expect(rateLimit('k-reset', 2, 1_000).ok).toBe(true)
  })

  test('keys are independent', () => {
    rateLimit('k-x', 1, 10_000)
    expect(rateLimit('k-x', 1, 10_000).ok).toBe(false)
    expect(rateLimit('k-y', 1, 10_000).ok).toBe(true)
  })
})

describe('cooldown (single-use window)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('fires once per window then blocks until it elapses', () => {
    expect(cooldown('cd-1', 5_000)).toBe(true)
    expect(cooldown('cd-1', 5_000)).toBe(false)
    expect(cooldown('cd-1', 5_000)).toBe(false)
    vi.advanceTimersByTime(5_000)
    expect(cooldown('cd-1', 5_000)).toBe(true)
  })

  test('independent keys do not interfere', () => {
    expect(cooldown('cd-a', 1_000)).toBe(true)
    expect(cooldown('cd-b', 1_000)).toBe(true)
    expect(cooldown('cd-a', 1_000)).toBe(false)
  })
})
