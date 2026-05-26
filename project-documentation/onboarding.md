# Onboarding — First Day Setup

A walk-through for a new engineer joining the project. By the end of this you should have the storefront running locally with hot reload, the Studio open in another tab, and a Stripe test purchase going end to end.

Estimated time: **45–60 minutes** if you have access to all the dashboards listed below.

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | 20.x or 22.x LTS | Next.js 16 runtime |
| pnpm | 9.x or newer | Package manager (lockfile is `pnpm-lock.yaml`) |
| Git | any | |
| A code editor | VS Code recommended | The repo has no editor lock-in |
| Stripe CLI (optional) | latest | For local webhook forwarding |
| Python 3.11+ (optional) | for `scripts/` | Only needed if you'll provision Cal.com events |

You will also need accounts (or invites) to:

- **Sanity** — the project's dataset
- **Stripe** — at least Test mode access
- **Resend** — send domain access (or just an API key)
- **Cal.com** — the team account (`stoneiwc` username)
- **Vercel** — the project (for env vars + deploys)

Ask the maintainer for invites before starting.

---

## 1. Clone & install

```bash
git clone https://github.com/stoneiwc/stoneiwc.git
cd stoneiwc
pnpm install
```

The Studio has its own `package.json`. Install it too:

```bash
cd studio
pnpm install
cd ..
```

---

## 2. Environment variables

Copy the template and fill it in:

```bash
cp .env.template .env.local
```

Then populate each variable. Sources:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity Manage → Project → API → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (the only dataset) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | A date string like `2024-10-01`. Match the one in [`lib/sanity.client.ts`](../lib/sanity.client.ts) |
| `SANITY_API_TOKEN` | Sanity Manage → Project → API → Tokens → create one with **Editor** permission |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → **Test mode** → Developers → API keys → `sk_test_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same screen, `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | See "Stripe webhook (local)" section below |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | `info@stoneiwc.com` (must be a verified domain) |
| `CONTACT_EMAIL_TO` | `info@stoneiwc.com` |
| `NEXT_PUBLIC_CAL_USERNAME` | `stoneiwc` |
| `CAL_API_KEY` | Cal.com → Settings → Developer → API keys |
| `NEXT_PUBLIC_FRONTEND_URL` | `http://localhost:3000` for local |

The Studio also needs its own copy of the Sanity project ID + dataset. Create `studio/.env`:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

(Same values as the root, no token.)

---

## 3. Run the app

In two terminals:

```bash
# Terminal A — the storefront
pnpm dev
# → http://localhost:3000

# Terminal B — the Studio
cd studio && pnpm dev
# → http://localhost:3333
```

You should see:
- `localhost:3000` renders the homepage with hero, featured products, etc. Content comes from Sanity.
- `localhost:3333` shows the Studio with the structured sidebar (Pages → Home / About / …, Products, Gift Cards, Orders, etc.).

If the storefront renders an empty page or 500s, the most common cause is missing/wrong Sanity env vars. Check the terminal for the actual error.

---

## 4. Stripe webhook (local)

The webhook handler at [`/api/webhooks/stripe`](../app/api/webhooks/stripe/route.ts) is required for orders to flip from `pending` to `paid` after checkout, and for gift card balance updates. To exercise this locally:

### Option A — Stripe CLI (recommended)

Install the Stripe CLI ([stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)), then:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret (`whsec_…`). Copy that into your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart `pnpm dev`. Now every Stripe event in your account will be relayed to local.

### Option B — Skip webhooks locally

If you only need to test checkout UI without the backend side effects (Sanity order, emails), you can omit `STRIPE_WEBHOOK_SECRET`. The PaymentIntent will still create and Stripe will still charge the test card — but Sanity won't get the `paid` status update and no email will go out. The route will throw on missing secret if the webhook is hit, but Stripe can't reach `localhost` without forwarding anyway.

---

## 5. Make a test purchase

