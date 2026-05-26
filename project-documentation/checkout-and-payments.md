# Checkout & Payments — Technical Documentation

## Overview

The checkout system combines a client-side cart (React Context + localStorage), Sanity-managed coupons and shipping methods, Stripe for payment processing, and a webhook handler that triggers post-payment side effects (gift card code delivery).

---

## Cart System

**File:** `lib/cart-context.tsx`

The cart is a React Context backed by a `useReducer`. It persists to `localStorage` under the key `stone-iwc-cart` so the cart survives page refreshes.

**State shape:**
```ts
{
  items: CartItem[]          // { product: Product, quantity: number }[]
  isOpen: boolean            // drawer open/closed
  appliedCoupon: AppliedCoupon | null
}
```

**Derived values (computed in context):**
```ts
totalItems     // sum of all quantities
subtotal       // sum of (price × quantity) for all items
discountAmount // coupon discount applied to subtotal
totalPrice     // subtotal - discountAmount
```

**Available actions:**
- `addItem(product, quantity?)` — adds or increments
- `removeItem(productId)`
- `updateQuantity(productId, quantity)` — quantity 0 removes the item
- `clearCart()` — called on checkout success
- `applyCoupon(coupon)` / `removeCoupon()`
- `openCart()` / `closeCart()`

> The cart does **not** store gift card state — gift cards are applied at the checkout page level, not in the cart context.

---

## Coupon System

Coupons are managed in Sanity (type: `coupon`) and validated server-side.

**Sanity fields:** `code`, `description`, `type` (`percentage` | `fixed`), `value`, `minSubtotal`, `isActive`

**Validation endpoint:** `POST /api/validate-coupon`

```json
// Request
{ "code": "SUMMER20", "subtotal": 85.00 }

// Success response
{ "code": "SUMMER20", "description": "...", "type": "percentage", "value": 20 }

// Error responses
{ "error": "Coupon not found" }
{ "error": "Minimum subtotal of $50.00 required" }
```

**Discount calculation (in cart context):**
- `percentage`: `subtotal × (value / 100)`
- `fixed`: `value` (capped at subtotal)

---

## Checkout Flow — End to End

### Step 1: Checkout Page (`app/checkout/page.tsx`)

Server-side: empty. All state lives client-side.

Local state managed here:
- `shippingMethod` + `shippingCost` (updated by `SelfCheckoutSection`)
- `appliedGiftCard: { code, amount, promotionCodeId } | null`

**Final total formula:**
```ts
giftCardDiscount = Math.min(appliedGiftCard.amount, subtotal - couponDiscount + shippingCost)
finalTotal = Math.max(0, subtotal - couponDiscount + shippingCost - giftCardDiscount)
```

Both `SelfCheckoutSection` (left column) and `CheckoutDetailsSection` (right column) receive `finalTotal`, `appliedGiftCard`, and `giftCardDiscount` as props.

---

### Step 2: Customer Form (`SelfCheckoutSection.tsx`)

Collects:
- Email, first name, last name, phone
- Billing address (line1, line2, city, state, postal code, country)
- Shipping address (or "same as billing" toggle)
- Shipping method (radio list fetched from `/api/shipping-methods`)
- Gift card code input (validated live against `/api/gift-cards/validate`)

On "Continue to Payment":
1. `POST /api/checkout/retrieve-stripe-publishable-key` → gets `publishableKey`
2. `POST /api/checkout/create-stripe-payment-intent` → gets `clientSecret`
3. Stripe Elements (`<PaymentElement>`) renders

---

### Step 3: Payment Intent Creation (`app/api/checkout/create-stripe-payment-intent/route.tsx`)

**Request body:**
```ts
{
  items: { id, name, price, quantity }[]
  shippingMethod: string
  shippingCost: number
  taxAmount?: number
  processingFee?: number
  shippingAddress: { firstName, lastName, address, city, state, zipCode, country }
  billingAddress: { firstName, lastName, address, city, state, zipCode, country }
  totalAmount: number           // already discounted final total
  email: string
  giftCardCode?: string         // if a gift card was applied
  giftCardPromotionCodeId?: string
}
```

**What gets created in Stripe:**
```
PaymentIntent {
  amount: totalAmount × 100,   // in cents
  currency: "usd",
  receipt_email: email,
  metadata: {
    order_type: "storefront",
    items_count: "3",
    customer_email: "...",
    shipping_method: "standard",
    shipping_cost: "9.99",
    processing_fee: "0.00",
    tax_amount: "0.00",
    gift_card_code: "STONE-XXXX-XXXX",           // if applied
    gift_card_promotion_code_id: "promo_xxx"      // if applied
  }
}
```

> `totalAmount` already has the gift card discount subtracted — the PaymentIntent amount is the actual charge to the customer's card.

---

### Step 4: Payment Confirmation

Stripe Elements handles card input. On submit:
```ts
await elements.submit()
await stripe.confirmPayment({ elements, redirect: 'if_required', ... })
```

On success:
- Redirects to `/checkout/success?payment_intent=pi_xxx`
- Success page calls `GET /api/checkout/retrieve-stripe-payment-intent-status?payment_intent=pi_xxx`
- Verifies `status === "succeeded"`, shows confirmation, clears cart

---

### Step 5: Stripe Webhook (`app/api/webhooks/stripe/route.ts`)

Fires on `payment_intent.succeeded`. Two responsibilities:

**A) Gift card redemption** (any order type):
- If `metadata.gift_card_promotion_code_id` exists → `stripe.promotionCodes.update(id, { active: false })`
- This prevents the code from being reused

**B) Gift card creation** (gift card orders only):
- If `metadata.order_type === "gift_card"` → generate `STONE-XXXX-XXXX` code, create Stripe Coupon + PromotionCode, send email via Resend

See `project-documentation/gift-card.md` for full webhook details.

---

## Order Summary (`CheckoutDetailsSection.tsx`)

Displays in order:
1. Item list (name, qty, price)
2. Subtotal
3. Coupon discount (if any) — `Coupon (CODE): -$XX`
4. Gift card discount (if any) — `Gift Card (STONE-XXXX): -$XX`
5. Shipping (method name + cost)
6. **Total**

---

## Shipping Methods

Fetched from Sanity at checkout load time via `GET /api/shipping-methods`.

**Sanity fields:** `id` (slug), `name`, `description`, `cost`, `isActive`, `order`

Only `isActive == true` methods are returned, sorted by the `order` field.

The selected method ID is saved to `localStorage` (`selectedShippingMethod`) so it persists across the checkout steps. Cleared on successful payment.

---

## Local Development

Stripe webhook cannot be tested on `localhost` without forwarding. Options:

1. **Stripe CLI** (recommended for local):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed `whsec_xxx` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

2. **Deployed preview URL** (`dev.stoneiwc.com`):
   Register the webhook endpoint in Stripe Dashboard → Developers → Webhooks.
   See the gift card deploy checklist for full steps.

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC.
