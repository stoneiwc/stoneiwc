import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { limit } = vi.hoisted(() => ({ limit: vi.fn() }))

vi.mock("@upstash/redis", () => ({ Redis: class {} }))
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit
    },
    { slidingWindow: vi.fn() },
  ),
}))

const request = () => new Request("https://example.com/api/x", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } })

// lib/rate-limit caches its Redis client, so load a fresh copy per test.
async function load() {
  vi.resetModules()
  return import("@/lib/rate-limit")
}

beforeEach(() => {
  limit.mockReset()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("rateLimit", () => {
  it("is off when Upstash isn't configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
    vi.stubEnv("KV_REST_API_URL", "")
    vi.stubEnv("KV_REST_API_TOKEN", "")
    const { rateLimit } = await load()
    expect(await rateLimit("contact", request())).toBeNull()
    expect(limit).not.toHaveBeenCalled()
  })

  describe("with Upstash configured", () => {
    beforeEach(() => {
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com")
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token")
    })

    it("keys the limit on the first forwarded IP and lets allowed requests through", async () => {
      limit.mockResolvedValue({ success: true, reset: Date.now() })
      const { rateLimit } = await load()
      expect(await rateLimit("giftCardLookup", request())).toBeNull()
      expect(limit).toHaveBeenCalledWith("203.0.113.7")
    })

    it("answers 429 with Retry-After when over the limit", async () => {
      limit.mockResolvedValue({ success: false, reset: Date.now() + 90_000 })
      const { rateLimit } = await load()
      const response = await rateLimit("contact", request(), "Slow down.")
      expect(response?.status).toBe(429)
      expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThanOrEqual(89)
      expect(await response?.json()).toEqual({ error: "Slow down." })
    })

    it("allows the request when Redis is unreachable", async () => {
      limit.mockRejectedValue(new Error("ECONNRESET"))
      const { rateLimit } = await load()
      expect(await rateLimit("checkout", request())).toBeNull()
    })
  })
})
