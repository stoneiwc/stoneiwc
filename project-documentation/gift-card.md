# Gift Card System — Technical Documentation

## Overview

The Stone IWC gift card system is built entirely on **Stripe** with no external database. The core idea: when a customer purchases a gift card, a Stripe `PromotionCode` is created and emailed to the recipient. That code can then be applied at checkout as a discount.

No additional database (Sanity or otherwise) is used — Stripe is the single source of truth for all gift card state.

---

## Flow Diagram

```
[Customer purchases a gift card]
        │
        ▼
[create-payment-intent API] ── Creates a Stripe PaymentIntent
        │                       metadata: order_type=gift_card
        │                                 recipient_email=xxx
        │
        ▼
[Stripe processes the payment]
        │
        ▼
[Stripe Webhook fires] ── payment_intent.succeeded event
        │
        ├── Creates a Stripe Coupon (amount_off = gift card value)
        ├── Creates a Stripe PromotionCode (STONE-XXXX-XXXX, max_redemptions=1)
        └── Sends the code to recipient via Resend email
                │
                ▼
        [Recipient receives the code]
                │
                ▼
        [Enters code at checkout]
                │
                ▼
        [validate API] ── Queries Stripe for the code
                │
                ▼
        [If valid, discount is applied to order total]
                │
                ▼
        [After payment, webhook deactivates the promo code]
```

---

## File Structure

```
app/
├── api/
│   ├── gift-cards/
│   │   ├── create-payment-intent/route.ts   ← PaymentIntent for gift card purchase
│   │   └── validate/route.ts                ← Code validation endpoint
│   └── webhooks/
│       └── stripe/route.ts                  ← Stripe webhook handler
│
components/
└── products/
    └── gift-card-purchase.tsx               ← Full purchase flow UI component

lib/
└── email/
    └── gift-card-template.ts                ← Email HTML/text templates
```

---

## File-by-File Breakdown

### 1. `app/api/gift-cards/create-payment-intent/route.ts`

**What it does:** Creates a Stripe PaymentIntent specifically for gift card purchases.

**When it's called:** When the user fills in the amount and email fields on the gift card product page and clicks "Continue to Payment".

**Request body (POST):**
```json
{
  "amount": 100,
  "purchaserEmail": "buyer@example.com",
  "recipientEmail": "recipient@example.com"
}
```

**Validations:**
- `amount` must be between 1 and 500
- `purchaserEmail` must be a valid email
- `recipientEmail` is optional — falls back to `purchaserEmail` if omitted

**Response:**
```json
{ "clientSecret": "pi_xxx_secret_xxx" }
```

**What gets created in Stripe:**
```
PaymentIntent {
  amount: 10000,        // in cents ($100 × 100)
  currency: "usd",
  metadata: {
    order_type: "gift_card",
    customer_email: "buyer@example.com",
    recipient_email: "recipient@example.com",
    gift_card_amount: "100"
  }
}
```

> `order_type: "gift_card"` in the metadata is critical — the webhook uses this to distinguish a gift card purchase from a regular storefront order.

---

### 2. `app/api/webhooks/stripe/route.ts`

**What it does:** Listens for Stripe events. Handles two distinct scenarios:

**A) Gift card purchase (generating a new code):**
- Triggered by a `payment_intent.succeeded` event
- Checks `metadata.order_type === 'gift_card'`
- Generates a random code in `STONE-XXXX-XXXX` format
- Creates a Stripe `Coupon`: `amount_off` = gift card value, `max_redemptions: 1`
- Creates a Stripe `PromotionCode` using that coupon, valid for 1 year
- Sends the code to the recipient email via Resend

**B) Gift card redemption (invalidating a used code):**
- Triggered after any successful payment
- Checks if `metadata.gift_card_promotion_code_id` exists
- If it does, sets that promo code to `active: false` so it can never be reused

**Security:** Every incoming request is verified using `stripe.webhooks.constructEvent` with the `stripe-signature` header. Requests without a valid signature are rejected immediately.

**Code generation:**
```ts
// Visually ambiguous characters (O, I, 0, 1) are excluded
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// Format: STONE-XXXX-XXXX
// Example: STONE-K7MR-P2BN
```

---

### 3. `app/api/gift-cards/validate/route.ts`

**What it does:** Looks up a gift card code in Stripe and returns its validity status.

**When it's called:** When the customer enters a code at checkout and clicks "Apply".

**Request (GET):**
```
GET /api/gift-cards/validate?code=STONE-K7MR-P2BN
```

**Checks performed:**
1. Does this code exist in Stripe?
2. Is it `active: true`?
3. Has `expires_at` passed?
4. Is `times_redeemed < max_redemptions`?

**Success response:**
```json
{
  "valid": true,
  "code": "STONE-K7MR-P2BN",
  "amount": 100,
  "promotionCodeId": "promo_xxx"
}
```

**Failure response examples:**
```json
{ "valid": false, "error": "Gift card not found." }
{ "valid": false, "error": "This gift card has already been redeemed." }
{ "valid": false, "error": "This gift card has expired." }
```

> The `promotionCodeId` is stored in the PaymentIntent metadata when the customer checks out. The webhook uses it after payment to deactivate the code.

---

### 4. `components/products/gift-card-purchase.tsx`

**What it does:** Contains the entire gift card purchase UI. Rendered inside `product-detail.tsx` when the gift card product is viewed.

**Exports:**
- `GIFT_CARD_SLUG = 'stoneiwc-gift-certificate'` — the single source of truth for the gift card product slug. Both `product-card.tsx` and `product-detail.tsx` import this constant.
- `GiftCardPurchase` — the main component

