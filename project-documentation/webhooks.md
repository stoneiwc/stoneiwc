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

| Event | When Stripe sends it | What we do |
|---|---|---|
| `payment_intent.succeeded` | Card charged successfully | If storefront order → mark Sanity Order `paid` + email customer. If gift card purchase → create Sanity Gift Card + email recipient (+ purchaser). If gift card was applied → redeem balance. |
| `payment_intent.payment_failed` | Charge failed (decline, insufficient funds, expired card, etc.) | If storefront order → mark Sanity Order `failed`. Gift cards NOT decremented. |

Any other event type is acknowledged with `{ received: true }` and ignored. Stripe is configured to only send these two — but if a future change adds more, the early return prevents accidental processing.

> **Why not `charge.succeeded`?** PaymentIntents are the higher-level abstraction; one PaymentIntent can produce multiple Charges (retries, refunds). PaymentIntent events fire at the right level for our needs.

---

## Routing inside the handler

The handler reads `paymentIntent.metadata.order_type` to decide which flow to run:

```
event.type === 'payment_intent.succeeded'
│
├── meta.order_type === 'storefront'
│   ├── markOrderPaid(paymentIntentId)
│   └── send order confirmation email (only on pending→paid transition)
│
├── meta.gift_card_code && meta.gift_card_applied_amount > 0
│   └── redeemGiftCard(code, amount, paymentIntentId)
│
└── meta.order_type === 'gift_card'
    ├── createGiftCard(...) (idempotent by paymentIntentId)
    ├── send gift card email to recipient
    └── if recipient !== purchaser: send confirmation email to purchaser

event.type === 'payment_intent.payment_failed'
│
└── meta.order_type === 'storefront'
    └── markOrderFailed(paymentIntentId)
```

`order_type` is set when the PaymentIntent is created:
- `'storefront'` — set by [`create-stripe-payment-intent/route.tsx`](../app/api/checkout/create-stripe-payment-intent/route.tsx)
- `'gift_card'` — set by [`gift-cards/create-payment-intent/route.ts`](../app/api/gift-cards/create-payment-intent/route.ts)

A storefront order with a gift card applied has `order_type = 'storefront'` AND `gift_card_code` set. The handler processes both: marks order paid, then redeems balance.

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

Stripe **will** retry webhook delivery on failure. Network blips, function cold starts, intermittent errors — Stripe doesn't trust a single 200, it expects the same event to be safe to process twice. Our handler treats every event as potentially duplicated.

### How each write is idempotent

| Write | Idempotency guard |
|---|---|
| `markOrderPaid` | Only transitions from `pending` or `failed`; if already `paid` (or further along like `shipped`), returns `{ transitioned: false }` and skips the email send |
| `markOrderFailed` | Only transitions from `pending`; finalized states are not overwritten |
| `createGiftCard` | First fetches by `paymentIntentId`; if a Gift Card document already exists for this PI, returns its `code` without creating a duplicate |
| `redeemGiftCard` | Optimistic concurrency: re-fetches current balance + `redemptions` array, checks if this `paymentIntentId` is already in the array, only commits the patch if no duplicate. See [`lib/gift-cards.ts`](../lib/gift-cards.ts) |
| Order confirmation email | Only sent on the `pending → paid` transition (`if (result.transitioned)`) — Stripe replays don't trigger duplicate emails |
| Gift card emails | Sent every time the handler runs for a gift card event, but the create step is idempotent so the email itself can be considered idempotent in practice — receiving a second email is annoying but not catastrophic |

### Manual test of idempotency

In any test mode purchase, after the success page loads:
1. Stripe Dashboard → Developers → Webhooks → click the endpoint → "Event deliveries"
2. Find the most recent `payment_intent.succeeded` event
3. Click "Resend"
4. Verify in Sanity: order didn't duplicate, balance didn't double-decrement

This is part of the test scenarios in [runbook.md](runbook.md#test-scenarios).

---

## Always returns 200 (almost)

The handler is structured to return `{ received: true }` for any case that isn't catastrophic, even when something internal fails. This is intentional:

- Stripe retries on non-200 responses
- A persistent failure (e.g. Sanity is down) would cause Stripe to retry indefinitely
- We'd rather log the error and let an admin recover than fight retry storms

Returns that are NOT 200:
- 400 on missing `stripe-signature` header
- 400 on signature verification failure
- 500 on `Stripe is not configured` (missing env vars)
- 500 on gift card creation failure (only branch that fails the request, because the email send depends on the code)

All other errors (`markOrderPaid` failure, email send failure) are caught, logged, and the handler proceeds to return 200.

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
| Test | `https://dev.stoneiwc.com/api/webhooks/stripe?x-vercel-protection-bypass=…&x-vercel-set-bypass-cookie=true` | `payment_intent.succeeded`, `payment_intent.payment_failed` |
| Live | `https://stoneiwc.com/api/webhooks/stripe` | `payment_intent.succeeded`, `payment_intent.payment_failed` |

The bypass token is needed for the Test endpoint because `dev.stoneiwc.com` has Vercel Deployment Protection enabled. Production is public, no token needed.

**Don't add more events** without updating the handler — the route filters unknown events with an early return, so they'd just be acknowledged and dropped silently. Worse than dropping is processing the wrong way.

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

These generate synthetic events with auto-populated metadata — they won't match real Sanity orders, so `markOrderPaid` will log `no order for PaymentIntent` but return 200. Useful for testing the signature verification path.

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
