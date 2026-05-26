# Architecture — System Overview

## What this application is

Stone International Wellness Center (Stone IWC) is a single-tenant Next.js 16 application that combines four business surfaces:

1. **Product storefront** — Sanity-managed products, cart, Stripe checkout, Sanity-mirrored orders, Resend confirmation emails.
2. **Service booking** — Cal.com-hosted bookings embedded under `/book/[slug]`.
3. **Editorial content** — Articles, team bios, hero slides, page images — all in Sanity.
4. **Contact** — Form submission via Resend, with auto-reply to the customer.

Everything is **one Vercel project**, deployed from this repo. There is no separate backend service.

---

## High-level component map

```
┌─────────────────────────── Browser ───────────────────────────┐
│                                                                │
│  Next.js pages (RSC + Client Components)                       │
│  - / /products /book /education /contact ...                   │
│  - Cart context (localStorage-backed)                          │
│  - Stripe Elements (PaymentElement, confirmPayment)            │
│  - Cal.com embed (cal-booker)                                  │
└───────┬────────────────────────────────────┬───────────────────┘
        │                                    │
        │ fetch /api/...                     │ Cal.com iframe
        ▼                                    ▼
┌─────────────── Next.js API routes (Vercel) ──────────────┐  ┌─── Cal.com ───┐
│                                                          │  │  Hosted       │
│  /api/checkout/create-stripe-payment-intent  ── Stripe ──┼──┤  bookings     │
│  /api/gift-cards/create-payment-intent       ── Stripe   │  └───────────────┘
│  /api/gift-cards/validate                    ── Sanity   │
│  /api/validate-coupon                        ── Sanity   │
│  /api/shipping-methods                       ── Sanity   │
│  /api/contact                                ── Resend   │
│  /api/revalidate                             ── Next.js  │
│  /api/webhooks/stripe                ◀── Stripe → us ────┼──┐
│       │                                                  │  │
│       ├── markOrderPaid / markOrderFailed  (Sanity write)│  │
│       ├── redeemGiftCard                    (Sanity)     │  │ Stripe Webhook
│       ├── createGiftCard                    (Sanity)     │  │ delivery
│       └── send order / gift card emails     (Resend)     │  │
└───────────┬──────────────────┬──────────────┬────────────┘  │
            │                  │              │               │
            ▼                  ▼              ▼               │
   ┌─────────────┐      ┌─────────────┐  ┌─────────┐          │
   │   Sanity    │      │   Stripe    │  │ Resend  │          │
   │   (CMS +    │      │  (Payment   │  │ (Email) │          │
   │  Orders +   │      │   intents,  │  │         │          │
   │  Gift cards)│      │   webhooks) │  │         │          │
   └─────────────┘      └──────┬──────┘  └─────────┘          │
                               │                              │
                               └──────────────────────────────┘
```

---

## The four integrations and what each owns

| Integration | What it stores | What it does NOT store |
|---|---|---|
| **Sanity** | Products, categories, articles, team, hero slides, page images, **orders**, **gift cards**, coupons, shipping methods | Payment cards, transaction history (Stripe is the source of truth for the charge itself) |
| **Stripe** | PaymentIntents, charges, refunds, dispute records, customer payment methods | Order fulfillment status, customer addresses (carried only as PI metadata for admin reference) |
| **Cal.com** | Event types, bookings, calendars, scheduling pages | Anything about products or storefront orders |
| **Resend** | Email send logs (Resend dashboard), domain auth records | Templates (those live in this repo at `lib/email/`) |

This separation matters: **Sanity is the canonical source for the order**, Stripe is the canonical source for the charge. The two are linked by `stripePaymentIntentId`.

---

## End-to-end flows

### Storefront purchase

```
1. Browser: customer adds items, applies coupon on /view-cart (cart context persisted to localStorage)
2. Browser: customer fills checkout form on /checkout, optionally applies gift card
3. Browser → POST /api/checkout/create-stripe-payment-intent
     ├── server creates Stripe PaymentIntent (amount = final discounted total in cents)
     ├── server enriches PI metadata: ship_*, items_summary, coupon_code, gift_card_code
     └── server creates Sanity `order` doc with status='pending'
4. Browser: Stripe Elements renders, customer confirms payment
5. Stripe → POST /api/webhooks/stripe (event: payment_intent.succeeded)
     ├── markOrderPaid → Sanity order status='paid', paidAt=now
     ├── if gift card: redeemGiftCard → Sanity balance updated
     └── Resend → order confirmation email to customer
6. Browser → /checkout/success?payment_intent=... (cart cleared)
```

