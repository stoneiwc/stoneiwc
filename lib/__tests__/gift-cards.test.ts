import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/sanity.client", () => ({
  writeClient: { fetch: vi.fn(), patch: vi.fn(), create: vi.fn() },
}))

import { writeClient as client } from "@/lib/sanity.client"
import {
  claimGiftCardEmail,
  generateGiftCardCode,
  getOrCreateGiftCardForPayment,
  redeemGiftCard,
} from "@/lib/gift-cards"

const fetchMock = vi.mocked(client.fetch)
const patchMock = vi.mocked(client.patch)
const createMock = vi.mocked(client.create)

const conflict = Object.assign(new Error("Conflict"), { statusCode: 409 })

// A chainable stand-in for client.patch(id).ifRevisionId(...).set(...).commit().
function patchBuilder(commit: ReturnType<typeof vi.fn>) {
  const builder: Record<string, unknown> = { commit }
  for (const method of ["ifRevisionId", "setIfMissing", "set", "append", "unset"]) {
    builder[method] = vi.fn(() => builder)
  }
  return builder as never
}

const card = (overrides: Record<string, unknown> = {}) => ({
  _id: "giftCard-1",
  _rev: "rev-1",
  code: "STONE-AAAA-BBBB",
  status: "active",
  currentBalance: 50,
  redemptions: [],
  ...overrides,
})

beforeEach(() => {
  vi.resetAllMocks()
})

describe("generateGiftCardCode", () => {
  it("uses the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateGiftCardCode()).toMatch(/^STONE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
    }
  })
})

describe("redeemGiftCard", () => {
  it("returns the earlier amount when this order already redeemed, without patching", async () => {
    fetchMock.mockResolvedValue(card({ redemptions: [{ orderId: "pi_1", amount: 20 }] }) as never)
    const result = await redeemGiftCard("STONE-AAAA-BBBB", 20, "pi_1")
    expect(result.applied).toBe(20)
    expect(patchMock).not.toHaveBeenCalled()
  })

  it("re-reads the card and retries when another order changed it first", async () => {
    fetchMock
      .mockResolvedValueOnce(card() as never)
      .mockResolvedValueOnce(card({ _rev: "rev-2", currentBalance: 30 }) as never)
    const commit = vi.fn().mockRejectedValueOnce(conflict).mockResolvedValueOnce({})
    patchMock.mockReturnValue(patchBuilder(commit))

    const result = await redeemGiftCard("STONE-AAAA-BBBB", 40, "pi_2")
    expect(result).toEqual({ applied: 30, remainingBalance: 0, status: "redeemed" })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("rethrows errors that aren't revision conflicts", async () => {
    fetchMock.mockResolvedValue(card() as never)
    patchMock.mockReturnValue(patchBuilder(vi.fn().mockRejectedValue(new Error("boom"))))
    await expect(redeemGiftCard("STONE-AAAA-BBBB", 10, "pi_3")).rejects.toThrow("boom")
  })
})

describe("claimGiftCardEmail", () => {
  it("refuses a card that was already emailed, without patching", async () => {
    expect(await claimGiftCardEmail({ _id: "g", _rev: "r", emailedAt: "2026-01-01" })).toBe(false)
    expect(patchMock).not.toHaveBeenCalled()
  })

  it("claims once; a concurrent claim loses on the revision check", async () => {
    patchMock.mockReturnValueOnce(patchBuilder(vi.fn().mockResolvedValue({})))
    expect(await claimGiftCardEmail({ _id: "g", _rev: "r" })).toBe(true)

    patchMock.mockReturnValueOnce(patchBuilder(vi.fn().mockRejectedValue(conflict)))
    expect(await claimGiftCardEmail({ _id: "g", _rev: "r" })).toBe(false)
  })
})

describe("getOrCreateGiftCardForPayment", () => {
  const input = {
    amount: 50,
    purchaserEmail: "buyer@example.com",
    recipientEmail: "friend@example.com",
    paymentIntentId: "pi_9",
    expiresAt: new Date("2027-11-12"),
  }

  it("returns the existing card for a retried payment without creating another", async () => {
    fetchMock.mockResolvedValueOnce(card() as never)
    expect(await getOrCreateGiftCardForPayment(input)).toMatchObject({ _id: "giftCard-1" })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("creates the card with an _id derived from the payment", async () => {
    fetchMock
      .mockResolvedValueOnce(null as never) // no card for this payment yet
      .mockResolvedValueOnce(null as never) // code is unused
      .mockResolvedValueOnce(card({ _id: "giftCard-pi_9" }) as never)
    await getOrCreateGiftCardForPayment(input)
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ _id: "giftCard-pi_9", currentBalance: 50 }))
  })

  it("returns the winner's card when a concurrent delivery created it first", async () => {
    fetchMock
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(card({ _id: "giftCard-pi_9" }) as never)
    createMock.mockRejectedValueOnce(conflict)
    expect(await getOrCreateGiftCardForPayment(input)).toMatchObject({ _id: "giftCard-pi_9" })
  })
})
