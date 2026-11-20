import { describe, expect, it } from "vitest"
import { contactEmailHtml, contactEmailText } from "@/lib/email/contact-template"
import { contactAutoReplyHtml } from "@/lib/email/contact-autoreply-template"
import { giftCardEmailHtml, giftCardPurchaseConfirmationHtml } from "@/lib/email/gift-card-template"
import {
  orderConfirmationEmailHtml,
  ownerOrderNotificationHtml,
  type OrderConfirmationData,
} from "@/lib/email/order-confirmation-template"

// Text a visitor could type into the contact, checkout or gift card forms.
const HOSTILE = `<script>alert(1)</script><img src=x onerror=alert(2)>"'&`
const ESCAPED = "&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(2)&gt;&quot;&#39;&amp;"

function expectEscaped(html: string) {
  expect(html).not.toContain("<script>")
  expect(html).not.toContain("<img src=x")
  expect(html).toContain(ESCAPED)
}

describe("contact emails", () => {
  const data = {
    firstName: HOSTILE,
    lastName: HOSTILE,
    email: `x@example.com"><a href="https://evil.example">`,
    phone: HOSTILE,
    message: `${HOSTILE}\nsecond line`,
  }

  it("escapes every field in the team notification", () => {
    const html = contactEmailHtml(data)
    expectEscaped(html)
    // The email also goes into mailto: hrefs, so it must not break out of the attribute.
    expect(html).not.toContain(`"><a href="https://evil.example">`)
    expect(html).toContain("x@example.com&quot;&gt;&lt;a href=&quot;https://evil.example&quot;&gt;")
  })

  it("keeps line breaks in the message", () => {
    expect(contactEmailHtml(data)).toContain(`${ESCAPED}<br/>second line`)
  })

  it("leaves the plain-text version as typed", () => {
    expect(contactEmailText(data)).toContain(HOSTILE)
  })

  it("escapes the name in the auto-reply", () => {
    expectEscaped(contactAutoReplyHtml({ firstName: HOSTILE }))
  })
})

describe("gift card emails", () => {
  it("escapes the sender, recipient and note", () => {
    const html = giftCardEmailHtml({
      code: "STONE-AAAA-BBBB",
      amount: 50,
      senderName: HOSTILE,
      recipientName: HOSTILE,
      recipientEmail: "friend@example.com",
      purchaserEmail: "buyer@example.com",
      note: HOSTILE,
      expiresAt: "2027-11-19",
    })
    expectEscaped(html)
  })

  it("escapes the recipient in the purchase confirmation", () => {
    const html = giftCardPurchaseConfirmationHtml({
      amount: 50,
      senderName: "Buyer",
      recipientName: HOSTILE,
      recipientEmail: HOSTILE,
      expiresAt: "2027-11-19",
    })
    expectEscaped(html)
  })
})

describe("order emails", () => {
  const order: OrderConfirmationData = {
    orderNumber: "SIWC-1001",
    firstName: HOSTILE,
    items: [{ name: HOSTILE, quantity: 1, unitPrice: 20, lineTotal: 20 }],
    subtotal: 20,
    couponCode: HOSTILE,
    couponDiscount: 2,
    shippingMethod: HOSTILE,
    shippingCost: 5,
    total: 23,
    shippingAddress: { line1: HOSTILE, city: "Plano", state: "TX", postalCode: "75075", country: "US" },
  }

  it("escapes customer-entered fields in the customer confirmation", () => {
    expectEscaped(orderConfirmationEmailHtml(order))
  })

  it("escapes customer-entered fields in the owner notification", () => {
    expectEscaped(ownerOrderNotificationHtml({ ...order, customerName: HOSTILE, customerEmail: HOSTILE }))
  })
})