Detailed: [orders.md](orders.md), [checkout-and-payments.md](checkout-and-payments.md).

### Gift card purchase

A separate flow under `/products/stoneiwc-gift-certificate`. The product detail page renders a special purchase UI ([gift-card.md](gift-card.md)). Gift cards do NOT create order documents — they get their own Sanity `giftCard` document on `payment_intent.succeeded`.

### Service booking

```
1. Browser: customer browses /book or /book/[slug]
2. Page server-fetches the Cal.com event type (lib/cal-api.ts)
3. Page renders <CalBooker> which embeds Cal.com's hosted scheduling
4. Customer books inside the embed → Cal.com handles confirmation, calendar invites
   (the storefront has no further role)
```

Detailed: [cal-com-booking.md](cal-com-booking.md).

### Contact form

```
1. Browser → POST /api/contact (rate-limited by IP)
2. Server sends two emails via Resend:
   ├── Internal: to CONTACT_EMAIL_TO (info@), reply-to set to the customer
   └── Auto-reply: to the customer ("we received your message"), reply-to set to info@
```

Detailed: [resend-email.md](resend-email.md).

---

## Data flow direction summary

```
Read (CDN-cached, ISR):
   Sanity ──► Next.js pages (revalidate 60s, tag-based invalidation)

Write — from customer browser:
   Browser ──► API route ──► Stripe (PaymentIntent.create)
                          ──► Sanity (createPendingOrder)
                          ──► Resend (contact form only)

Write — from Stripe (asynchronous):
   Stripe ──► /api/webhooks/stripe ──► Sanity (mark paid, redeem gift card)
                                    ──► Resend (order / gift card emails)

Write — from staff:
   Sanity Studio ──► Sanity dataset (products, articles, fulfillment updates)
```

The frontend **never writes to Sanity directly**. All writes go through API routes that hold the `SANITY_API_TOKEN` with Editor permission server-side.

---

## Key conventions (used throughout the codebase)

| Convention | Where |
|---|---|
| Prices are stored in **dollars** in Sanity and the cart, converted to **cents** only at the Stripe boundary (`Math.round(amount * 100)`) | [`create-stripe-payment-intent/route.tsx`](../app/api/checkout/create-stripe-payment-intent/route.tsx) |
| Gift card product is identified by the slug `stoneiwc-gift-certificate` (single source of truth: `GIFT_CARD_SLUG`) | [`components/products/gift-card-purchase.tsx`](../components/products/gift-card-purchase.tsx) |
| Cal.com slugs ending in `-free` render as "Free", containing `-consultation-` show "Price for Consultation" | [`cal-com-booking.md`](cal-com-booking.md) |
| All ISR pages: `export const revalidate = 60` + Sanity queries tagged with their schema name | [`sanity-cms.md`](sanity-cms.md) |
| Gift cards apply only to merchandise (capped at `subtotal - couponDiscount`); shipping is always paid → no $0 orders | [`orders.md`](orders.md) |
| Webhooks are idempotent: order/gift card lookups happen by `stripePaymentIntentId` before any write | [`webhooks.md`](webhooks.md) |
| `replyTo: CONTACT_EMAIL_TO` on all transactional emails to improve inbox placement | [`resend-email.md`](resend-email.md) |
| Product / coupon / shipping data is server-fetched via API routes (never client-direct to Sanity) to keep dataset auth private | [`sanity-cms.md`](sanity-cms.md) |

---

## Where things live (file layout)

