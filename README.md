# Stone International Wellness Center

Official website for [Stone International Wellness Center](https://stoneiwc.com) — a full-stack Next.js application covering a product storefront, service appointment booking, educational content, and contact.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| CMS | Sanity v3 |
| Payments | Stripe v22 |
| Booking | Cal.com v2 API |
| Email | Resend |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Sanity project
- Stripe account
- Cal.com account
- Resend account

### Installation

```bash
git clone https://github.com/stoneiwc/stoneiwc.git
cd stoneiwc
pnpm install
```

### Environment Variables

Copy `.env.template` to `.env.local` and fill in all values:

```bash
cp .env.template .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version |
| `SANITY_API_TOKEN` | Sanity API token (for revalidation) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender email address |
| `CONTACT_EMAIL_TO` | Destination for contact form emails |
| `NEXT_PUBLIC_CAL_USERNAME` | Cal.com username |
| `CAL_API_KEY` | Cal.com API key |
| `NEXT_PUBLIC_FRONTEND_URL` | App base URL (e.g. `http://localhost:3000`) |

### Development

```bash
# Start the Next.js app
pnpm dev

# Start Sanity Studio (separate terminal)
cd studio && pnpm dev   # http://localhost:3333
```

---

## Project Structure

```
app/                   Next.js App Router pages and API routes
components/            React components organized by feature
hooks/                 Shared custom React hooks
lib/                   Business logic, API clients, utilities
  email/               Email templates (Resend)
studio/                Sanity CMS Studio
scripts/               Python scripts for Cal.com event provisioning
public/                Static assets
project-documentation/ Technical documentation
```

---

## Key Features

- **Product Storefront** — Browse and purchase products with cart, coupons, and Stripe checkout
- **Gift Cards** — Purchase gift cards online; codes delivered via email and redeemable at checkout
- **Service Booking** — Browse and book appointments via Cal.com embed
- **Educational Content** — Articles, certifications, and cupping resources managed in Sanity
- **Contact Form** — Rate-limited contact form with email notifications via Resend

---

## Documentation

Detailed technical documentation is in `project-documentation/`:

| File | Covers |
|------|--------|
| [`sanity-cms.md`](project-documentation/sanity-cms.md) | Content schemas, GROQ queries, ISR, image handling |
| [`checkout-and-payments.md`](project-documentation/checkout-and-payments.md) | Cart, checkout flow, Stripe, coupons, shipping |
| [`gift-card.md`](project-documentation/gift-card.md) | Gift card purchase, webhook, redemption, troubleshooting |
| [`cal-com-booking.md`](project-documentation/cal-com-booking.md) | Booking pages, Cal.com API, slug conventions, scripts |
| [`resend-email.md`](project-documentation/resend-email.md) | Email templates, rate limiting, adding new email types |

---

## License

Private — all rights reserved.
