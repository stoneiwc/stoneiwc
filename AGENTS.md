# Stone IWC — Project Reference for Codex

Stone International Wellness Center is a Next.js 16 (App Router) full-stack web application. It covers a product storefront, service appointment booking, educational content, and contact — all backed by Sanity CMS, Stripe, Cal.com, and Resend.

> **New to this codebase?** Start with [`project-documentation/architecture.md`](project-documentation/architecture.md) for the system overview, then [`project-documentation/onboarding.md`](project-documentation/onboarding.md) to get running locally.

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

Per-scope value matrix (Production vs. Preview vs. Development), webhook URLs, and rotation steps: [`project-documentation/environments-and-deployments.md`](project-documentation/environments-and-deployments.md).

---

## Project Structure

```
app/                   Next.js App Router pages + API routes
components/            React components
lib/                   Business logic, API clients, utilities
studio/                Sanity CMS Studio
scripts/               Python scripts for Cal.com event provisioning
project-documentation/ Technical documentation (this index)
public/                Static assets
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
| `POST /api/contact` | Contact form + auto-reply |
| `POST /api/revalidate` | Trigger ISR cache revalidation |

---

## Key Conventions

- **Gift card product slug:** `stoneiwc-gift-certificate` — this slug triggers a special purchase UI. The constant `GIFT_CARD_SLUG` in `components/products/gift-card-purchase.tsx` is the single source of truth.
- **Free Cal.com services:** slugs ending in `-free` display "Free" pricing on the booking page.
- **Consultation-required services:** slugs containing `-consultation-` show a badge and "Price for Consultation" label.
- **Product filters:** stored in URL query params (`?category=X&sort=Y&q=Z`). Default values are not written to the URL.
- **Prices in Stripe:** always in cents (e.g. `$100 → 10000`). Sanity and the cart use dollars.
- **ISR revalidation:** all Sanity queries are tagged. Pages use `export const revalidate = 60`.
- **Webhook idempotency:** Stripe events are de-duplicated by `stripePaymentIntentId` before any Sanity write or email send.
- **Email reply-to:** all transactional emails set `replyTo: CONTACT_EMAIL_TO` so customer replies land in the team inbox.

---

## Documentation Index

Foundation:

| File | Covers |
|------|--------|
| [`architecture.md`](project-documentation/architecture.md) | System map, data flow, integrations, what each service owns |
| [`onboarding.md`](project-documentation/onboarding.md) | First-day setup: clone, install, env, run dev, first test purchase |
| [`environments-and-deployments.md`](project-documentation/environments-and-deployments.md) | Vercel scopes, env var matrix, Stripe test/live split, deploy + rollback |
| [`runbook.md`](project-documentation/runbook.md) | Troubleshooting playbook — common incidents and how to triage |

Integrations:

| File | Covers |
|------|--------|
| [`sanity-cms.md`](project-documentation/sanity-cms.md) | Schemas, GROQ queries, ISR, image handling |
| [`checkout-and-payments.md`](project-documentation/checkout-and-payments.md) | Cart, checkout flow, Stripe Elements, coupons |
| [`orders.md`](project-documentation/orders.md) | Storefront order lifecycle, Sanity tracking, fulfillment |
| [`gift-card.md`](project-documentation/gift-card.md) | Gift card purchase + redemption, balance management |
| [`cal-com-booking.md`](project-documentation/cal-com-booking.md) | Booking page, Cal.com API, slug conventions |
| [`cal-events.md`](project-documentation/cal-events.md) | Provisioning events via Python script |
| [`resend-email.md`](project-documentation/resend-email.md) | Templates, rate limiting, deliverability |
| [`webhooks.md`](project-documentation/webhooks.md) | Stripe webhook handler — events, idempotency, debugging |
| [`seo.md`](project-documentation/seo.md) | Sitemap, robots, JSON-LD, metadata, Search Console |

Workflows & frontend:

| File | Covers |
|------|--------|
| [`content-workflows.md`](project-documentation/content-workflows.md) | Studio user guide: add products/services/images, manage orders + gift cards |
| [`frontend-ui.md`](project-documentation/frontend-ui.md) | Component conventions, Tailwind tokens, fonts, adding pages, forms |

Operational:

| File | Covers |
|------|--------|
| [`security-and-compliance.md`](project-documentation/security-and-compliance.md) | Secrets, PII, rotation, threat model, dependency security |
| [`open-backlog.md`](project-documentation/open-backlog.md) | Known limitations, planned but not built, intentional omissions |

---

## Where to start for common tasks

| If you want to… | Read |
|---|---|
| Understand the system | [`architecture.md`](project-documentation/architecture.md) |
| Set up locally | [`onboarding.md`](project-documentation/onboarding.md) |
| Deploy / manage env vars | [`environments-and-deployments.md`](project-documentation/environments-and-deployments.md) |
| Fix something broken in production | [`runbook.md`](project-documentation/runbook.md) |
| Add a product / service / image | [`content-workflows.md`](project-documentation/content-workflows.md) |
| Modify checkout, payment, or order code | [`checkout-and-payments.md`](project-documentation/checkout-and-payments.md), [`orders.md`](project-documentation/orders.md) |
| Touch the UI / add a page | [`frontend-ui.md`](project-documentation/frontend-ui.md) |
| Debug a webhook | [`webhooks.md`](project-documentation/webhooks.md) + [`runbook.md`](project-documentation/runbook.md) |
| Rotate secrets / handle an incident | [`security-and-compliance.md`](project-documentation/security-and-compliance.md) |
| See what's deliberately not built | [`open-backlog.md`](project-documentation/open-backlog.md) |

---

## Session continuity notes

Two files in `project-documentation/` are **gitignored** and exist only on the maintainer's local machine. Treat them as a private notebook between sessions:

| File | Purpose |
|------|---------|
| [`project-documentation/last-point.md`](project-documentation/last-point.md) | What was done in the previous session + open test cases / follow-ups. Read this at the **start** of every session to recover context. |
| [`project-documentation/execution-map.md`](project-documentation/execution-map.md) | Plan for upcoming sessions: what to tackle next, blockers, reminders. Read alongside `last-point.md`. |

If either file is missing locally, that's expected — they're regenerated each session. Don't commit them; the `.gitignore` entries are intentional. When closing out a working session, update both: refresh `last-point.md` with the new state and amend `execution-map.md` with any new items uncovered during the session.

(Planned: dedicated Claude Code skills — `last-point`, `execution-map`, `commit-style` — to automate this maintenance. To be authored via the Superpowers plugin's `writing-skills` skill.)
