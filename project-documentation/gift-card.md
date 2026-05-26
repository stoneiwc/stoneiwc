# Gift Card System — Technical Documentation

## Overview

Gift cards at Stone IWC use **Sanity as the source of truth** for state (code, balance, status, redemption history) and **Stripe** for payment processing. Each gift card supports **partial redemption** — buying a $100 card and using $30 leaves a $70 balance under the same code.

Gift cards apply to **merchandise only** (`subtotal - couponDiscount`). Shipping is always paid by the customer, which guarantees every order produces a Stripe charge above the $0.50 minimum. Storefront orders are mirrored into Sanity for fulfillment — see [orders.md](orders.md).

A purchase collects sender name (required), purchaser email, optional recipient name, recipient email, and an optional 500-char personal note. The recipient receives a styled email with the code and the message; if the recipient differs from the purchaser, the purchaser also receives a confirmation email (no code).

---

## Flow Diagram

```
[Customer fills the purchase form]
        │ amount + sender name + emails + (optional note/recipient name)
        ▼
[create-payment-intent API] ── Creates a Stripe PaymentIntent
        │                       metadata: order_type=gift_card
        │                                 sender_name, recipient_name,
        │                                 customer_email, recipient_email,
        │                                 gift_card_note, gift_card_amount
        ▼
[Stripe processes the payment]
        ▼
[Webhook fires: payment_intent.succeeded]
        ├── (Idempotent) Create Sanity giftCard document with code, balance,
        │       purchaser/recipient info, optional note, expiresAt (+1 year)
        ├── Resend → email to recipient: code + value + note
        └── If purchaser ≠ recipient → Resend → confirmation email to purchaser

[Recipient enters code at checkout]
        ▼
[validate API queries Sanity]
        ▼
[If active + has balance + not expired, returns code + balance]
        ▼
[Checkout shows applied discount = min(balance, orderTotal)]
        │ excess balance stays on the card
        ▼
[After payment succeeds, webhook deducts the applied amount from Sanity]
        │ if balance reaches 0, status flips to 'redeemed'
```

---

## File Structure

```
app/
├── api/
│   ├── gift-cards/
│   │   ├── create-payment-intent/route.ts   ← Purchase PaymentIntent
│   │   └── validate/route.ts                ← Looks up code + balance in Sanity
│   └── webhooks/
│       └── stripe/route.ts                  ← Creates Sanity doc, deducts on redeem
│
components/
└── products/
    └── gift-card-purchase.tsx               ← Purchase form (amount, names, note)

lib/
├── gift-cards.ts                            ← Sanity helpers (create, get, redeem)
└── email/
    └── gift-card-template.ts                ← Recipient + purchaser email templates

studio/
└── schemaTypes/
    └── giftCard.ts                          ← Sanity document type
```

---

## Sanity `giftCard` Document

Visible in Sanity Studio under "Gift Card". Fields:

| Field | Type | Notes |
|---|---|---|
| `code` | string | `STONE-XXXX-XXXX` format, generated server-side |
| `originalAmount` | number | What the purchaser paid (USD) |
| `currentBalance` | number | Remaining unspent balance |
| `status` | `'active'` \| `'redeemed'` \| `'expired'` | Auto-updates when balance reaches 0 |
| `purchaserName` | string | Required from purchase form |
| `purchaserEmail` | string | Required |
| `recipientName` | string? | Optional |
| `recipientEmail` | string | Required |
| `note` | text? | Optional, max 500 chars |
| `paymentIntentId` | string | Stripe PaymentIntent that funded the card |
| `expiresAt` | datetime | +1 year from purchase |
| `redemptions` | array | `{ orderId, amount, redeemedAt }` per use |

Studio preview shows `STONE-XXXX-XXXX  ✅  $100 → $40 left · recipient@example.com`.

---

## File-by-File Breakdown

### 1. `app/api/gift-cards/create-payment-intent/route.ts`

Creates a Stripe PaymentIntent for the purchase. Required: `amount` ($1–$500), `senderName`, `purchaserEmail`, `recipientEmail`. Optional: `recipientName`, `note` (≤ 500 chars). Writes everything to PaymentIntent metadata so the webhook has it on success.

### 2. `app/api/webhooks/stripe/route.ts`

Listens for `payment_intent.succeeded`. Two responsibilities:

**A) Gift card purchase** — when `metadata.order_type === 'gift_card'`:
- Idempotency check: looks up any existing giftCard with this `paymentIntentId`. If found, reuses its `code`.
- Otherwise calls `createGiftCard()` (which generates a unique `STONE-XXXX-XXXX`).
- Sends the recipient email (code + note) and, if buyer ≠ recipient, a purchaser confirmation email.

**B) Gift card redemption** — when `metadata.gift_card_code` and `metadata.gift_card_applied_amount` are present (any order, not just gift card purchases):
- Calls `redeemGiftCard(code, appliedAmount, paymentIntentId)`.
- Atomically deducts from `currentBalance`, appends to `redemptions`, and sets `status='redeemed'` if balance reaches 0.

