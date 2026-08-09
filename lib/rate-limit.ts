// Minimal in-memory rate limiter for sensitive, low-volume endpoints
// (auth, reports, reviews). Good enough for a single Node.js instance; a
// multi-instance production deployment should swap this for a shared store
// (e.g. Redis/Upstash) behind the same `checkRateLimit` signature.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
