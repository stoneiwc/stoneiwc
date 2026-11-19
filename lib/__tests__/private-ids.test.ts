import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/sanity.client", () => ({
  writeClient: { fetch: vi.fn(), create: vi.fn(), patch: vi.fn() },
}))

import { writeClient } from "@/lib/sanity.client"
import { isPrivateId, privateId } from "@/lib/sanity-ids"
import { createPendingOrder, recoverPaidOrder } from "@/lib/orders"

const fetchMock = vi.mocked(writeClient.fetch)
const createMock = vi.mocked(writeClient.create)

beforeEach(() => {
  vi.resetAllMocks()
  fetchMock.mockResolvedValue(null as never) // no existing order, order number unused
  createMock.mockImplementation(async (doc) => doc as never)
})

describe("privateId", () => {
  it("puts the document under a type path, which Sanity keeps private in a public dataset", () => {
    expect(privateId("order", "abc")).toBe("order.abc")
    expect(isPrivateId(privateId("giftCard", "pi_123"))).toBe(true)
    expect(isPrivateId("5k7gs459lwdbH0j4BAPSmZ")).toBe(false)
  })

  it.each(["", "a.b"])("rejects the key %j", (key) => {
    expect(() => privateId("order", key)).toThrow()
  })
})

describe("orders are always created with private IDs", () => {
  it("createPendingOrder", async () => {
    await createPendingOrder({
      stripePaymentIntentId: "pi_1",
      customer: { email: "a@example.com" },
      shippingAddress: {},
      billingAddress: {},
      items: [],
      subtotal: 10,
      shippingMethod: "standard",
      shippingCost: 5,
      total: 15,
    })
    const created = createMock.mock.calls[0][0] as unknown as { _id: string }
    expect(created._id).toMatch(/^order\.[0-9a-f-]{36}$/)
  })

  it("recoverPaidOrder", async () => {
    await recoverPaidOrder({ id: "pi_2", amount: 1500, metadata: {} })
    expect((createMock.mock.calls[0][0] as unknown as { _id: string })._id).toBe("order.recovered-pi_2")
  })
})
