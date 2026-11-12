import { describe, expect, it } from "vitest"
import { giftCardAmount, MIN_STRIPE_CHARGE } from "@/lib/gift-card-math"

describe("giftCardAmount", () => {
  it("applies the whole balance when it is smaller than the merchandise", () => {
    expect(giftCardAmount({ merchandise: 100, shipping: 10, balance: 50 })).toBe(50)
  })

  it("never covers shipping", () => {
    expect(giftCardAmount({ merchandise: 30, shipping: 10, balance: 100 })).toBe(30)
  })

  it("leaves Stripe's minimum charge when there is no shipping to pay", () => {
    expect(giftCardAmount({ merchandise: 30, shipping: 0, balance: 100 })).toBe(30 - MIN_STRIPE_CHARGE)
  })

  it("returns 0 for an empty card or negative merchandise", () => {
    expect(giftCardAmount({ merchandise: 30, shipping: 5, balance: 0 })).toBe(0)
    expect(giftCardAmount({ merchandise: -5, shipping: 5, balance: 20 })).toBe(0)
  })

  it("rounds to cents", () => {
    expect(giftCardAmount({ merchandise: 10.004, shipping: 5, balance: 20 })).toBe(10)
  })
})
