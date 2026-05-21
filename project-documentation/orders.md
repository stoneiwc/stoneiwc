# Order System — Technical Documentation

## Overview

Storefront orders are persisted in **Sanity** as `order` documents so admins can manage fulfillment from Sanity Studio without ever opening the Stripe Dashboard. Stripe remains the payment processor and the canonical source for the *charge*, but everything else — addresses, items, status, tracking, internal notes — lives in Sanity.

Gift card purchases (slug `stoneiwc-gift-certificate`) follow a separate flow and do **not** create order documents — see [gift-card.md](gift-card.md).

---

## Flow Diagram

```
[Customer fills checkout form]
        │
        ▼
[POST /api/checkout/create-stripe-payment-intent]
        ├── Creates a Stripe PaymentIntent (rich metadata: address, items_summary, gift card)
        └── Creates a Sanity `order` document, status='pending', linked by stripePaymentIntentId
        │
        ▼
[Stripe Elements renders payment form]
        │
        ▼
[Customer enters card → Stripe processes payment]
        │
        ├── Success → webhook fires `payment_intent.succeeded`
        │       ├── markOrderPaid(paymentIntentId)  → status='paid', paidAt=now
        │       └── If gift card applied: redeemGiftCard(code, amount, paymentIntentId)
        │
        └── Failure → webhook fires `payment_intent.payment_failed`
                └── markOrderFailed(paymentIntentId) → status='failed'
```

Gift cards never cover shipping (capped at `subtotal - couponDiscount`), so every order produces a real Stripe charge — there is no zero-total fallback.

---

## File Structure

```
app/api/
├── checkout/
│   └── create-stripe-payment-intent/route.tsx   ← Creates PI + Sanity order
└── webhooks/
    └── stripe/route.ts                          ← Marks paid/failed, redeems gift cards

lib/
├── orders.ts                                    ← Sanity helpers (create/markPaid/markFailed)
└── sanity.client.ts                             ← Shared write-enabled client

studio/schemaTypes/
└── order.ts                                     ← Sanity document type
```

---

## Sanity `order` Document

Visible in Sanity Studio under **Order**. Fields grouped into:

### Overview
| Field | Type | Editable | Notes |
|---|---|---|---|
| `orderNumber` | string | read-only | `SIWC-YYYYMMDD-XXXX` |
| `status` | enum | yes | pending / paid / shipped / delivered / cancelled / refunded / failed |
| `createdAt` | datetime | read-only | When PaymentIntent was created |
| `paidAt` | datetime | read-only | Set by webhook on success |
| `stripePaymentIntentId` | string | read-only | Link back to Stripe |

### Fulfillment (admin-editable)
| Field | Type | Notes |
|---|---|---|
| `shippedAt` | datetime | Admin sets when package leaves |
| `trackingCarrier` | string | UPS, USPS, FedEx, etc. |
| `trackingNumber` | string | Provided by carrier |

### Customer
| Field | Notes |
|---|---|
| `customer` | { email, firstName, lastName, phone? } |
| `shippingAddress` | { line1, line2, city, state, postalCode, country } |
| `billingAddress` | Same shape |
| `billingSameAsShipping` | boolean denormalized for quick UI |

### Items & totals
| Field | Notes |
|---|---|
| `items[]` | { productId, name, slug, quantity, unitPrice, lineTotal, image } |
| `subtotal` | Pre-discount merchandise total |
| `couponCode`, `couponDiscount` | If a coupon was applied |
| `shippingMethod`, `shippingCost` | |
| `giftCardCode`, `giftCardApplied` | If a gift card covered part of the order |
| `total` | What was actually charged to the card |

### Internal
| Field | Notes |
|---|---|
| `internalNotes` | Free-form text for admin notes (fulfillment, customer service) |

The Studio preview shows `SIWC-...  💳  $123.50 · customer@example.com`. Filter and sort by status, date, or total.

---

## File-by-File

### `lib/orders.ts`

Server-only helpers wrapping the Sanity client:

