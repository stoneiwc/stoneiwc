# Open Backlog & Known Limitations

What's intentionally not built (yet), what's missing but minor, and what would be nice. Useful for a successor who needs to know "is this a bug or just a known gap?"

Grouped by area, ordered roughly by impact. Items here are NOT blocking production — the site works without them.

---

## Storefront / orders

### Abandoned cart cleanup

**What:** Pending order documents in Sanity stay forever if the customer never confirms payment.

**Why open:** Not enough volume yet to be a real problem. They're easy to filter (status = pending, older than 24h) and bulk-delete manually.

**Future fix:** A Vercel Cron job that runs daily, finds `pending` orders older than 24 hours, and deletes them. ~20 lines of code. Add to [`app/api/cron/cleanup-pending-orders/route.ts`](../app/api/cron/), wire up in `vercel.json`'s `crons` config.

### Customer order history page

**What:** No `/account/orders` page. Customers can't see past purchases.

**Why open:** Would require user authentication, which we don't have. Adding auth is a meaningful project (Clerk / NextAuth / Sanity auth all possibilities).

**Future fix:** Add auth (Clerk recommended on Vercel — Marketplace integration). Then query Sanity by `customer.email` for the order list. Email confirmation already contains the order number for one-off lookup.

### Custom shipping notification email

**What:** When the order status flips to `shipped`, no email is sent. Customer has to check Sanity-managed tracking — which they don't have access to.

**Why open:** Time/priority — order confirmation was the higher-priority email.

**Future fix:** Send a Resend email from [`lib/orders.ts`](../lib/orders.ts) when status transitions to `shipped`. Template: `lib/email/order-shipped-template.ts`. Trigger: either a Sanity webhook (preferred — fires on the actual status change in Studio) or a polling cron.

### Inventory / stock tracking

**What:** Products have `inStock: boolean` but no quantity. Selling out doesn't auto-flip the flag.

**Why open:** Not enough scale to warrant quantity tracking. Easy to set `inStock: false` manually.

**Future fix:** Add `quantity` field to Sanity product schema. Decrement on `markOrderPaid` (atomically per item, with concurrency guards similar to gift card redemption). Show "X left" badge under low-stock threshold.

### `payment_intent.canceled` not subscribed in Stripe

