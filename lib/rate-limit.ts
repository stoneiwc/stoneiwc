import 'server-only'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Per-IP rate limits for the public API routes, stored in Upstash Redis so
// they hold across every serverless instance (an in-memory counter resets on
// each cold start and isn't shared between instances).
//
// Without Upstash credentials (local dev) limiting is off. If Redis errors,
// requests are allowed: a storefront shouldn't stop taking orders because
// the limiter is down.

type Window = Parameters<typeof Ratelimit.slidingWindow>[1]

const LIMITS = {
  contact: { requests: 3, window: '1 h' },
  giftCardLookup: { requests: 10, window: '10 m' },
  couponLookup: { requests: 20, window: '10 m' },
  checkout: { requests: 30, window: '1 h' },
  giftCardPurchase: { requests: 10, window: '1 h' },
} satisfies Record<string, { requests: number; window: Window }>

export type RateLimitName = keyof typeof LIMITS

let redis: Redis | null | undefined
const limiters = new Map<RateLimitName, Ratelimit>()

function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  // The Vercel Marketplace integration names these KV_REST_API_*.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  if (!redis) {
    console.warn('Rate limiting is off: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set.')
  }
  return redis
}

function getLimiter(name: RateLimitName, store: Redis): Ratelimit {
  let limiter = limiters.get(name)
  if (!limiter) {
    const { requests, window } = LIMITS[name]
    limiter = new Ratelimit({
      redis: store,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `ratelimit:${name}`,
    })
    limiters.set(name, limiter)
  }
  return limiter
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Returns a 429 response to send back when the caller is over the limit for
// `name`, or null to carry on:
//
//   const limited = await rateLimit('contact', req)
//   if (limited) return limited
export async function rateLimit(
  name: RateLimitName,
  req: Request,
  message = 'Too many requests. Please try again later.',
): Promise<NextResponse | null> {
  const store = getRedis()
  if (!store) return null

  try {
    const { success, reset } = await getLimiter(name, store).limit(getClientIp(req))
    if (success) return null
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: message },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  } catch (err) {
    console.error(`Rate limit check failed for ${name}; allowing the request`, err)
    return null
  }
}
