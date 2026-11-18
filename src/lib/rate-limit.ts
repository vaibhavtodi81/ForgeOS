const buckets = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory fixed-window rate limiter.
 * Returns ok=false when the limit for the window is exceeded.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSec: 0 }
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { ok: true, retryAfterSec: 0 }
}

/** Convenience: allow at most `limit` uses of `key` per window; commonly used as a cooldown (limit=1). */
export function cooldown(key: string, windowMs: number): boolean {
  return rateLimit(key, 1, windowMs).ok
}

// Periodic cleanup to keep memory bounded
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, 5 * 60 * 1000)
  if (typeof timer === 'object' && 'unref' in timer) timer.unref()
}
