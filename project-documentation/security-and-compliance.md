# Security & Compliance

A short, practical checklist of the security-relevant choices in this codebase and what to keep doing right. Not a substitute for a proper penetration test, but a guard against the easy mistakes.

---

## Threat model in one paragraph

Stone IWC is a small e-commerce site with **no customer accounts** — there are no user passwords, sessions, or PII beyond what's collected at checkout. The blast radius of a compromise is mostly limited to: defrauded orders, customer email/address exposure, and gift card fraud. The most valuable secrets are the **Stripe live secret key** and the **Sanity API token** with Editor permission; the rest are recoverable.

---

## Secrets — what they are, where they live

| Secret | Lives in | If leaked, attacker can |
|---|---|---|
| `STRIPE_SECRET_KEY` (live) | Vercel env (Production scope) | Charge cards, issue refunds, view PII, view full Stripe dashboard |
| `STRIPE_SECRET_KEY` (test) | Vercel env (Preview/Dev), local `.env.local` | Charge fake cards (no real impact, but spam Stripe events) |
| `STRIPE_WEBHOOK_SECRET` | Vercel env | Forge webhook events — impersonate Stripe to mark orders paid without paying |
| `SANITY_API_TOKEN` (Editor) | Vercel env, local `.env.local` | Write to Sanity: create/modify orders, alter products, drain gift cards |
| `RESEND_API_KEY` | Vercel env, local `.env.local` | Send emails from `info@stoneiwc.com`. Reputational damage if used for spam/phishing |
| `CAL_API_KEY` | Vercel env, local `.env.local` | Read bookings, modify event types |
| `NEXT_PUBLIC_*` | Public on the client | Not secrets — these are visible in the browser bundle. Don't put secrets behind this prefix. |

Rules:
- **Never commit `.env.local`** — it's gitignored, keep it that way
- **Never put a secret behind `NEXT_PUBLIC_*`** — the build will inline it into the client bundle
- **Don't paste secrets into chat, Linear, GitHub issues, or screenshots** — they end up indexed
- **Rotate immediately** if you suspect leakage

---

## Rotating a secret

### Stripe keys

1. Stripe Dashboard → Developers → API keys → "Reveal and roll" on the leaked key
2. Vercel → update the `STRIPE_SECRET_KEY` for the affected scope
3. Redeploy
4. Stripe revokes the old key automatically after a short grace period

### Stripe webhook secret

You can't rotate the secret without re-creating the endpoint (Stripe doesn't expose a "rotate" button for it):
1. Stripe → Developers → Webhooks → delete the leaked endpoint
2. Create a new one with the same URL + events
3. Copy the new signing secret
4. Update Vercel `STRIPE_WEBHOOK_SECRET` and redeploy

### Sanity token

1. Sanity Manage → Project → API → Tokens → revoke the leaked token
2. Create a new one with the same permission level (Editor)
3. Update `SANITY_API_TOKEN` in Vercel + local `.env.local`
4. Redeploy

### Resend key

1. Resend Dashboard → API Keys → revoke
2. Create new
3. Update `RESEND_API_KEY` in Vercel and redeploy

---

## Payment security (Stripe)

| Concern | How we handle it |
|---|---|
| Card data never touches our server | Stripe Elements collects card details in an iframe sandboxed to Stripe's domain. Only the `paymentMethod` ID (a token) crosses our backend. We are out of PCI scope. |
| Charge amount tampering | The server prices every order itself ([`lib/pricing.ts`](../lib/pricing.ts)): product prices, coupon, shipping method and gift card are re-read live from Sanity, and client-sent prices and totals are ignored. |
| PaymentIntent ownership | Checkout reuses an earlier PaymentIntent only when the caller sends its client secret, and the success page (server-rendered, `lib/payment-status.ts`) only shows a payment, including its email, when the client secret matches. A PaymentIntent ID alone (it appears in URLs) grants nothing. |
| Payment without an order | If checkout can't record the pending order, it cancels the PaymentIntent and returns 503; the webhook recovers any paid PaymentIntent that still has no order and alerts the owner. See [webhooks.md](webhooks.md#recovered-orders). |
| Gift card codes | Bearer credentials: generated with `crypto.randomInt` (`STONE-XXXX-XXXX`, ~1.1 trillion combinations), and the lookup endpoint is rate-limited. |
| Webhook impersonation | Every webhook payload is signature-verified with `stripe.webhooks.constructEvent` using `STRIPE_WEBHOOK_SECRET`. A request without a valid signature returns 400 immediately. |
| Idempotency | Every webhook write is safe to repeat (revision-checked transitions, deterministic document IDs, an `emailedAt` claim). Replays and concurrent deliveries don't double-charge, double-redeem or double-email. See [webhooks.md](webhooks.md#idempotency). |
| Refund process | Refunds happen in Stripe Dashboard manually. Sanity Order status is updated after, by hand. No automated refund API exposed (so no API endpoint to abuse). |

