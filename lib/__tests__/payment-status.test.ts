import { beforeEach, describe, expect, it, vi } from "vitest"

const { retrieve, StripeInvalidRequestError } = vi.hoisted(() => ({
  retrieve: vi.fn(),
  StripeInvalidRequestError: class extends Error {},
}))

vi.mock("stripe", () => ({
  default: Object.assign(
    class {
      paymentIntents = { retrieve }
    },
    { errors: { StripeInvalidRequestError } },
  ),
}))

import { getVerifiedPaymentStatus } from "@/lib/payment-status"

const paymentIntent = (overrides: Record<string, unknown> = {}) => ({
  id: "pi_1",
  client_secret: "pi_1_secret_real",
  status: "succeeded",
  receipt_email: "customer@example.com",
  metadata: { order_type: "storefront" },
  ...overrides,
})

beforeEach(() => {
  retrieve.mockReset()
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x")
})

describe("getVerifiedPaymentStatus", () => {
  it("reports a completed storefront payment with the receipt email", async () => {
    retrieve.mockResolvedValue(paymentIntent())
    expect(await getVerifiedPaymentStatus("pi_1", "pi_1_secret_real")).toEqual({
      outcome: "complete",
      customerEmail: "customer@example.com",
      isGiftCard: false,
    })
  })

  it.each([
    [undefined, "pi_1_secret_real"],
    ["pi_1", undefined],
  ])("shows nothing without both parameters (%s, %s)", async (id, secret) => {
    expect(await getVerifiedPaymentStatus(id, secret)).toEqual({ outcome: "not_found", isGiftCard: false })
    expect(retrieve).not.toHaveBeenCalled()
  })

  it("reveals nothing, not even the email, when the client secret doesn't match", async () => {
    retrieve.mockResolvedValue(paymentIntent())
    expect(await getVerifiedPaymentStatus("pi_1", "pi_1_secret_guess")).toEqual({ outcome: "not_found", isGiftCard: false })
  })

  it("treats an unknown PaymentIntent as not found", async () => {
    retrieve.mockRejectedValue(new StripeInvalidRequestError("No such payment_intent"))
    expect((await getVerifiedPaymentStatus("pi_nope", "x")).outcome).toBe("not_found")
  })

  it.each([
    ["processing", "processing"],
    ["requires_action", "processing"],
    ["requires_payment_method", "failed"],
    ["canceled", "failed"],
  ])("maps Stripe status %s to %s", async (status, outcome) => {
    retrieve.mockResolvedValue(paymentIntent({ status }))
    expect((await getVerifiedPaymentStatus("pi_1", "pi_1_secret_real")).outcome).toBe(outcome)
  })

  it("flags gift card purchases so the page skips shipping steps and keeps the cart", async () => {
    retrieve.mockResolvedValue(paymentIntent({ metadata: { order_type: "gift_card" } }))
    expect((await getVerifiedPaymentStatus("pi_1", "pi_1_secret_real")).isGiftCard).toBe(true)
  })
})
