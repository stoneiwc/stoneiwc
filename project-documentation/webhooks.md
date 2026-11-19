# Webhooks — Stripe Event Handling

There is one webhook endpoint in this codebase: [`POST /api/webhooks/stripe`](../app/api/webhooks/stripe/route.ts). It handles every event Stripe sends, branching internally by `event.type` and by the PaymentIntent's `metadata.order_type`.

This doc is the reference for what that endpoint does, why, and how to debug it.

---

## Why one endpoint for everything

Stripe lets you have multiple webhook endpoints with different event subscriptions. We deliberately use **one endpoint per environment** for simplicity:

- Easier secret management (one `STRIPE_WEBHOOK_SECRET` per scope, not many)
- One file to read when debugging
- One place that's responsible for idempotency

The cost: that handler has multiple branches. Worth it for the simplicity.

---

## Events handled

The route ([`app/api/webhooks/stripe/route.ts`](../app/api/webhooks/stripe/route.ts)) only verifies the signature; everything else is in [`lib/stripe-webhook.ts`](../lib/stripe-webhook.ts) (`handleStripeEvent`), which has unit tests in `lib/__tests__/stripe-webhook.test.ts`.

| Event | When Stripe sends it | What we do |
|---|---|---|
| `payment_intent.succeeded` | Card charged successfully | Storefront order → mark the Sanity order `paid` + email the customer and the owner. No order found → recover one from the PaymentIntent (below). Gift card purchase → create the Sanity gift card + email the recipient (+ purchaser). Gift card applied to an order → redeem its balance. |
| `payment_intent.payment_failed` | Charge failed (decline, insufficient funds, expired card, etc.) | Storefront order → mark the Sanity order `failed`. Gift cards are not touched. |
| `payment_intent.canceled` | PaymentIntent cancelled (including by checkout when the order couldn't be recorded) | Storefront order → mark the Sanity order `cancelled` (only from `pending`). |

Any other event type is acknowledged with `{ received: true }` and ignored.

> **Why not `charge.succeeded`?** PaymentIntents are the higher-level abstraction; one PaymentIntent can produce multiple Charges (retries, refunds). PaymentIntent events fire at the right level for our needs.

---

## Routing inside the handler

The handler reads `paymentIntent.metadata.order_type` to decide which flow to run:

```
payment_intent.succeeded
│
├── order_type === 'storefront'
│   ├── markOrderPaid(paymentIntentId)            throws → 500 (Stripe retries)
│   ├── transitioned → customer + owner emails     (once: only the winning delivery)
│   └── no order → recoverPaidOrder(paymentIntent) creates a paid order from metadata
│                  created → one "[Needs review]" email to the owner
│
├── gift_card_code && gift_card_applied_amount > 0
│   └── redeemGiftCard(code, amount, paymentIntentId)   throws → 500
│
└── order_type === 'gift_card'
    ├── getOrCreateGiftCardForPayment(...)   _id derived from the PaymentIntent
    ├── claimGiftCardEmail(card)              false → already sent, return 200
    ├── email the recipient                   failed → release claim, 500 (Stripe retries)
    └── if recipient !== purchaser: email the purchaser (best effort)

payment_intent.payment_failed → markOrderFailed    (storefront; error → 500)
payment_intent.canceled       → markOrderCanceled  (storefront; error → 500)
```

`order_type` is set when the PaymentIntent is created:
- `'storefront'`: set by [`create-stripe-payment-intent/route.tsx`](../app/api/checkout/create-stripe-payment-intent/route.tsx)
- `'gift_card'`: set by [`gift-cards/create-payment-intent/route.ts`](../app/api/gift-cards/create-payment-intent/route.ts)

A storefront order with a gift card applied has `order_type = 'storefront'` AND `gift_card_code` set. The handler processes both: marks the order paid, then redeems the balance.

### Recovered orders

Checkout creates a `pending` Sanity order before the customer pays. If that write fails, it cancels the PaymentIntent and answers 503 to the browser, so normally every payment has an order. If a paid PaymentIntent still has no order (a pending order was deleted by hand, or something slipped through), `recoverPaidOrder` in [`lib/orders.ts`](../lib/orders.ts) creates a `paid` order from the PaymentIntent metadata: customer, shipping address, totals, coupon and gift card. Its `_id` is `order.recovered-<paymentIntentId>` and it has **no line items**. The item summary from Stripe goes in `internalNotes`, and the owner gets a `[Needs review] Paid order …` email. Check the items in the Stripe payment before fulfilling.

---

## Signature verification

Every request is verified using `stripe.webhooks.constructEvent(body, signature, webhookSecret)`. If verification fails, the handler returns 400 immediately. This is the first thing it does — before reading the payload.

```ts
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

`webhookSecret` is `process.env.STRIPE_WEBHOOK_SECRET`. **Critical:** this must match the secret of the webhook endpoint Stripe is sending FROM. Test mode endpoint and Live mode endpoint have different secrets — see [environments-and-deployments.md](environments-and-deployments.md#stripe-webhooks-one-per-mode).

If verification fails:
- Stripe sees a 400, marks the delivery as failed, will retry on its own schedule
- The error is logged with the specific reason (`No signatures found matching the expected signature for payload`)
- Common cause: env var pointing at the wrong webhook endpoint's secret

---

## Idempotency

Stripe **will** retry webhook delivery on failure, and staff can resend events from the Dashboard. Two deliveries of the same event can even run at the same time. Every write is safe to repeat:

### How each write is idempotent

| Write | Idempotency guard |
|---|---|
| `markOrderPaid` | Only transitions from `pending` or `failed`, and commits with `ifRevisionId`, so of two concurrent deliveries exactly one wins `{ transitioned: true }`. Already `paid` (or `shipped`, …) → `{ transitioned: false }` |
| Order emails | Sent only by the delivery that won the `pending → paid` transition |
| `recoverPaidOrder` | The `_id` is derived from the PaymentIntent, so a second create fails with 409 → `{ created: false }`, and no second alert is sent |
| `markOrderFailed` / `markOrderCanceled` | Only transition from `pending`; finalized states are not overwritten |
| `getOrCreateGiftCardForPayment` | Looks up the card by `paymentIntentId` first; creates with `_id: giftCard.<paymentIntentId>`, so a concurrent create gets 409 and returns the existing card. One card per payment |
| Gift card email | `claimGiftCardEmail` sets `emailedAt` with `ifRevisionId` *before* sending; a card that already has `emailedAt` (or loses the claim race) is not emailed again. If the send fails, `releaseGiftCardEmail` clears the claim and the handler returns 500 so Stripe retries the email |
| `redeemGiftCard` | Skips the deduction if `redemptions` already has an entry with this `paymentIntentId` as `orderId`. Commits with `ifRevisionId` and re-reads + retries on a conflict (up to 5 attempts). If it still fails, the handler returns 500 so Stripe retries. See [`lib/gift-cards.ts`](../lib/gift-cards.ts) |

### Manual test of idempotency

In any test mode purchase, after the success page loads:
1. Stripe Dashboard → Developers → Webhooks → click the endpoint → "Event deliveries"
2. Find the most recent `payment_intent.succeeded` event
3. Click "Resend"
4. Verify: the order didn't duplicate, the gift card balance didn't double-decrement, and no second email arrived (customer, owner or gift card recipient)

This is part of the test scenarios in [runbook.md](runbook.md#test-scenarios).

---

## Response codes (what makes Stripe retry)

Stripe retries any non-2xx response for up to 3 days. Because every write above is idempotent, the handler returns 500 whenever a retry could fix the problem, and 200 when it has finished (or there's nothing to do):

| Response | When |
|---|---|
| 200 | Event handled; event type not handled; already processed (a retry); order emails failed to send. That last one returns 200 because a retry couldn't resend them without duplicating the ones that did go out, so check the logs. |
| 400 | Missing `stripe-signature` header; signature verification failed; gift card PaymentIntent missing required metadata |
| 500 | `Stripe is not configured`; Sanity error marking an order paid / failed / cancelled; recovering an order failed; gift card redemption failed; gift card creation failed; gift card email failed to send; any unexpected error |

---

## PaymentIntent metadata reference

The metadata Stripe stores on the PaymentIntent doubles as the order record visible in the Stripe Dashboard. An admin can read all of this in Stripe without opening Sanity, which matters when Sanity is down or when triaging without studio access.

### Storefront PaymentIntent

| Field | Example | Purpose |
|---|---|---|
| `order_type` | `storefront` | Branch the webhook |
| `order_number` | `SIWC-20260521-K2X9` | Echoed back from Sanity after order creation |
| `customer_email` | `jane@example.com` | Recipient of confirmation |
| `customer_name` | `Jane Doe` | |
| `customer_phone` | `+1…` | Optional |
| `items_count` | `3` | |
| `items_summary` | `1× Coffee Sampler, 2× Mug` | Truncated at 480 chars |
| `subtotal` | `120.00` | Pre-discount |
| `shipping_method` | `standard` | |
| `shipping_cost` | `8.00` | |
| `ship_name`, `ship_line1`, `ship_line2`, `ship_city`, `ship_state`, `ship_postal`, `ship_country` | Address fields, individually stored for filter/search in Stripe |
| `coupon_code`, `coupon_discount` | `SUMMER10`, `12.00` | Only if a coupon was applied |
| `gift_card_code`, `gift_card_applied_amount` | `STONE-XXXX-XXXX`, `40.00` | Only if a gift card was applied |

### Gift card PaymentIntent

| Field | Purpose |
|---|---|
| `order_type` | `gift_card` |
| `sender_name` | Required — the name that appears in the recipient email |
| `recipient_name` | Optional |
| `recipient_email` | Required — destination for the gift card delivery |
| `gift_card_note` | Optional personal note (max 500 chars) |
| `gift_card_amount` | Dollar amount as a string |
| `customer_email` | Purchaser's email (Stripe also has it in `receipt_email`) |

> Stripe metadata values are strings (Stripe doesn't preserve numeric types). Cast back with `Number()` / `parseFloat()` on read.

---

## Stripe webhook configuration (Dashboard)

Two endpoints, one per Stripe mode:

| Stripe mode | Endpoint URL | Events |
|---|---|---|
| Test | `https://dev.stoneiwc.com/api/webhooks/stripe?x-vercel-protection-bypass=…&x-vercel-set-bypass-cookie=true` | `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` |
| Live | `https://stoneiwc.com/api/webhooks/stripe` | `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` |

The bypass token is needed for the Test endpoint because `dev.stoneiwc.com` has Vercel Deployment Protection enabled. Production is public, no token needed.

**Don't add more events** without updating the handler — `handleStripeEvent` acknowledges unknown event types and does nothing with them. `payment_intent.canceled` is handled (it marks a pending order cancelled) but must be ticked on each endpoint, or cancelled orders stay `pending`.

---

## Debugging a webhook issue

1. **Stripe Dashboard → Developers → Webhooks → click the endpoint → "Event deliveries"** — shows all recent deliveries with response status and body
2. **Click an event** — full request/response with headers and signature
3. **Click "Resend"** — fires it again. Safe because the handler is idempotent.
4. **Vercel → Logs → filter by `/api/webhooks/stripe`** — see what the handler did with the event
5. **Stripe CLI for local debugging:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

Specific failure modes are in [runbook.md](runbook.md#stripe-webhook-returns-401).

---

## Local development

To exercise the webhook locally, forward Stripe events to your machine:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a `whsec_…` signing secret. Put it in `.env.local` as `STRIPE_WEBHOOK_SECRET`. Restart `pnpm dev`.

Now any test purchase you make through `localhost:3000` will trigger real Stripe events that get forwarded to your local handler. Sanity will be written to (the same shared `production` dataset), so don't run dev test purchases with the same email as a real customer.

You can also fire arbitrary events without doing a checkout:

```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

These generate synthetic events with no `order_type` metadata, so the handler acknowledges them (200) without touching Sanity or sending email. Useful for testing the signature verification path.

---

## Adding a new event type

If you ever need to handle a new Stripe event:

1. Update the early return at the top of the handler to include the new type
2. Add a new branch after the existing ones
3. Add the event to **both** Stripe webhook endpoints (Test mode + Live mode) in the Stripe Dashboard
4. Make sure the new branch is idempotent — re-receiving the event must not double-write

Don't be tempted to subscribe to "All events" — Stripe sends a lot of housekeeping events, each one costs a function invocation, and you'd be filtering them out anyway.

---

## See also

- [orders.md](orders.md) — storefront order lifecycle
- [gift-card.md](gift-card.md) — gift card creation and redemption details
- [environments-and-deployments.md](environments-and-deployments.md#stripe-webhooks-one-per-mode) — endpoint URLs and secrets per scope
- [runbook.md](runbook.md) — webhook-specific troubleshooting