- `generateOrderNumber(now?)` — `SIWC-YYYYMMDD-XXXX`. The random suffix uses the same 32-char unambiguous alphabet as gift cards.
- `createPendingOrder(input)` — idempotent by `stripePaymentIntentId` (returns the existing doc if it's already there). Retries up to 5 times on `orderNumber` collision.
- `markOrderPaid(paymentIntentId)` — flips `pending` (or `failed`, in case of a retry after a transient failure) to `paid` and stamps `paidAt`. Never downgrades from `shipped`/`delivered`.
- `markOrderFailed(paymentIntentId)` — flips only `pending` to `failed`. Does not overwrite finalized states.

### `app/api/checkout/create-stripe-payment-intent/route.tsx`

1. Creates the Stripe PaymentIntent with rich metadata (`ship_line1`, `ship_city`, `items_summary`, optional `coupon_code`, `gift_card_code`, …) so admins can read order details in the Stripe Dashboard too.
2. Calls `createPendingOrder()` to mirror the order into Sanity.
3. The Sanity write is best-effort: if it fails, the customer can still pay (`clientSecret` is returned). Failures are logged with the PaymentIntent ID so admins can recover from Stripe Dashboard data.

### `app/api/webhooks/stripe/route.ts`

Listens for two events:

- `payment_intent.succeeded` → if `metadata.order_type === 'storefront'`, calls `markOrderPaid()`. Then runs the existing gift card redemption and gift card purchase logic.
- `payment_intent.payment_failed` → calls `markOrderFailed()` for storefront orders.

Both Sanity writes are wrapped in try/catch — webhook always returns 200 to Stripe so it doesn't keep retrying for non-critical failures.

### `components/checkout/SelfCheckoutSection.tsx`

The checkout form now forwards everything the order document needs:

- `subtotal`, `couponCode`, `couponDiscount`
- `firstName`, `lastName`, `phone` (top-level customer fields, in addition to the address blocks)
- Each cart item: `id`, `name`, `slug`, `image`, `price`, `quantity`
- `billingSameAsShipping` flag

---

## Admin Workflow

Day-to-day fulfillment in Sanity Studio:

1. Open **Order** in the sidebar. Sort by "Newest first" or "Status, then newest".
2. Click an order to see the full breakdown — address, items, payment split.
3. To ship:
   - Set `shippedAt` (date+time)
   - Fill `trackingCarrier` (e.g. `USPS`) and `trackingNumber`
   - Change `status` to `shipped`
4. When the package arrives (if you track this), set `status` to `delivered`.
5. For refunds: issue the refund in Stripe Dashboard, then set `status` to `refunded` in Sanity. (Sanity is the customer-facing record of truth.)
6. `internalNotes` is free-form — useful for "customer called, leave at back door" type notes.

> Tip: Tracking links can be opened by copying the number into the carrier's website. We don't auto-link yet.

---

## Failure Modes & Recovery

**Sanity write fails during checkout** — customer still pays. The PaymentIntent has no matching Sanity order. Recovery: use the Stripe Dashboard's PaymentIntent detail page to read the rich metadata (`ship_*`, `items_summary`, `customer_email`) and recreate the order in Sanity manually. The webhook will log `markOrderPaid: no order for PaymentIntent ...` when it can't find a document.

**Webhook hasn't fired yet** — order stays at `status: 'pending'` past the success page. Stripe usually delivers within seconds; if it's stuck, replay the event from Stripe Dashboard → Webhooks → Event deliveries → "Resend".

**Abandoned cart** — customer initiated payment but never confirmed. The pending order sits in Sanity. There's no auto-cleanup. Either filter pending+age in the Studio query and bulk-delete, or set up a Vercel Cron job that deletes pending orders older than 24h. (Not implemented yet.)

**Concurrent writes on the same PaymentIntent** — `createPendingOrder` checks for existing by `stripePaymentIntentId` and returns the existing doc instead of creating a duplicate. Stripe retrying its webhook delivery is safe.

---

## Environment Variables

Order tracking adds no new env vars — uses the existing Sanity setup. The `SANITY_API_TOKEN` must have **Editor** permission (the same token already required for gift card creation).

---

## Future Work

- **Abandoned cart cleanup cron** — Vercel Cron that deletes `pending` orders older than 24 hours.
- **Order confirmation email** — Currently the customer only gets Stripe's automatic receipt. A custom Resend email with order details and tracking number could be sent on `status='paid'` and `status='shipped'`.
- **Customer order history page** — `/account/orders` would query Sanity by `customer.email` (after auth is added).
- **Server-side price validation** — Today the server trusts client-sent item prices. A future hardening pass should re-fetch prices from Sanity at `createPendingOrder` time and reject mismatches.
