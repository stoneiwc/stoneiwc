import { beforeEach, describe, expect, it, vi } from "vitest"

const { paymentIntents } = vi.hoisted(() => ({
  paymentIntents: { retrieve: vi.fn(), update: vi.fn(), create: vi.fn(), cancel: vi.fn() },
}))

vi.mock("stripe", () => ({
  default: class {
    paymentIntents = paymentIntents
  },
}))
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn().mockResolvedValue(null) }))
vi.mock("@/lib/pricing", () => ({ computeOrderPricing: vi.fn() }))
vi.mock("@/lib/orders", () => ({ createPendingOrder: vi.fn() }))

import { POST } from "@/app/api/checkout/create-stripe-payment-intent/route"
import { computeOrderPricing } from "@/lib/pricing"
import { createPendingOrder } from "@/lib/orders"

const pricing = {
  ok: true as const,
  items: [{ id: "serum", name: "Serum", unitPrice: 40, quantity: 1, lineTotal: 40 }],
  subtotal: 40,
  couponDiscount: 0,
  shippingCost: 8,
  giftCardApplied: 0,
  total: 48,
}

function checkout(body: Record<string, unknown>) {
  return POST(
    new Request("https://example.com/api/checkout/create-stripe-payment-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: [{ id: "serum", quantity: 1 }],
        shippingMethod: "standard",
        email: "customer@example.com",
        ...body,
      }),
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x")
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(computeOrderPricing).mockResolvedValue(pricing)
  vi.mocked(createPendingOrder).mockResolvedValue({ _id: "order-1", orderNumber: "SIWC-20261113-ABCD" })
  paymentIntents.create.mockResolvedValue({ id: "pi_new", client_secret: "pi_new_secret_1" })
  paymentIntents.update.mockImplementation(async (id: string) => ({ id, client_secret: `${id}_secret_1` }))
})

describe("POST /api/checkout/create-stripe-payment-intent", () => {
  it("prices on the server and creates a PaymentIntent for the computed total", async () => {
    const response = await checkout({ totalAmount: 0.01 })
    expect(response.status).toBe(200)
    expect(paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 4800,
        metadata: expect.objectContaining({ items_summary: "1× Serum" }),
      }),
    )
  })

  it("rejects a missing or malformed email before touching Stripe", async () => {
    const response = await checkout({ email: "not-an-email" })
    expect(response.status).toBe(400)
    expect(paymentIntents.create).not.toHaveBeenCalled()
  })

  it("reuses the earlier PaymentIntent when the caller proves it with the client secret", async () => {
    paymentIntents.retrieve.mockResolvedValue({
      id: "pi_old",
      client_secret: "pi_old_secret_1",
      status: "requires_payment_method",
      metadata: { order_type: "storefront" },
    })
    await checkout({ paymentIntentId: "pi_old", paymentIntentClientSecret: "pi_old_secret_1" })
    expect(paymentIntents.update).toHaveBeenCalledWith("pi_old", expect.objectContaining({ amount: 4800 }))
    expect(paymentIntents.create).not.toHaveBeenCalled()
  })

  it.each([
    ["no client secret", { paymentIntentId: "pi_victim" }],
    ["a wrong client secret", { paymentIntentId: "pi_victim", paymentIntentClientSecret: "pi_victim_secret_guess" }],
  ])("never modifies someone else's PaymentIntent given %s", async (_label, body) => {
    paymentIntents.retrieve.mockResolvedValue({
      id: "pi_victim",
      client_secret: "pi_victim_secret_real",
      status: "requires_payment_method",
      metadata: { order_type: "storefront" },
    })
    await checkout(body)
    expect(paymentIntents.update).not.toHaveBeenCalledWith("pi_victim", expect.anything())
    expect(paymentIntents.create).toHaveBeenCalled()
  })

  it("cancels the PaymentIntent and answers 503 when the order can't be recorded", async () => {
    vi.mocked(createPendingOrder).mockRejectedValue(new Error("Sanity down"))
    const response = await checkout({})
    expect(response.status).toBe(503)
    expect(paymentIntents.cancel).toHaveBeenCalledWith("pi_new")
    expect(await response.json()).not.toHaveProperty("clientSecret")
  })
})
