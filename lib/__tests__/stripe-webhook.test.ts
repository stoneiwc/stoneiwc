import { beforeEach, describe, expect, it, vi } from "vitest"
import type Stripe from "stripe"

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))
vi.mock("@/lib/orders", () => ({
  markOrderPaid: vi.fn(),
  markOrderFailed: vi.fn(),
  markOrderCanceled: vi.fn(),
  recoverPaidOrder: vi.fn(),
}))
vi.mock("@/lib/gift-cards", () => ({
  getOrCreateGiftCardForPayment: vi.fn(),
  claimGiftCardEmail: vi.fn(),
  releaseGiftCardEmail: vi.fn(),
  redeemGiftCard: vi.fn(),
}))

import * as orders from "@/lib/orders"
import * as giftCards from "@/lib/gift-cards"
import { handleStripeEvent } from "@/lib/stripe-webhook"

const order = {
  _id: "order-1",
  orderNumber: "SIWC-20261112-ABCD",
  customer: { email: "customer@example.com", firstName: "Ada", lastName: "Lee" },
  shippingAddress: { line1: "1 Main St", city: "Plano", state: "TX", postalCode: "75075", country: "US" },
  items: [{ name: "Serum", quantity: 1, unitPrice: 40, lineTotal: 40 }],
  subtotal: 40,
  shippingMethod: "standard",
  shippingCost: 8,
  total: 48,
}

const giftCard = {
  _id: "giftCard-pi_gc",
  _rev: "r1",
  code: "STONE-AAAA-BBBB",
  originalAmount: 50,
  purchaserName: "Sam",
  purchaserEmail: "buyer@example.com",
  recipientEmail: "friend@example.com",
  expiresAt: "2027-11-12T00:00:00.000Z",
}

function event(type: string, metadata: Record<string, string>, extra: Record<string, unknown> = {}) {
  return {
    id: "evt_1",
    type,
    data: { object: { id: "pi_1", amount: 4800, receipt_email: null, metadata, ...extra } },
  } as unknown as Stripe.Event
}

const storefrontPaid = (metadata: Record<string, string> = {}) =>
  event("payment_intent.succeeded", { order_type: "storefront", ...metadata })

const giftCardPaid = () =>
  event(
    "payment_intent.succeeded",
    { order_type: "gift_card", customer_email: "buyer@example.com", sender_name: "Sam", recipient_email: "friend@example.com" },
    { id: "pi_gc", amount: 5000 },
  )

const subjects = () => send.mock.calls.map(([email]) => email.subject as string)

beforeEach(() => {
  vi.resetAllMocks()
  process.env.CONTACT_EMAIL_TO = "team@example.com"
  process.env.RESEND_FROM_EMAIL = "orders@example.com"
  send.mockResolvedValue({ error: null })
})

