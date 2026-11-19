import { afterEach, describe, expect, it, vi } from "vitest"

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn((config: unknown) => ({ config })) }))
vi.mock("@sanity/client", () => ({ createClient }))

async function load() {
  vi.resetModules()
  createClient.mockClear()
  return import("@/lib/sanity.client")
}

const tokenOf = (client: unknown) => (client as { config: { token?: string } }).config.token
const cdnOf = (client: unknown) => (client as { config: { useCdn?: boolean } }).config.useCdn

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("sanity clients", () => {
  it("reads with the Viewer token and writes with the Editor token", async () => {
    vi.stubEnv("SANITY_READ_TOKEN", "viewer-token")
    vi.stubEnv("SANITY_API_TOKEN", "editor-token")
    const { readClient, writeClient } = await load()
    expect(tokenOf(readClient)).toBe("viewer-token")
    expect(tokenOf(writeClient)).toBe("editor-token")
  })

  it("falls back to the Editor token for reads when no read token is set", async () => {
    vi.stubEnv("SANITY_READ_TOKEN", "")
    vi.stubEnv("SANITY_API_TOKEN", "editor-token")
    const { readClient } = await load()
    expect(tokenOf(readClient)).toBe("editor-token")
  })

  it("never reads through the API CDN", async () => {
    const { readClient, writeClient } = await load()
    expect(cdnOf(readClient)).toBe(false)
    expect(cdnOf(writeClient)).toBe(false)
  })
})
