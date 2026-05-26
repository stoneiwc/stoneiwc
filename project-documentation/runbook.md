# Runbook — Troubleshooting Playbook

Common failure modes, how to diagnose them, and how to fix them. Skim the symptoms first; click into the section that matches what you're seeing.

> Triage order when something is broken in production:
> 1. **Vercel function logs** (Vercel → Logs) — most issues surface here
> 2. **Stripe Dashboard → Events** (filter to the affected PaymentIntent) — for any payment-adjacent issue
> 3. **Sanity Vision** (Studio → Vision tab) — to query orders / gift cards directly with GROQ
> 4. **Resend Logs** (Resend Dashboard → Logs) — for email problems

---

## Incidents

- [Payment succeeded but no Sanity order](#payment-succeeded-but-no-sanity-order)
- [Order stuck in "pending" forever](#order-stuck-in-pending-forever)
- [Stripe webhook returns 401](#stripe-webhook-returns-401)
- [Stripe webhook returns 400 — signature verification failed](#stripe-webhook-returns-400--signature-verification-failed)
- [Gift card not redeemed after successful purchase](#gift-card-not-redeemed-after-successful-purchase)
- [Gift card balance double-decremented](#gift-card-balance-double-decremented)
- [Email goes to spam / Promotions / Junk](#email-goes-to-spam--promotions--junk)
- [Customer didn't receive confirmation email](#customer-didnt-receive-confirmation-email)
- [Sanity write fails (403 / token error)](#sanity-write-fails-403--token-error)
- [Cal.com booking embed is blank](#calcom-booking-embed-is-blank)
- [ISR not updating after Sanity edit](#isr-not-updating-after-sanity-edit)
- [`vercel env pull` shows blank values](#vercel-env-pull-shows-blank-values)
- [Production accidentally using test Stripe keys](#production-accidentally-using-test-stripe-keys)
- [Site is down / 500 on every page](#site-is-down--500-on-every-page)

---

## Payment succeeded but no Sanity order

**Symptoms:** Customer sees the success page. Stripe shows a charge. Sanity Studio → Orders has nothing for that PaymentIntent.

**Diagnosis:**
1. Find the PaymentIntent ID in Stripe → Payments → click the payment → copy `pi_…`
2. Search Vercel function logs for that ID. Look for the line `Sanity order creation failed for PaymentIntent pi_…`
3. If found, the error after it tells you why (token permission, schema validation, network).

**Fix:**
- **Recover the missing order:** the Stripe PaymentIntent has all the data you need in `metadata` (ship_*, items_summary, customer_email, totals). Manually create a Sanity Order document in Studio with the same fields. Set `stripePaymentIntentId` and `status: 'paid'` so future webhook retries are idempotent.
- **Fix the root cause:** usually `SANITY_API_TOKEN` lacks Editor permission (see [Sanity write fails](#sanity-write-fails-403--token-error)).

**Why this doesn't break the customer experience:** `createPendingOrder` is wrapped in try/catch in [`create-stripe-payment-intent/route.tsx`](../app/api/checkout/create-stripe-payment-intent/route.tsx). A Sanity failure logs but doesn't break the PaymentIntent return. The customer still pays; the admin loses visibility.

---

## Order stuck in "pending" forever

**Symptoms:** Sanity Order has status `pending` even though Stripe shows the payment as succeeded (often >1 minute later).

**Diagnosis:**
1. Stripe → Developers → Webhooks → click the endpoint → "Event deliveries"
2. Find the `payment_intent.succeeded` event for this PaymentIntent
3. Look at the response: is it 200? Or did Stripe never deliver?

**Common causes:**
- Webhook delivery failed (401, 500, timeout). See specific 401/400 sections below.
- Webhook returned 200 but our handler logged an error in `markOrderPaid`. Check Vercel logs.
- Order document exists but webhook's `stripePaymentIntentId` lookup is missing because the PI was created in test mode and the order was created in production (env var mismatch).

**Fix:**
- **Manual replay:** Stripe → click the failed event → "Resend". The handler is idempotent, so it's safe.
- **Manual flip:** Studio → open the order → change status to `paid` and stamp `paidAt`. Document the reason in `internalNotes`.

---

## Stripe webhook returns 401

**Symptoms:** Stripe Event delivery shows `401 Unauthorized` response.

**Cause:** Vercel Deployment Protection is enabled for the deployment Stripe is hitting (typically a Preview), and the webhook URL doesn't include the bypass token.

**Fix:**
- Preview/dev: the webhook URL in Stripe Test mode must be `https://dev.stoneiwc.com/api/webhooks/stripe?x-vercel-protection-bypass=…&x-vercel-set-bypass-cookie=true`. Regenerate the bypass token in Vercel → Settings → Deployment Protection if needed.
- Production: ensure Deployment Protection is **disabled** for Production scope. Webhook URL must be the clean `https://stoneiwc.com/api/webhooks/stripe` (no query string).

See [environments-and-deployments.md](environments-and-deployments.md#stripe-webhooks-one-per-mode).

---

## Stripe webhook returns 400 — signature verification failed

**Symptoms:** Vercel function log: `Webhook signature verification failed: …`. Stripe shows 400.

**Cause:** `STRIPE_WEBHOOK_SECRET` doesn't match the secret of the webhook endpoint that's sending events.

This usually happens because:
- The Vercel env value is from the Test mode endpoint but Stripe is sending from the Live mode endpoint (or vice versa)
- The webhook secret was rotated in Stripe and not updated in Vercel
- The wrong env scope was edited

**Fix:**
1. Stripe Dashboard → Developers → Webhooks → click the endpoint → "Signing secret" → reveal
2. Vercel → Settings → Environment Variables → confirm `STRIPE_WEBHOOK_SECRET` for the matching scope contains the same value
3. After updating, redeploy (env vars don't apply to existing deployments)

---

## Gift card not redeemed after successful purchase

**Symptoms:** Customer used a gift card. Order completed. But Sanity → Gift Cards shows the balance unchanged.

**Diagnosis:**
1. Vercel logs for `Gift card redemption failed:`
2. Stripe PaymentIntent metadata should have `gift_card_code` and `gift_card_applied_amount`. If absent, the redeem path was skipped.
3. Sanity → Gift Cards → search by code → check the `redemptions` array

**Common causes:**
- Webhook didn't receive the event (see [stuck pending](#order-stuck-in-pending-forever))
- `SANITY_API_TOKEN` lacks Editor permission
- The gift card was deactivated between checkout and webhook arrival
- The card hit the optimistic-concurrency retry limit (5 attempts) — high contention, very rare

**Fix:**
- Manually adjust `currentBalance` and append to `redemptions` in Studio
- Then fix the root cause as above

---

## Gift card balance double-decremented

**Symptoms:** Balance dropped by 2× the expected amount after a single order.

**Cause:** Two webhook deliveries for the same event reached the handler, AND the idempotency check failed. Should be impossible given the current code, but if you observe it, do this:

**Fix:**
1. Open the gift card doc in Studio
2. The `redemptions` array tells you exactly what was applied. If two entries have the same `stripePaymentIntentId`, that's the bug — adjust `currentBalance` upwards by the duplicate amount and delete one of the entries
3. File a bug — the idempotency guard in [`lib/gift-cards.ts`](../lib/gift-cards.ts) `redeemGiftCard` needs review

---

## Email goes to spam / Promotions / Junk

**Symptoms:** Customers report they don't see the order/gift card email in their inbox. Found in Spam or Gmail's Promotions tab.

**Diagnosis & checks** (in order of likely impact):

1. **Resend domain auth:** Resend Dashboard → Domains → `stoneiwc.com` → all of SPF, DKIM, Return-Path, DMARC must be **Verified**. If any are missing/red, add the DNS records to the domain registrar.
2. **DMARC policy:** start with `p=none` (monitoring only). After 1–2 weeks of clean reports, can advance to `p=quarantine`.
3. **From address:** `RESEND_FROM_EMAIL` should ideally include a display name: `Stone International Wellness Center <info@stoneiwc.com>` instead of just `info@stoneiwc.com`. Display names reduce spam scores.
4. **Reply-to:** All transactional emails have `replyTo: CONTACT_EMAIL_TO` set so the message looks like two-way mail, not a no-reply.
5. **Subject lines:** Avoid `$` amounts, ALL CAPS, excessive punctuation. We already removed `$XX` from gift card subjects.
6. **Test the actual delivery:** send a real test using a Gmail account you control, then "Show original" on the message and check the SPF / DKIM / DMARC results in the header.

**Tools:**
- [mail-tester.com](https://www.mail-tester.com/) — send a test email, get a spam score
- [mxtoolbox.com](https://mxtoolbox.com/) — DNS record sanity check

---

## Customer didn't receive confirmation email

**Symptoms:** Order completed (`status: 'paid'` in Sanity). Customer says no email arrived. Not in spam either.

**Diagnosis:**
1. Resend Dashboard → Logs → search by recipient email
2. If the send is logged with status `delivered`: it's a deliverability issue, see [spam section](#email-goes-to-spam--promotions--junk)
3. If logged with status `bounced` or `failed`: the recipient's mail server rejected it. Common: invalid email typo, full mailbox, blocked sender.
4. If not logged at all: the webhook didn't reach the `resend.emails.send` call. Check the function log for `Order paid but no customer email to send confirmation` (means the Sanity order had no email field) or any Resend client error.

**Fix:**
- Bounced/typo: contact the customer through another channel, re-send manually from Studio after correcting the email
- Webhook didn't reach the send: see [stuck pending](#order-stuck-in-pending-forever)

---

## Sanity write fails (403 / token error)

**Symptoms:** Vercel logs: `Insufficient permissions; permission \"create\" required` or `403 Forbidden` from Sanity API.

**Cause:** `SANITY_API_TOKEN` exists but has Viewer / Developer permission, not Editor.

**Fix:**
1. Sanity Manage → Project → API → Tokens
2. Create a new token with **Editor** permission (or higher)
3. Update `SANITY_API_TOKEN` in Vercel for all scopes that need writes (all of them)
4. Redeploy

The old token can be deleted after the new one is confirmed working.

---

## Cal.com booking embed is blank

**Symptoms:** `/book/[slug]` renders the page chrome but the booking widget is just empty.

**Diagnosis:**
1. Browser DevTools → Console → look for Cal.com errors
2. Network tab → check the Cal.com iframe URL — does it return 200?
3. Check `NEXT_PUBLIC_CAL_USERNAME` in the deployed env — typo here breaks everything
4. Verify the Cal.com event with that slug actually exists at `cal.com/stoneiwc/<slug>`

**Common causes:**
- Slug doesn't exist on Cal.com (event was deleted or renamed)
- `CAL_API_KEY` rotated and Vercel env wasn't updated
- The Cal.com account itself has billing/access issues

**Fix:**
- Re-provision the event with the Python script in [`scripts/`](../scripts/) (see [cal-events.md](cal-events.md))
- Or recreate it manually in Cal.com's UI with the same slug

---

## ISR not updating after Sanity edit

**Symptoms:** You change a product price/name in Studio. The site still shows the old value > 60 seconds later.

**Diagnosis:**
- The page in question — does it `export const revalidate = 60`? Check the file.
- Is it actually being requested? ISR only refreshes on the first request after the revalidation period.

**Fix:**
- **Manual revalidation:** `POST /api/revalidate` with the appropriate tag. Or simpler: append `?cache_bust=1` to the URL to bypass once (just to confirm the data is correct in Sanity).
- **Sanity webhook integration:** [`/api/revalidate`](../app/api/revalidate/route.ts) can be wired to a Sanity webhook so any document change triggers tag invalidation. Not configured by default.
- **Last resort:** Vercel → Deployments → "Redeploy" the production deploy without cache. This rebuilds everything fresh.

---

## `vercel env pull` shows blank values

**Symptoms:** `vercel env pull .env.vercel` succeeds but the file has variables with empty values.

**Cause:** The Vercel dashboard hides sensitive variable values after save — they're encrypted at rest. `vercel env pull` does decrypt and write them locally, so a truly blank value means the variable was actually saved as empty.

**Diagnosis:**
1. Vercel → Settings → Environment Variables → click the … menu → "Edit" → the value field should be populated (Vercel UI sometimes masks it; click the eye icon to reveal)
2. If truly blank: someone saved it without typing a value. Re-enter.
3. Verify scope: if you `vercel env pull --environment=production` but the variable is only set for Preview, it'll come back blank.

**See also:** [environments-and-deployments.md](environments-and-deployments.md#splitting-an-existing-variable-across-scopes).

---

## Production accidentally using test Stripe keys

**Symptoms:** Real customer "paid", but no charge shows up in Stripe Live mode Dashboard. Order is `paid` in Sanity but the money never moved.

**This is bad** — the customer thinks they paid; you can't fulfill the order without payment. Catch it before merge by following the [production merge checklist](environments-and-deployments.md#production-merge-checklist).

**Recovery:**
1. Contact affected customers immediately
2. Provide a manual payment link (Stripe → Create payment link) for them to retry
3. Mark the original Sanity order as `cancelled` + `internalNotes` explaining

**Prevention:** Always verify production keys before announcing:
```bash
vercel env pull .env.production --environment=production
grep STRIPE_SECRET_KEY .env.production   # must start with sk_live_
```
Then delete `.env.production` (it's gitignored but treat it as a secret).

---

## Site is down / 500 on every page

**Symptoms:** Production homepage returns 500. Was working before.

**Diagnosis:**
1. Vercel → Deployments → latest production deploy → "Logs" or "Building" tab
2. If the build failed: revert to the previous deploy via Vercel's "Promote to Production" on the last good build
3. If the build succeeded but runtime is failing: function logs will show the actual exception

**Common causes:**
- Sanity dataset became inaccessible (Sanity outage, project paused, token revoked)
- A required env var was deleted or replaced with a wrong value
- A recent code change throws on render

**Fix:**
- Roll back first (Vercel → previous deploy → "Promote to Production")
- Then investigate without the customer impact
- See [environments-and-deployments.md](environments-and-deployments.md#rolling-back) for rollback caveats

---

## Test scenarios

A reusable end-to-end test set for verifying the system after major changes. Run on `dev.stoneiwc.com` in Stripe Test mode.

**Cards (Stripe test mode):**
- Success: `4242 4242 4242 4242`
- Decline (insufficient funds): `4000 0000 0000 9995`
- Decline (3DS required, then succeed): `4000 0027 6000 3184`
- Any future expiry, any CVC, any ZIP

**Scenarios:**

| # | Scenario | Expected |
|---|---|---|
| 1 | Normal order (no coupon, no gift card) | Sanity order `paid`, email received, Stripe metadata correct |
| 2 | Order with coupon | Coupon discount appears in cart UI, Sanity total reflects it, Stripe charge matches |
| 3 | Order with gift card | Gift card balance decreases by the applied amount, Sanity Order has `giftCardApplied` |
| 4 | Order with coupon + gift card | Both discounts apply, charge = `(subtotal − couponDiscount) + shipping − giftCardDiscount` |
| 5 | Gift card purchase | Recipient email arrives, purchaser confirmation email arrives, Sanity Gift Card created with status `active` |
| 6 | Failed payment (4000…9995) | Sanity Order flips to `failed`, gift card balance NOT decremented |
| 7 | Webhook retry / "Resend" in Stripe Dashboard | Order doesn't duplicate, gift card balance doesn't double-decrement, email doesn't re-send |
| 8 | Tampered gift card code | "Invalid code" error, checkout doesn't proceed |
| 9 | Tampered coupon code | "Invalid coupon" error |
| 10 | Cart sheet → View Cart → Checkout navigation | Coupon survives navigation, totals consistent |

---

## What to do when you can't figure it out

1. Capture: the time of failure, the PaymentIntent ID (if applicable), the order number (if applicable), the customer email
2. Grab the Vercel function logs around that time (Vercel → Logs → filter)
3. Grab the Stripe event delivery details (if applicable)
4. Run the relevant GROQ in Sanity Vision to confirm the document state

Then ask in the team Slack/email — the people who built this know the weird corners.
