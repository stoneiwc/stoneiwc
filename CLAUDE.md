# Stone IWC — Project Reference for Claude

Stone International Wellness Center is a Next.js 16 (App Router) full-stack web application. It covers a product storefront, service appointment booking, educational content, and contact — all backed by Sanity CMS, Stripe, Cal.com, and Resend.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| CMS | Sanity v3 (Studio at `/studio`) |
| Payments | Stripe v22 |
| Booking | Cal.com v2 API |
| Email | Resend |
| Fonts | Cormorant Garamond (`font-sans`), Lato (`font-body`) |

---

## Dev Commands

```bash
pnpm dev        # Start Next.js with Turbopack
pnpm build      # Production build
pnpm lint       # ESLint

# Sanity Studio (run separately)
cd studio && pnpm dev   # http://localhost:3333
```

---

## Environment Variables

All required variables are listed in `.env.template`. Copy to `.env.local` and fill in:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=
SANITY_API_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=
CONTACT_EMAIL_TO=

# Cal.com
NEXT_PUBLIC_CAL_USERNAME=
CAL_API_KEY=

# App
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## Project Structure

```
app/                  Next.js App Router pages + API routes
components/           React components
lib/                  Business logic, API clients, utilities
studio/               Sanity CMS Studio
scripts/              Python scripts for Cal.com event provisioning
project-documentation/ Technical documentation
public/               Static assets
```

### Key Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Product listing with URL-based filters |
| `/products/[slug]` | Product detail (SSG, revalidate 60s) |
| `/checkout` | Cart checkout with Stripe |
| `/checkout/success` | Post-payment confirmation |
| `/book` | Service booking browser |
| `/book/[slug]` | Individual service booking (Cal.com embed) |
| `/contact` | Contact form |

### Key API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/checkout/create-stripe-payment-intent` | Storefront checkout |
| `POST /api/gift-cards/create-payment-intent` | Gift card purchase |
| `GET  /api/gift-cards/validate` | Validate a gift card code |
| `POST /api/webhooks/stripe` | Stripe event handler |
| `POST /api/validate-coupon` | Validate a Sanity coupon code |
| `GET  /api/shipping-methods` | Fetch active shipping methods |
| `POST /api/contact` | Send contact form email |
| `POST /api/revalidate` | Trigger ISR cache revalidation |

---

## Key Conventions

- **Gift card product slug:** `stoneiwc-gift-certificate` — this slug triggers a special purchase UI. The constant `GIFT_CARD_SLUG` in `components/products/gift-card-purchase.tsx` is the single source of truth.
- **Free Cal.com services:** slugs ending in `-free` display "Free" pricing on the booking page.
- **Consultation-required services:** slugs containing `-consultation-` show a badge and "Price for Consultation" label.
- **Product filters:** stored in URL query params (`?category=X&sort=Y&q=Z`). Default values are not written to the URL.
- **Prices in Stripe:** always in cents (e.g. `$100 → 10000`).
- **ISR revalidation:** all Sanity queries are tagged. Pages use `export const revalidate = 60`.

---

## Documentation Index

| File | Covers |
|------|--------|
| [`project-documentation/gift-card.md`](project-documentation/gift-card.md) | Gift card purchase, webhook, redemption, troubleshooting |
| [`project-documentation/checkout-and-payments.md`](project-documentation/checkout-and-payments.md) | Cart, checkout flow, Stripe, coupons |
| [`project-documentation/cal-com-booking.md`](project-documentation/cal-com-booking.md) | Booking page, Cal.com API, slug conventions, provisioning scripts |
| [`project-documentation/sanity-cms.md`](project-documentation/sanity-cms.md) | Content schemas, GROQ queries, ISR, image handling, products |
| [`project-documentation/resend-email.md`](project-documentation/resend-email.md) | Email templates, rate limiting, adding new email types |
