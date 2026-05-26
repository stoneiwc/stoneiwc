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
| Charge amount tampering | The PaymentIntent amount is created server-side, but the server currently trusts the client-sent `totalAmount`. **Future hardening:** re-fetch product prices from Sanity at server time and validate before creating the PI. See [open-backlog.md](open-backlog.md). |
| Webhook impersonation | Every webhook payload is signature-verified with `stripe.webhooks.constructEvent` using `STRIPE_WEBHOOK_SECRET`. A request without a valid signature returns 400 immediately. |
| Idempotency | Webhook handler is idempotent by `stripePaymentIntentId` — replays don't double-charge / double-redeem. See [webhooks.md](webhooks.md#idempotency). |
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

- The `SANITY_API_TOKEN` used at runtime has **Editor** permission — needed to create/update orders + gift cards
- Other tokens (e.g. for dev tools, Sanity Vision queries) should be **Viewer** unless they need to write
- Sanity Studio access is per-user — managed in Sanity Manage → Members. Don't share login credentials.
- The frontend never reads/writes Sanity directly; all access goes through API routes that run server-side. This is the reason `SANITY_API_TOKEN` is *not* prefixed `NEXT_PUBLIC_*`.

---

## Rate limiting

| Endpoint | Limit | Where |
|---|---|---|
| `POST /api/contact` | Per-IP, see [`lib/email/rate-limit.ts`](../lib/email/rate-limit.ts) | In-memory (resets on function cold start) |
| Other endpoints | None | Vercel's built-in DDoS protection at the platform level |

The in-memory rate limit resets on every cold start, so a determined attacker could bypass it. For higher confidence, move to Vercel Edge Config / Upstash Redis. Acceptable today because the cost of contact form spam is just team inbox noise.

---

## Webhook URLs and public exposure

- Webhook URL: `https://stoneiwc.com/api/webhooks/stripe` — **publicly accessible by design.** Stripe must be able to reach it.
- Protection: every request is signature-verified. Unsigned/wrongly-signed requests get 400.
- Don't add basic auth or Vercel SSO to production — it would block Stripe.
- The preview webhook URL includes a Vercel protection bypass token: `?x-vercel-protection-bypass=…`. **This token is itself a secret.** Treat the Stripe webhook URL as confidential — don't post screenshots of it.

---

## Dependency security

| Practice | How |
|---|---|
| Dependabot / Renovate | Not configured. **Recommendation:** enable Dependabot security alerts in GitHub Settings → Security |
| `pnpm audit` | Run periodically. Won't catch everything but catches known CVEs in direct deps |
| Pin major versions | `package.json` uses `^` (caret) — patches and minor updates auto-pick up on `pnpm install`. Risky for surprise breaking changes; acceptable for security patches |

---

## XSS / injection considerations

| Vector | Status |
|---|---|
| User-provided strings rendered in HTML | All user input goes through React, which escapes by default. The contact form's `message` and gift card `note` are explicitly `escapeHtml`'d in email templates ([`lib/email/contact-template.ts`](../lib/email/contact-template.ts), [`lib/email/gift-card-template.ts`](../lib/email/gift-card-template.ts)). |
| GROQ injection | Sanity queries use parameterized `$param` syntax — never string-concatenate user input into GROQ. |
| SQL injection | N/A — no SQL database. Sanity is the data store. |
| Open redirects | The success page reads `payment_intent` from the URL but only uses it to look up Stripe metadata; it's not used for navigation. No `?redirect=` parameters anywhere. |

---

## Email security

- **Domain auth (SPF/DKIM/DMARC):** Resend Dashboard → Domains → `stoneiwc.com` should show all green
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