describe("storefront payment succeeded", () => {
  it("sends the customer and owner emails on the pending → paid transition", async () => {
    vi.mocked(orders.markOrderPaid).mockResolvedValue({ transitioned: true, order } as never)
    const result = await handleStripeEvent(storefrontPaid())
    expect(result.status).toBe(200)
    expect(subjects()).toEqual(["Order SIWC-20261112-ABCD confirmed", "New order SIWC-20261112-ABCD — $48.00"])
  })

  it("sends nothing when a retry finds the order already paid", async () => {
    vi.mocked(orders.markOrderPaid).mockResolvedValue({ transitioned: false, order } as never)
    expect((await handleStripeEvent(storefrontPaid())).status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it("answers 500 so Stripe retries when the order can't be updated", async () => {
    vi.mocked(orders.markOrderPaid).mockRejectedValue(new Error("Sanity down"))
    expect((await handleStripeEvent(storefrontPaid())).status).toBe(500)
    expect(send).not.toHaveBeenCalled()
  })

  it("recovers a missing order from Stripe and alerts the owner once", async () => {
    vi.mocked(orders.markOrderPaid).mockResolvedValue({ transitioned: false, order: null })
    vi.mocked(orders.recoverPaidOrder).mockResolvedValue({ created: true, order: { ...order, items: [] } } as never)
    const result = await handleStripeEvent(storefrontPaid({ items_summary: "1× Serum" }))
    expect(result.status).toBe(200)
    expect(subjects()).toEqual(["[Needs review] Paid order SIWC-20261112-ABCD — $48.00"])
    expect(send.mock.calls[0][0].text).toContain("1× Serum")
  })

  it("doesn't alert again when the recovered order already exists", async () => {
    vi.mocked(orders.markOrderPaid).mockResolvedValue({ transitioned: false, order: null })
    vi.mocked(orders.recoverPaidOrder).mockResolvedValue({ created: false, order } as never)
    expect((await handleStripeEvent(storefrontPaid())).status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it("redeems a gift card used on the order, and retries if that fails", async () => {
    vi.mocked(orders.markOrderPaid).mockResolvedValue({ transitioned: false, order } as never)
    vi.mocked(giftCards.redeemGiftCard).mockResolvedValue({ applied: 20, remainingBalance: 0, status: "redeemed" })
    const meta = { gift_card_code: "STONE-AAAA-BBBB", gift_card_applied_amount: "20.00" }

    expect((await handleStripeEvent(storefrontPaid(meta))).status).toBe(200)
    expect(giftCards.redeemGiftCard).toHaveBeenCalledWith("STONE-AAAA-BBBB", 20, "pi_1")

    vi.mocked(giftCards.redeemGiftCard).mockRejectedValue(new Error("conflict"))
    expect((await handleStripeEvent(storefrontPaid(meta))).status).toBe(500)
  })
})

describe("gift card purchase succeeded", () => {
  it("emails the recipient and the purchaser once the send is claimed", async () => {
    vi.mocked(giftCards.getOrCreateGiftCardForPayment).mockResolvedValue(giftCard as never)
    vi.mocked(giftCards.claimGiftCardEmail).mockResolvedValue(true)
    expect((await handleStripeEvent(giftCardPaid())).status).toBe(200)
    expect(send.mock.calls.map(([email]) => email.to)).toEqual(["friend@example.com", "buyer@example.com"])
    // Expiry comes from the stored card, not a date re-derived at send time.
    expect(send.mock.calls[0][0].text).toContain("November")
  })

  it("sends nothing on a retry after the email went out", async () => {
    vi.mocked(giftCards.getOrCreateGiftCardForPayment).mockResolvedValue({ ...giftCard, emailedAt: "x" } as never)
    vi.mocked(giftCards.claimGiftCardEmail).mockResolvedValue(false)
    expect((await handleStripeEvent(giftCardPaid())).status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it("releases the claim and asks Stripe to retry when the gift email fails", async () => {
    vi.mocked(giftCards.getOrCreateGiftCardForPayment).mockResolvedValue(giftCard as never)
    vi.mocked(giftCards.claimGiftCardEmail).mockResolvedValue(true)
    send.mockResolvedValueOnce({ error: { message: "rate limited" } })
    expect((await handleStripeEvent(giftCardPaid())).status).toBe(500)
    expect(giftCards.releaseGiftCardEmail).toHaveBeenCalledWith("giftCard-pi_gc")
    expect(send).toHaveBeenCalledTimes(1)
  })

  it("answers 400 when required metadata is missing", async () => {
    const result = await handleStripeEvent(event("payment_intent.succeeded", { order_type: "gift_card" }))
    expect(result.status).toBe(400)
    expect(giftCards.getOrCreateGiftCardForPayment).not.toHaveBeenCalled()
  })
})

describe("other events", () => {
  it("marks storefront orders failed, retrying if Sanity errors", async () => {
    const failed = event("payment_intent.payment_failed", { order_type: "storefront" })
    expect((await handleStripeEvent(failed)).status).toBe(200)
    expect(orders.markOrderFailed).toHaveBeenCalledWith("pi_1")

    vi.mocked(orders.markOrderFailed).mockRejectedValue(new Error("down"))
    expect((await handleStripeEvent(failed)).status).toBe(500)
  })

  it("acknowledges event types it doesn't handle", async () => {
    expect((await handleStripeEvent(event("charge.refunded", {}))).status).toBe(200)
  })
})