Signature verification uses `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.

### 3. `app/api/gift-cards/validate/route.ts`

`GET /api/gift-cards/validate?code=STONE-XXXX-XXXX`. Queries Sanity via `getGiftCardByCode()`. Returns `{ valid, code, balance, originalAmount }` on success, or `{ valid: false, error }` if not found / no balance / expired.

### 4. `lib/gift-cards.ts`

Server-only helpers wrapping the Sanity client:

- `generateGiftCardCode()` — random `STONE-XXXX-XXXX` (excludes ambiguous `O/I/0/1`).
- `createGiftCard(input)` — generates a unique code (5 retries on collision) and writes the document.
- `getGiftCardByCode(code)` — single GROQ fetch, normalized to uppercase.
- `redeemGiftCard(code, amount, orderId)` — uses Sanity's `ifRevisionId` for optimistic concurrency. Concurrent redemptions of the same card will surface as a commit error (caller can retry).

### 5. `components/products/gift-card-purchase.tsx`

The purchase UI on `/products/stoneiwc-gift-certificate`. Two steps:

- **Step 1** — amount selector (preset $25/$50/$100/$150/$200 or custom up to $500), "From" block (sender name + purchaser email), "To" block (optional recipient name + recipient email), optional personal note with live character counter.
- **Step 2** — Stripe Elements payment form.

`GIFT_CARD_SLUG = 'stoneiwc-gift-certificate'` lives in `@/lib/constants` and is the single source of truth for the product slug.

### 6. `lib/email/gift-card-template.ts`

Two pairs of HTML/text templates:

- **Recipient email** (`giftCardEmailHtml` / `giftCardEmailText`) — greeting personalized with `recipientName` when present, `senderName` as the giver, optional note rendered in a gold-bordered block, the code, value and expiry. Mentions that unused balance remains.
- **Purchaser confirmation** (`giftCardPurchaseConfirmationHtml` / `giftCardPurchaseConfirmationText`) — sent only when purchaser ≠ recipient. Shows recipient name + email and the value. The code is **never** included for security.

All HTML interpolation goes through an `escapeHtml` helper.

---

## Checkout Integration

### `app/checkout/page.tsx`
- `AppliedGiftCard = { code, balance }` (balance is the remaining unspent amount returned by `validate`).
- `giftCardDiscount = min(balance, subtotal - couponDiscount + shippingCost)` — the card is never charged more than the order total.
- `finalTotal = subtotal - couponDiscount + shippingCost - giftCardDiscount`.

### `components/checkout/SelfCheckoutSection.tsx`
- Apply: calls `/api/gift-cards/validate`, on success stores `{ code, balance }`.
- The applied-amount line shows `-$X applied` plus `· $Y balance remaining` when the card has unspent balance after this order.
- `initializePayment` sends `giftCardCode` and `giftCardAppliedAmount` (the actual discount, not the balance) to the checkout payment-intent API.

### `app/api/checkout/create-stripe-payment-intent/route.tsx`
- Accepts `giftCardCode` and `giftCardAppliedAmount` from the body.
- Writes them to PaymentIntent metadata as `gift_card_code` and `gift_card_applied_amount`. The webhook reads these on success to deduct the balance.

### `components/checkout/CheckoutDetailsSection.tsx`
- Shows `Gift Card (CODE)` and `-$X.XX` discount line in the order summary.

---

## Environment Variables

```env
# Sanity (needed for both read and write — token must allow writes)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=
SANITY_API_TOKEN=                      # write-capable token

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_FRONTEND_URL=
```

---

## Production Deploy Checklist

1. Merge feature branch into `development` (auto-deploys to `dev.stoneiwc.com`).
2. Stripe Dashboard (test mode) → Webhooks → endpoint:
   - URL: `https://dev.stoneiwc.com/api/webhooks/stripe?x-vercel-protection-bypass=<bypass-secret>`
   - Listen for `payment_intent.succeeded`.
   - Copy the signing secret into Vercel `STRIPE_WEBHOOK_SECRET` (Preview scope).
3. Verify `SANITY_API_TOKEN` (write-capable) is set on the Preview environment in Vercel.
4. Test with `4242 4242 4242 4242`: purchase → recipient email arrives → Sanity Studio shows the new gift card → apply at checkout → balance deducts on success.
5. Repeat the webhook setup for production (live mode → `stoneiwc.com`) before going live.

---

## Troubleshooting

**Webhook fired but no Sanity doc and no email** — most often `SANITY_API_TOKEN` is missing on the Preview/Production environment, or the token lacks write permission. Check Vercel function logs for `Gift card Sanity creation error:`.

**Code applies as $0 at checkout** — happens if the validate API returns a stale or zero balance. Check the giftCard document in Sanity Studio: confirm `currentBalance > 0` and `status === 'active'`.

**Recipient never got the email but Sanity doc exists** — Resend domain not verified, the recipient address bounced, or the message was filtered as spam. Check Resend Dashboard → Emails for the delivery status. Verify SPF/DKIM/DMARC for `RESEND_FROM_EMAIL`.

**Webhook returns 401** — `dev.stoneiwc.com` is behind Vercel's Deployment Protection. Use the `?x-vercel-protection-bypass=<secret>` query parameter on the Stripe webhook URL. The secret is configured under Project → Settings → Deployment Protection → Protection Bypass for Automation.

**Concurrent redemptions race** — `redeemGiftCard` uses Sanity's `ifRevisionId` for optimistic concurrency. If two webhook events deduct the same card simultaneously, one will throw on commit. Stripe will retry the failed webhook; the second attempt will see the updated revision and apply cleanly.

**Local development: Stripe CLI** — run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and put the printed `whsec_...` in `.env.local` as `STRIPE_WEBHOOK_SECRET`. Restart `pnpm dev` after the change.

---

## Design Notes

- **Why Sanity, not a relational DB?** The project already runs Sanity for content. Adding a single document type avoids introducing a new dependency, gives non-engineers Studio access for support cases, and the redemption volume is low enough that Sanity's mutation API is more than adequate.
- **Why drop the Stripe Coupon/PromotionCode?** Stripe Coupons have a fixed `amount_off` that can't be changed after creation, which is incompatible with balance-based redemption. We now use Stripe purely for payment processing.
- **Why an `escapeHtml` helper in the email template?** The personal note is free-form user input that goes directly into an HTML email body. Without escaping, a malicious or accidental `<script>` would execute in some mail clients.