1. Open `localhost:3000/products` — pick any product, add to cart.
2. Click cart icon → "View Cart" → optionally apply a coupon (Sanity Studio → Coupons → check what codes exist).
3. Click "Checkout" → fill the form → "Continue to Payment".
4. Card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
5. After success, verify:
   - Studio → Orders shows a new doc with status `paid`
   - Stripe Dashboard → Test mode → Payments shows the PaymentIntent
   - Your email (the one you typed) received the order confirmation (sent via Resend)

If status stays `pending`, the webhook didn't reach you — check Terminal B (`stripe listen` output) and Vercel function logs.

Detailed test scenarios: [runbook.md](runbook.md#test-scenarios) and the gift card flow in [gift-card.md](gift-card.md).

---

## 6. Make a test booking

1. Open `localhost:3000/book` — see the service list (comes from Cal.com via [`lib/cal-api.ts`](../lib/cal-api.ts)).
2. Click a service. The Cal.com booking embed should appear under `/book/[slug]`.
3. You can book a slot — it'll appear in the team's Cal.com calendar.

If the embed shows blank, check `NEXT_PUBLIC_CAL_USERNAME` and `CAL_API_KEY` in `.env.local`.

---

## 7. Common project conventions to know

These are the things you'll trip over in week 1 if you don't know them:

| Convention | Source |
|---|---|
| **Prices in dollars everywhere**, converted to cents only at the Stripe API call | [`create-stripe-payment-intent/route.tsx`](../app/api/checkout/create-stripe-payment-intent/route.tsx) |
| **The gift card is a Sanity product** with the slug `stoneiwc-gift-certificate`. Don't rename it. | [`components/products/gift-card-purchase.tsx`](../components/products/gift-card-purchase.tsx) |
| **Cart state is in React context + localStorage**, no server session. | [`lib/cart-context.tsx`](../lib/cart-context.tsx) |
| **All Sanity reads are server-side** through [`lib/sanity.queries.ts`](../lib/sanity.queries.ts). No client `useEffect` fetch from Sanity. |
| **ISR with `revalidate = 60`** on most pages — your changes in Studio take up to a minute to appear (or trigger `/api/revalidate`). |
| **Studio structure is manual** — adding a schema requires registering in 3 places. See [`sanity-cms.md`](sanity-cms.md). |
| **Webhook is idempotent** — re-delivering a Stripe event doesn't double-redeem a gift card. |
| **Email send failures are logged but don't break checkout** — customer always sees success after payment, even if Resend hiccups. |

---

## 8. Git workflow

| Branch | Purpose |
|---|---|
| `main` | Production — deploys to `stoneiwc.com` |
| `development` | Staging — deploys to `dev.stoneiwc.com` |
| feature branches | PR previews (auto Vercel URL) |

Typical flow:
```bash
git checkout development
git pull
git checkout -b feat/my-thing
# … work …
git push -u origin feat/my-thing
gh pr create --base development
```

Production: merge `development` → `main` only after `dev.stoneiwc.com` smoke test. See [environments-and-deployments.md](environments-and-deployments.md#production-merge-checklist).

Commit style (observed from history): Conventional commits — `feat(scope):`, `fix(scope):`, `docs(scope):`. Body explains the "why", wrapped at ~72 chars. No "Co-Authored-By" trailer.

---

## 9. Where to keep digging

| You need to… | Read |
|---|---|
| Understand the system at a high level | [architecture.md](architecture.md) |
| Deploy, manage env vars, separate test vs live | [environments-and-deployments.md](environments-and-deployments.md) |
| Add a product, service, or image | [content-workflows.md](content-workflows.md) |
| Fix a broken order / spam email / failed webhook | [runbook.md](runbook.md) |
| Touch the checkout or payment code | [checkout-and-payments.md](checkout-and-payments.md), [orders.md](orders.md), [gift-card.md](gift-card.md) |
| Touch the UI | [frontend-ui.md](frontend-ui.md) |
| Understand the webhook handler | [webhooks.md](webhooks.md) |

Have a question that's not in the docs? Add it to the docs after you find the answer. Successors will thank you.
