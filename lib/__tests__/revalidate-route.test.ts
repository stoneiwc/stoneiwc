import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }))
vi.mock("next/cache", () => ({ revalidateTag }))

import { POST } from "@/app/api/revalidate/route"
import { CONTENT_TYPES } from "@/lib/sanity-tags"

function webhook(body: unknown, secret: string | null = "s3cret") {
  const headers = new Headers({ "content-type": "application/json" })
  if (secret) headers.set("x-webhook-secret", secret)
  return new NextRequest("https://example.com/api/revalidate", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  revalidateTag.mockReset()
  vi.stubEnv("SANITY_WEBHOOK_SECRET", "s3cret")
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("POST /api/revalidate", () => {
  it("refuses every request when the secret isn't configured", async () => {
    vi.stubEnv("SANITY_WEBHOOK_SECRET", "")
    expect((await POST(webhook({ _type: "product" }))).status).toBe(500)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it.each([null, "wrong", "s3cret-but-longer"])("rejects secret %s", async (secret) => {
    expect((await POST(webhook({ _type: "product" }, secret))).status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it.each(CONTENT_TYPES)("revalidates the %s tag", async (type) => {
    const response = await POST(webhook({ _type: type }))
    expect(response.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith(type, "default")
  })

  it("maps the calEvents pseudo-type to the booking pages' tag", async () => {
    await POST(webhook({ _type: "calEvents" }))
    expect(revalidateTag).toHaveBeenCalledWith("cal-events", "default")
  })

  it("acknowledges types nothing caches, without revalidating", async () => {
    const response = await POST(webhook({ _type: "order" }))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ revalidated: false })
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("rejects a body without a string _type", async () => {
    expect((await POST(webhook({ _type: 42 }))).status).toBe(400)
  })
})