**Step-by-step state flow:**
```
Step 1: User selects amount + enters emails
   ↓ Clicks "Continue to Payment"
Step 2: Calls create-payment-intent → gets clientSecret → Stripe Elements renders
   ↓ User fills in card details and pays
Step 3: Success message is shown
```

**Preset amounts:** $25, $50, $100, $150, $200
**Custom amount:** any value between $1 and $500

**Inner `PaymentForm` component:**
- Uses Stripe's `useStripe()` and `useElements()` hooks
- Flow: `elements.submit()` → `stripe.confirmPayment()`
- Errors are shown inline
- On success, calls the `onSuccess` callback to the parent

---

### 5. `lib/email/gift-card-template.ts`

**What it does:** Generates the HTML and plain text versions of the gift card email.

**Exports:**
- `giftCardEmailHtml(data)` — full HTML email sent via Resend
- `giftCardEmailText(data)` — plain text fallback

**Input data:**
```ts
{
  code: string        // e.g. STONE-K7MR-P2BN
  amount: number      // e.g. 100
  recipientEmail: string
  purchaserEmail: string
  expiresAt: string   // e.g. "May 5, 2027"
}
```

The email design matches the site's color palette: `#1a1a1a` dark background, `#c9a96e` gold accent.

---

## Checkout Integration

Gift card support was added to the existing checkout flow. The following files were modified:

### `app/checkout/page.tsx`
- Added `appliedGiftCard` state: `{ code, amount, promotionCodeId } | null`
- Added `giftCardDiscount` calculation: `Math.min(giftCard.amount, orderTotal)` — the gift card can never reduce the total below zero
- Final total formula: `subtotal - couponDiscount + shippingCost - giftCardDiscount`

### `components/checkout/SelfCheckoutSection.tsx`
- Added gift card input field (below the shipping method selector)
- On "Apply": calls the validate API, applies the card if valid, shows error if not
- Applied card is displayed with a "Remove" button
- `initializePayment` now includes gift card metadata in the PaymentIntent request:
  ```ts
  giftCardCode: appliedGiftCard?.code,
  giftCardPromotionCodeId: appliedGiftCard?.promotionCodeId
  ```

### `components/checkout/CheckoutDetailsSection.tsx`
- Added a gift card discount line to the order summary (below the coupon line)

### `app/api/checkout/create-stripe-payment-intent/route.tsx`
- Added `giftCardCode` and `giftCardPromotionCodeId` to the accepted request body
- These values are written to the PaymentIntent metadata

---

## Products Page Integration

### `components/products/product-card.tsx`
For the product with slug `stoneiwc-gift-certificate`:
- Displays **"From $25"** instead of a fixed price
- Shows a **"Buy"** link button instead of "Add to Cart" (navigates to the product detail page)
- Quantity controls are hidden

### `components/products/product-detail.tsx`
For the product with slug `stoneiwc-gift-certificate`:
- Displays **"From $25"** instead of a fixed price
- Hides the quantity selector and "Add to Cart" button
- Renders `<GiftCardPurchase />` in their place

---

## URL-Based Product Filters (Refactor)

The product filters on `/products` were moved from `useState` to URL query params.

**Before:** Filter state lived only in the client. Refreshing the page or sharing a link lost all filters.

**After:** `/products?category=Hair&sort=price-asc&q=serum`

**Files changed:**
- `components/products/products-grid.tsx`: replaced `useState` with `useSearchParams` + `router.replace`
- `app/products/page.tsx`: wrapped `ProductsGrid` in `<Suspense>` (required by `useSearchParams`)

**URL rules:**
- Default values are never written to the URL (`All`, `featured`, empty search) — keeps URLs clean
- Filter changes use `scroll: false` so the page doesn't jump to the top

---

## Environment Variables

No new environment variables are needed. The existing ones cover everything:

```env
STRIPE_SECRET_KEY=sk_test_xxx                    # Creating coupons, promo codes, webhook verification
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx   # Initializing Stripe Elements on the client
STRIPE_WEBHOOK_SECRET=whsec_xxx                  # Verifying webhook signature
RESEND_API_KEY=re_xxx                            # Sending gift card emails
RESEND_FROM_EMAIL=noreply@stoneiwc.com           # Sender address
NEXT_PUBLIC_FRONTEND_URL=https://stoneiwc.com    # "Shop Now" link inside the email
```

---

## Production Deploy Checklist

1. Merge `dev-gift-card` → `development`
2. `development` deploys to `dev.stoneiwc.com`
3. Go to Stripe Dashboard (sandbox) → Developers → Webhooks → **Add endpoint**
   - URL: `https://dev.stoneiwc.com/api/webhooks/stripe`
   - Event to listen for: `payment_intent.succeeded`
4. Copy the generated `whsec_xxx` value → add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
5. Test with a sandbox card: `4242 4242 4242 4242`
6. Once tests pass, repeat the webhook setup for production (`stoneiwc.com`)

---

## Known Limitations

- **No partial balance:** A gift card is fully consumed on first use. A $100 gift card used on a $60 order loses the remaining $40. Partial balance tracking would require Stripe Customer Balance (future sprint).
- **Webhook is required for code delivery:** Code generation happens inside the webhook handler. If the webhook is not configured before going live, payments will succeed but no code will be sent. Do not go live without setting up the webhook.
- **No race conditions:** `max_redemptions: 1` is enforced by Stripe server-side. Even if two people try to redeem the same code simultaneously, only one will succeed.