---

## Customer PII

What we collect and where it lives:

| Data | Stored in | Retention |
|---|---|---|
| Name, email, phone, shipping/billing address | Sanity Order document; Stripe PaymentIntent metadata | Indefinite (no auto-deletion) |
| Email (for contact form) | Resend logs (~30 days), team inbox | Indefinite if not deleted |
| Email (for newsletter, if implemented) | Not currently implemented | N/A |
| Card data | **Never our server.** Stripe holds the payment method. | Stripe's retention applies |
| IP address | Used for rate-limiting contact form. Not persisted. | Ephemeral |

If a customer requests deletion (GDPR / similar):
1. Sanity → Orders → find by email → delete documents (or anonymize: replace email and name with `redacted@`)
2. Stripe → Customers → find by email → delete customer (this also detaches PIs from the customer; the PI itself stays for accounting)
3. Resend → Logs → no built-in delete; logs auto-expire

There is no formal data deletion API. Honor requests manually.

---

## Sanity access control

- **Orders and gift cards use private document IDs.** Private datasets aren't available on Sanity's free plan, so `production` is public: anyone with the project ID (it's in the browser bundle) can query it without a token. Orders (customer names, emails, addresses) and gift cards (bearer codes and balances) stay private because their document IDs contain a period: `order.<id>` and `giftCard.<id>`. Sanity only serves root-path IDs to unauthenticated requests. The site creates every order and gift card this way (`privateId()` in [`lib/sanity-ids.ts`](../lib/sanity-ids.ts)). Studio can't create or duplicate them (`studio/sanity.config.ts`), because Studio would assign a public ID. Older documents were moved with `scripts/migrate-private-ids.mjs`, which is safe to re-run. Coupons and shipping methods are created in Studio with public IDs, so coupon codes are readable; keep that in mind before creating high-value codes. If the project moves to a paid plan, make the dataset private as well.
- The `SANITY_API_TOKEN` used at runtime has **Editor** permission, needed to create and update orders and gift cards. Only `writeClient` (`lib/orders.ts`, `lib/gift-cards.ts`) uses it; the read-only paths use `readClient`, which takes a Viewer token from `SANITY_READ_TOKEN` when set. Prefer separate tokens per Vercel environment so a leaked dev or preview token isn't a production write token.
- Other tokens (e.g. for dev tools, Sanity Vision queries) should be **Viewer** unless they need to write. Delete tokens nobody uses (sanity.io/manage → API → Tokens), and never hard-code one, even as a fallback: the repo is public, so git history is public too.
- Sanity Studio access is per-user — managed in Sanity Manage → Members. Don't share login credentials.
- The browser never talks to Sanity. [`lib/sanity.client.ts`](../lib/sanity.client.ts) imports `server-only`, so the build fails if a client component ever imports it, and client components build image URLs with [`lib/sanity.image.ts`](../lib/sanity.image.ts), which doesn't touch the client or token. This is also why `SANITY_API_TOKEN` is *not* prefixed `NEXT_PUBLIC_*`.

---

## Rate limiting

Per-IP sliding windows in [`lib/rate-limit.ts`](../lib/rate-limit.ts), stored in Upstash Redis so they hold across all serverless instances:

| Endpoint | Limit |
|---|---|
| `POST /api/contact` | 3 per hour |
| `GET /api/gift-cards/validate` | 10 per 10 minutes (codes are bearer credentials and this returns balances) |
| `POST /api/validate-coupon` | 20 per 10 minutes |
| `POST /api/checkout/create-stripe-payment-intent` | 30 per hour |
| `POST /api/gift-cards/create-payment-intent` | 10 per hour |
| Other endpoints | Vercel's built-in DDoS protection at the platform level |

Over the limit, the route answers 429 with `Retry-After`. Without `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or the Marketplace integration's `KV_REST_API_URL` / `KV_REST_API_TOKEN`) limiting is off and a warning is logged; if Redis errors, requests are allowed rather than blocking checkout.

### Spam honeypot

The contact, checkout and gift card forms each render an off-screen input ([`components/honeypot-field.tsx`](../components/honeypot-field.tsx)) that people never see and most bots fill. The matching endpoints check it with `isHoneypotTripped` from [`lib/honeypot.ts`](../lib/honeypot.ts):

| Endpoint | Response when the honeypot is filled | Skipped |
|---|---|---|
| `POST /api/contact` | `{ success: true }` | Both emails |
| `POST /api/checkout/create-stripe-payment-intent` | Decoy `clientSecret` + `paymentIntentId` | Stripe call, Sanity pending order |
| `POST /api/gift-cards/create-payment-intent` | Decoy `clientSecret` | Stripe call |

Each drop logs a `honeypot tripped` warning in the Vercel function logs. Don't rename the field to anything a browser autofills (email, company, website, phone, code): a real visitor's autofill would trip it and their submission would silently vanish.

---

## Webhook URLs and public exposure

- Webhook URL: `https://stoneiwc.com/api/webhooks/stripe` — **publicly accessible by design.** Stripe must be able to reach it.
- Protection: every request is signature-verified. Unsigned/wrongly-signed requests get 400.
- Don't add basic auth or Vercel SSO to production — it would block Stripe.
- The preview webhook URL includes a Vercel protection bypass token: `?x-vercel-protection-bypass=…`. **This token is itself a secret.** Treat the Stripe webhook URL as confidential — don't post screenshots of it.

---

## HTTP security headers

Set for every response in [`next.config.mjs`](../next.config.mjs):

| Header | Value | Why |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Browsers don't guess content types |
| `X-Frame-Options` | `SAMEORIGIN` | Only this site can frame its pages (clickjacking). Cal.com and Stripe iframes *inside* our pages are unaffected |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Other sites see only our origin, never full URLs with query strings |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Features the site never uses. `payment` stays allowed for Apple Pay / Google Pay |
| `Strict-Transport-Security` | `max-age=63072000` | Sent by Vercel |

`X-Powered-By` is turned off (`poweredByHeader: false`). The image optimizer only accepts this project's Sanity images and YouTube thumbnails (`images.remotePatterns`).

**Content-Security-Policy: report-only.** `next.config.mjs` sends `Content-Security-Policy-Report-Only`. Browsers log violations but block nothing. The policy allows only the origins the site uses (Stripe, Google Analytics, the Cal.com embed, the Spotify player, Sanity and YouTube images, and Vercel Analytics on this origin), plus `'unsafe-inline'` for Next's inline scripts (nonces would make every page dynamic). It also sets `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'self'`.

To enforce it:
1. On a preview deploy, open the browser console and run through:
   - a checkout with a 3-D Secure test card (`4000 0027 6000 3184`)
   - a gift card purchase
   - a booking page
   - `/media` (YouTube thumbnails and the Spotify embed)
   - the home page with analytics loading
2. Add any origin that shows up as `[Report Only] Refused to …` to the matching directive.
3. Rename the header key to `Content-Security-Policy`.

**CORS:** no API route sends `Access-Control-Allow-Origin`, so browsers block other sites from calling or reading them. Keep it that way: none of the routes are meant to be called from other origins. The API has no cookie or session auth, so CSRF isn't a concern; abuse of the public routes is handled by rate limits and the honeypot.

---

## Dependency security

| Practice | How |
|---|---|
| `pnpm audit --prod` | Should report no known vulnerabilities. Run it before every release; ideally in CI with `--audit-level high`. |
| Keep `next` current | Next.js ships security fixes often (several critical advisories in 2026). Upgrade `next` and `@next/third-parties` together and keep them on the same version. |
| Lean runtime dependencies | Only what the site imports goes in `dependencies`; build tools (autoprefixer, tailwindcss-animate, postcss) are devDependencies. The site uses `@sanity/client` directly rather than `next-sanity`, which pulled the whole Studio and ~150 vulnerable transitive packages into production. |
| Transitive fixes | `pnpm.overrides` in `package.json` sets patched minimum versions for transitive packages. Remove an entry once the parent package ships the fix. |
| Dependabot / Renovate | Not configured. **Recommendation:** enable Dependabot security alerts in GitHub Settings → Security |
| Pin major versions | `package.json` uses `^` (caret) — patches and minor updates auto-pick up on `pnpm install`. Risky for surprise breaking changes; acceptable for security patches |

---

## XSS / injection considerations

| Vector | Status |
|---|---|
| User-provided strings rendered in HTML | All user input goes through React, which escapes by default. Every user-supplied field (names, emails, messages, gift card notes, item names, addresses) is `escapeHtml`'d in the email templates in [`lib/email/`](../lib/email/). |
| JSON-LD | The only `dangerouslySetInnerHTML` is [`components/seo/json-ld.tsx`](../components/seo/json-ld.tsx), which escapes `<` so CMS text can't close the `<script>` tag. |
| GROQ injection | Sanity queries use parameterized `$param` syntax — never string-concatenate user input into GROQ. |
| SQL injection | N/A — no SQL database. Sanity is the data store. |
| Open redirects | The success page reads `payment_intent` from the URL but only uses it to look up Stripe metadata; it's not used for navigation. No `?redirect=` parameters anywhere. |

---

## Email security

- **Domain auth (SPF/DKIM/DMARC):** Resend Dashboard → Domains → `stoneiwc.com` should show all green
- **DMARC enforcement:** customers expect order and gift card emails from this domain, which makes spoofed mail convincing. The `_dmarc` record should have a `rua=` reporting address and, once reports show every legitimate sender passing, `p=quarantine` then `p=reject`. `p=none` only monitors.
- **`replyTo`** is set on every transactional email to `info@stoneiwc.com` — replying lands in the team inbox, not the no-reply void
- **Subject lines** avoid spam triggers ($ amounts, ALL CAPS, excessive punctuation)
- **No customer email lists** stored — the contact form sends one-off messages only, no newsletter or marketing mail

---

## Compliance posture

This is a small business e-commerce site. We are NOT:
- GDPR-certified (no formal DPA, no data processor agreements)
- SOC 2 / ISO 27001 audited
- HIPAA-covered (no health data despite the "Wellness Center" name — services are educational/lifestyle, not medical)
- PCI-DSS audited (we're out of PCI scope by virtue of using Stripe Elements)

Customers in regulated jurisdictions (EU, California, etc.) have implicit rights under GDPR / CCPA. Honor deletion requests as described in [Customer PII](#customer-pii) above. Add a privacy policy and cookie banner if not already present.

---

## "If something looks wrong" — what to do

| Signal | Action |
|---|---|
| Stripe Dashboard shows charges you didn't authorize | Rotate `STRIPE_SECRET_KEY` immediately, audit access |
| Sanity has order docs you didn't create | Rotate `SANITY_API_TOKEN`, audit Sanity Manage → Activity log |
| Emails sent from `info@stoneiwc.com` that you didn't send | Rotate `RESEND_API_KEY`, check Resend Logs for the offending sends |
| Webhook handler running with unexpected events | Check Stripe → Webhooks → Endpoint configuration; remove any unauthorized endpoints |
| Customer reports their account was used without permission | We have no accounts — confirm the customer isn't confusing us with another site. If they ordered with stolen card, refund and let Stripe's fraud detection handle the rest |

Document any incident in `internalNotes` on the related order, plus a separate post-mortem to the team.

---

## See also

- [environments-and-deployments.md](environments-and-deployments.md#splitting-an-existing-variable-across-scopes) — env var management
- [webhooks.md](webhooks.md#signature-verification) — webhook signature details
- [runbook.md](runbook.md) — incident response patterns
- [open-backlog.md](open-backlog.md) — server-side price validation, audit log, other hardening items