```
app/
├── api/                          Server routes (Stripe, Sanity writes, contact)
│   ├── checkout/                 Storefront payment intent + status helpers
│   ├── gift-cards/               Gift card PI creation + validation
│   ├── webhooks/stripe/          Single Stripe webhook handler (both events + gift cards)
│   ├── contact/                  Contact form + auto-reply
│   ├── validate-coupon/          Coupon code check (server-only Sanity access)
│   ├── shipping-methods/         Active shipping options
│   └── revalidate/               On-demand ISR revalidation hook
├── products/                     Listing + detail pages (SSG + ISR)
├── checkout/                     Cart checkout + success page
├── book/                         Service booking pages (Cal.com embed)
├── view-cart/                    Standalone cart page (coupon application lives here)
├── education/                    Articles + certifications
├── about/  featured/  services/  Editorial pages
├── contact/                      Contact form
├── sitemap.ts  robots.ts         SEO surface
└── layout.tsx                    Root layout (CartProvider lives here)

components/
├── checkout/                     SelfCheckoutSection, CheckoutDetailsSection
├── products/                     Listing grid, filters, gift-card-purchase
├── home/  education/  contact/   Page-specific composites
├── seo/                          JSON-LD components
├── ui/                           shadcn/ui primitives
├── cart-sheet.tsx                Slide-over cart
├── cal-booker.tsx                Cal.com embed wrapper
├── footer.tsx  navbar.tsx        Layout chrome
└── ...

lib/
├── sanity.client.ts              Sanity client (write-capable on server)
├── sanity.queries.ts             All GROQ queries + TypeScript types
├── sanity.image.ts               urlFor() image builder
├── cart-context.tsx              Cart state + localStorage persistence
├── orders.ts                     createPendingOrder, markOrderPaid, markOrderFailed
├── gift-cards.ts                 createGiftCard, getGiftCardByCode, redeemGiftCard
├── cal-api.ts                    Cal.com REST client
├── products.ts                   Product type definitions (frontend shape)
├── navigation.ts                 Header/footer link config
├── email/                        Resend templates + rate limiter
└── utils.ts  constants.ts

studio/
├── sanity.config.ts              Studio structure (custom sidebar tree)
└── schemaTypes/                  Document schemas (product, order, giftCard, ...)

scripts/
└── cal_events_*.py               Cal.com event provisioning (Python, runs locally)

project-documentation/            This documentation
public/                           Static assets, favicons, OG images
```

---

## Environments (development → production)

| Branch | Vercel scope | Domain | Stripe mode | Purpose |
|---|---|---|---|---|
| `development` | Preview (aliased) | `dev.stoneiwc.com` | Test (`sk_test_…`) | Integration / staging |
| `main` | Production | `stoneiwc.com` | Live (`sk_live_…`) | Customer-facing |
| feature branch | Preview (auto URL) | `…vercel.app` | Test | PR previews |

Vercel env vars are scoped: each variable can hold different values per scope. See [environments-and-deployments.md](environments-and-deployments.md) for the full matrix and setup steps.

---

## What this architecture deliberately does NOT do (yet)

- **No customer accounts.** Orders are tied to email, not user IDs. Order history page would require auth (planned, not built).
- **No abandoned-cart cleanup.** Pending orders sit in Sanity forever unless an admin deletes them, or a future Vercel Cron sweeps them.
- **No server-side price re-validation.** The server trusts client-sent item prices. A determined attacker could send a low `totalAmount`. (Mitigated only by Sanity being read-only client-side and Stripe enforcing the charge amount exactly.)
- **No inventory tracking.** Sanity has `inStock` boolean per product but no quantity counter, no decrement on purchase.
- **No multi-currency.** USD only, hardcoded.
- **No analytics SDK.** Only Vercel's built-in deployment metrics.

These are documented in [open-backlog.md](open-backlog.md) so successors know what's intentional vs. unfinished.

---

## Where to go next

| If you want to… | Read |
|---|---|
| Set up the project locally | [onboarding.md](onboarding.md) |
| Understand deploy + env config | [environments-and-deployments.md](environments-and-deployments.md) |
| Debug a production issue | [runbook.md](runbook.md) |
| Add a product, service, or image | [content-workflows.md](content-workflows.md) |
| Modify the checkout flow | [checkout-and-payments.md](checkout-and-payments.md) + [orders.md](orders.md) |
| Add a new page or component | [frontend-ui.md](frontend-ui.md) |
| Debug a webhook | [webhooks.md](webhooks.md) |
