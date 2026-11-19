import { afterEach, describe, expect, it, vi } from "vitest"
import { getEventTypes } from "@/lib/cal-api"

const fetchMock = vi.fn()

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }))
  vi.stubGlobal("fetch", fetchMock)
}

describe("getEventTypes", () => {
  it("returns the event types and caches them under the cal-events tag", async () => {
    respond(200, { data: [{ id: 1, slug: "cupping-fire", title: "Fire Cupping" }] })
    expect(await getEventTypes("stoneiwc")).toEqual([{ id: 1, slug: "cupping-fire", title: "Fire Cupping" }])
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 300, tags: ["cal-events"] } })
  })

  it("throws on an error response instead of returning an empty list", async () => {
    respond(503, { error: "unavailable" })
    await expect(getEventTypes("stoneiwc")).rejects.toThrow("503")
  })

  it("throws on an unexpected response shape", async () => {
    respond(200, { status: "ok" })
    await expect(getEventTypes("stoneiwc")).rejects.toThrow("no data array")
  })
})
