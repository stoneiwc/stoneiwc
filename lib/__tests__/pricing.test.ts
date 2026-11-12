import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/sanity.client", () => ({ client: { fetch: vi.fn() } }))
vi.mock("@/lib/sanity.queries", () => ({ getCoupons: vi.fn(), getShippingMethods: vi.fn() }))
vi.mock("@/lib/gift-cards", () => ({ getGiftCardByCode: vi.fn() }))

import { client } from "@/lib/sanity.client"
import { getCoupons, getShippingMethods } from "@/lib/sanity.queries"
import { getGiftCardByCode } from "@/lib/gift-cards"
import { computeOrderPricing } from "@/lib/pricing"

const fetchMock = vi.mocked(client.fetch)
const nextYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()

beforeEach(() => {
  vi.resetAllMocks()
  fetchMock.mockResolvedValue([
    { _id: "serum", name: "Serum", price: 40 },
    { _id: "balm", name: "Balm", price: 20, isDiscount: true, discountedPrice: 15 },
  ] as never)
  vi.mocked(getShippingMethods).mockResolvedValue([
    { id: "standard", name: "Standard", description: "", cost: 8 },
  ] as never)
  vi.mocked(getCoupons).mockResolvedValue([
    { code: "SAVE10", type: "percentage", value: 10 },
    { code: "FIVE", type: "fixed", value: 5, minSubtotal: 50 },
  ] as never)
})

const cart = [
  { id: "serum", quantity: 2 },
  { id: "balm", quantity: 1 },
]

describe("computeOrderPricing", () => {
  it("prices from Sanity, using the discounted price when one is set", async () => {
    const result = await computeOrderPricing({ items: cart, shippingMethod: "standard" })
    expect(result).toMatchObject({ ok: true, subtotal: 95, shippingCost: 8, total: 103 })
    if (result.ok) {
      expect(result.items.map((i) => [i.name, i.unitPrice, i.lineTotal])).toEqual([
        ["Serum", 40, 80],
        ["Balm", 15, 15],
      ])
    }
  })

  it("ignores prices sent by the client", async () => {
    const result = await computeOrderPricing({
      items: [{ id: "serum", quantity: 1, price: 0.01 } as never],
      shippingMethod: "standard",
    })
    expect(result).toMatchObject({ ok: true, subtotal: 40 })
  })

  it("rejects products that no longer exist", async () => {
    const result = await computeOrderPricing({ items: [{ id: "gone", quantity: 1 }], shippingMethod: "standard" })
    expect(result).toEqual({ ok: false, error: "One or more items are no longer available" })
  })

  it.each([0, 101, Number.NaN])("rejects quantity %s", async (quantity) => {
    const result = await computeOrderPricing({ items: [{ id: "serum", quantity }], shippingMethod: "standard" })
    expect(result).toEqual({ ok: false, error: "Invalid item quantity" })
  })

  it.each([undefined, "overnight"])("rejects shipping method %s", async (shippingMethod) => {
    const result = await computeOrderPricing({ items: cart, shippingMethod })
    expect(result).toEqual({ ok: false, error: "Please choose a shipping method." })
  })

  it("applies a percentage coupon, case-insensitively, rounded to cents", async () => {
    const result = await computeOrderPricing({ items: cart, shippingMethod: "standard", couponCode: "save10" })
    expect(result).toMatchObject({ ok: true, couponDiscount: 9.5, total: 93.5 })
  })

  it("applies a fixed coupon only once its minimum subtotal is met", async () => {
    const under = await computeOrderPricing({
      items: [{ id: "balm", quantity: 1 }],
      shippingMethod: "standard",
      couponCode: "FIVE",
    })
    expect(under).toMatchObject({ ok: true, couponDiscount: 0, total: 23 })

    const over = await computeOrderPricing({ items: cart, shippingMethod: "standard", couponCode: "FIVE" })
    expect(over).toMatchObject({ ok: true, couponDiscount: 5, total: 98 })
  })

  it("caps a gift card at the merchandise total, so shipping is still charged", async () => {
    vi.mocked(getGiftCardByCode).mockResolvedValue({
      status: "active",
      currentBalance: 500,
      expiresAt: nextYear,
    } as never)
    const result = await computeOrderPricing({ items: cart, shippingMethod: "standard", giftCardCode: "STONE-AAAA-BBBB" })
    expect(result).toMatchObject({ ok: true, giftCardApplied: 95, total: 8 })
  })

  it("ignores an expired gift card", async () => {
    vi.mocked(getGiftCardByCode).mockResolvedValue({
      status: "active",
      currentBalance: 500,
      expiresAt: "2020-01-01T00:00:00.000Z",
    } as never)
    const result = await computeOrderPricing({ items: cart, shippingMethod: "standard", giftCardCode: "STONE-AAAA-BBBB" })
    expect(result).toMatchObject({ ok: true, giftCardApplied: 0, total: 103 })
  })
})