**What:** The webhook handler marks a pending order `cancelled` on `payment_intent.canceled` (checkout also cancels the PaymentIntent itself when it can't record the order). Neither Stripe webhook endpoint is subscribed to that event yet, so those orders stay `pending`.

**Fix (Dashboard only):** Stripe → Developers → Webhooks → each endpoint (Test and Live) → add `payment_intent.canceled`. See [webhooks.md](webhooks.md#stripe-webhook-configuration-dashboard).

---

## Gift cards

### No "resend gift card email" button

**What:** If a recipient loses the email or the original send bounced, there's no UI to resend. An admin has to email the code manually.

**Future fix:** Add a Studio action (Sanity has a "Document actions" API) that calls a new `/api/gift-cards/resend-email` endpoint.

### No expiry warning emails

**What:** Gift cards default to 1-year expiry. We don't warn the recipient or purchaser as the date approaches.

**Future fix:** Vercel Cron job, daily query for cards expiring in 30 / 7 / 1 days, send reminder email.

### No multi-currency

**What:** Gift cards are USD-only. So is the rest of the site.

**Future fix:** Not a near-term need — Stone IWC is US-based.

---

## Bookings (Cal.com)

### No record of bookings in Sanity

**What:** Bookings stay in Cal.com. The storefront has no view of who booked what.

**Mitigation:** Admins can use Cal.com directly for booking management.

**Future fix:** Subscribe to Cal.com webhooks, mirror bookings into Sanity similarly to how orders are mirrored.

### Manual event provisioning

**What:** Adding bookable services requires either using Cal.com's UI or running the Python script in [`scripts/`](../scripts/). No Studio integration.

**Future fix:** A Sanity-based service catalog that auto-syncs to Cal.com via API. Significant project — out of scope.

---

## Email / Resend

### Single email domain

**What:** All emails come from `info@stoneiwc.com`. No transactional / marketing separation.

**Why open:** Small enough scale that one domain works. Mixing transactional with marketing risks deliverability.

**Future fix:** Use a separate subdomain for marketing (`mail.stoneiwc.com`) with separate Resend domain auth. Transactional stays on `info@`.

### No email click/open tracking

**What:** Resend supports it; we haven't enabled it.

**Why open:** Privacy + complexity tradeoff. Customer transactional emails don't need it.

---

## SEO

### Sanity webhook → revalidate not wired

**What:** The code side is done: every content query is cached and tagged, and `/api/revalidate` covers every cached type ([`lib/sanity-tags.ts`](../lib/sanity-tags.ts)). The webhook itself isn't configured in Sanity yet, so pages still refresh on the 60-second cycle.

**Fix:** Create the webhook in sanity.io/manage and set `SANITY_WEBHOOK_SECRET` (steps in [sanity-cms.md](sanity-cms.md#on-demand-revalidation-sanity-webhook)). Once publishes refresh pages within seconds, raise `CONTENT_REVALIDATE_SECONDS` and the pages' `revalidate` from 60 to 3600.

### No automated sitemap submission

**What:** Sitemap is generated at [`app/sitemap.ts`](../app/sitemap.ts) but not submitted to Google Search Console automatically.

**Future fix:** One-time submission via Search Console UI is enough; subsequent crawls find it via robots.txt. Doc this in [seo.md](seo.md) "post-deploy steps".

### No Schema.org structured data on every page

**What:** Product detail pages have JSON-LD via [`components/seo/`](../components/seo/), but `Organization`, `BreadcrumbList`, `FAQPage` etc. aren't everywhere they could be.

**Future fix:** Audit with Google Rich Results Test, add structured data where it boosts SERP appearance.

---

## Frontend

### No dark mode

**What:** CSS tokens for dark mode are defined but no toggle. Customers see only light.

**Why open:** Design choice — restrained, editorial look is light-first.

**Future fix:** Add a `<ThemeProvider>` consumer to layout, a toggle in the navbar/footer, use `next-themes` package.

### No accessibility audit performed

**What:** No formal a11y review. Lighthouse score may be in the 80s.

**Future fix:** Run Lighthouse, fix top issues (typically contrast, missing labels). See [frontend-ui.md](frontend-ui.md#accessibility-checklist).

### No image optimization beyond Next.js defaults

**What:** Sanity images go through `urlFor()` with manual width/height. Could use responsive `srcset` more aggressively.

**Future fix:** Use `next/image` with `sizes` prop on every product/article image — it generates the responsive set automatically.

---

## DevOps / observability

### No structured error logging beyond `console.error`

**What:** Failures are logged with `console.error(...)` and end up in Vercel function logs. No error aggregation (Sentry, Datadog, etc.).

**Future fix:** Install Sentry (Vercel Marketplace one-click). Wrap critical paths (webhook, checkout) with error boundaries that report.

### No CI / pre-merge checks

**What:** No GitHub Actions workflow. No PR builds beyond what Vercel does. `pnpm lint` runs (ESLint 9 + `eslint-config-next`, `eslint.config.mjs`), but it still reports pre-existing errors (unescaped apostrophes in page copy, `any` types and setState-in-effect in checkout), so it can't gate merges yet.

**Future fix:** Clear the existing lint errors, then add a workflow that runs `pnpm lint`, `pnpm test`, `pnpm tsc --noEmit` and `pnpm build` on every PR, and block merging on failure.

### Test coverage is partial

**What:** Vitest (`pnpm test`) covers the money path and API plumbing: server pricing, gift card math and redemption, the Stripe webhook handler, rate limiting, `/api/revalidate` and the Cal.com client (`lib/__tests__/`). Nothing yet covers the React components, `lib/cart-context.tsx`, or a full checkout against Stripe test mode, and nothing runs the tests automatically (see "No CI / pre-merge checks").

**Future fix:** Run `pnpm test` in CI. Add tests for `lib/orders.ts` (`recoverPaidOrder`, `createPendingOrder`) and the cart's coupon math, then a Playwright smoke test of a test-mode checkout.

### Vercel CLI is outdated locally

**What:** `vercel` CLI on developer machines is older than `vercel@latest`. Some commands miss newer features.

**Future fix:** `pnpm add -g vercel@latest` (or npm equivalent). Document in [onboarding.md](onboarding.md).

---

## Security

### `SANITY_API_TOKEN` shared across environments

**What:** Same token used for Prod, Preview, Dev. Compromise of dev exposes prod write access.

**Future fix:** Generate separate tokens per scope. Trade-off: more tokens to rotate.

### No audit log of admin actions

**What:** When an admin changes order status, gift card balance, etc., there's no log of who did what when. Sanity tracks revisions but doesn't surface them well in the UI.

**Future fix:** Either use Sanity's built-in history (already there), or add `lastModifiedBy` field to mutating documents.

---

## Documentation

### Schema docs lag behind code

**What:** Sanity schemas evolve; [sanity-cms.md](sanity-cms.md) is updated manually.

**Future fix:** Auto-generate the schema reference from `studio/schemaTypes/*.ts` files. Or a pre-merge check that fails if schemas were touched without docs.

### No video walkthrough for content workflows

**What:** [content-workflows.md](content-workflows.md) is text. Non-technical staff would benefit from a Loom or YouTube.

**Future fix:** Record 5-minute walkthroughs of common tasks. Link from the doc.

---

## How to use this list

When picking up the project:

- Items here are **deliberate omissions** or **acknowledged debt** — not bugs
- The site works without any of them — they're prioritized "nice to haves"
- Some are quick wins (1–2 hour fix); others are projects of their own
- If you're adding a feature that touches one of these areas, see if it's worth fixing the related item at the same time

If you fix something here, delete the section.

If you discover a new limitation worth documenting, add it.
