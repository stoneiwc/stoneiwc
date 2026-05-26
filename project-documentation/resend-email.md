# Resend Email — Technical Documentation

## Overview

Resend is the transactional email provider for Stone IWC. It is used for two email types: contact form notifications (sent to the business) and gift card delivery (sent to the gift card recipient). All email logic lives under `lib/email/`.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key — required on all environments |
| `RESEND_FROM_EMAIL` | Sender address (e.g. `noreply@stoneiwc.com`) — must be on a verified domain |
| `CONTACT_EMAIL_TO` | Destination address for contact form submissions (the business inbox) |

> All three must be set in Vercel environment variables for each environment (Preview, Production). The domain in `RESEND_FROM_EMAIL` must be verified in the Resend dashboard under **Domains**, otherwise all sends will fail silently.

---

## File Structure

```
lib/email/
├── contact-template.ts    ← HTML + text templates for contact form emails
├── gift-card-template.ts  ← HTML + text templates for gift card delivery emails
└── rate-limit.ts          ← In-memory IP rate limiter (contact form only)

app/api/
├── contact/route.ts       ← POST /api/contact — sends contact form email
└── webhooks/stripe/route.ts ← Stripe webhook — sends gift card email on payment
```

---

## Email Types

### 1. Contact Form Notification

**Trigger:** `POST /api/contact` — called when a user submits the contact form  
**Template:** `lib/email/contact-template.ts`  
**Sender:** `RESEND_FROM_EMAIL`  
**Recipient:** `CONTACT_EMAIL_TO` (the business)  
**Reply-To:** The customer's email — clicking reply in the inbox goes directly to the customer

**Request body:**
```ts
{
  firstName: string
  lastName: string
  email: string
  phone?: string   // optional
  message: string
}
```

**What the email contains:**
- Full name, email, phone (if provided)
- Message body with HTML-escaped content
- "Reply to [Name]" CTA button that opens a `mailto:` link

**Rate limiting:** 3 submissions per IP per hour (see Rate Limiting section below).

---

### 2. Gift Card Delivery

**Trigger:** `POST /api/webhooks/stripe` — fires when a `payment_intent.succeeded` event is received for a gift card purchase (`metadata.order_type === 'gift_card'`)  
**Template:** `lib/email/gift-card-template.ts`  
**Sender:** `RESEND_FROM_EMAIL`  
**Recipient:** `metadata.recipient_email` (falls back to `metadata.customer_email` if not set)

**What the email contains:**
- Gift card value ($XX)
- The `STONE-XXXX-XXXX` redemption code
- Expiry date (1 year from purchase)
- Instructions for redeeming at checkout
- "Shop Now" CTA linking to `/products`

> The email is sent inside the Stripe webhook handler, not during the payment itself. If the webhook is not configured, no email will be sent even if the payment succeeds. See `project-documentation/gift-card.md` for webhook setup.

---

## Rate Limiting (`lib/email/rate-limit.ts`)

Used only for the contact form endpoint to prevent abuse.

**Implementation:** In-memory `Map<ip, { count, resetAt }>`. Resets on cold start (serverless).

**Limits:**
- Window: 1 hour
- Max requests: 3 per IP per hour

**How it works:**
```ts
const { allowed, retryAfterSeconds } = checkRateLimit(ip)
if (!allowed) {
  return 429 with Retry-After header
}
```

**IP detection order:**
1. `x-forwarded-for` header (first IP in the list, used by Vercel/proxies)
2. `x-real-ip` header
3. Falls back to `"unknown"` (all "unknown" IPs share one bucket)

**Limitation:** This is an in-memory store per serverless function instance. Multiple instances do not share state. Effectively limits 3 submissions per IP per instance per hour, not globally. Acceptable for a contact form. If global enforcement is needed, replace with Upstash Redis.

---

## Template Design

Both templates share the same design system:
- Background: `#f4f4f0` (warm off-white)
- Card background: `#ffffff`
- Header: `#1a1a1a` dark
- Accent: `#c9a96e` gold
- Body font: `Georgia, serif`
- Code font: `Courier New, monospace` (gift card only)
- Max width: 600px, centered

Templates are plain HTML strings (no React, no JSX). Each template file exports two functions:
- `*EmailHtml(data)` — full HTML string sent as the `html` field
- `*EmailText(data)` — plain text fallback sent as the `text` field

Always provide both. Email clients that block HTML fall back to plain text.

---

## Adding a New Email Type

1. Create `lib/email/{name}-template.ts` with the data interface and two export functions (`{name}EmailHtml`, `{name}EmailText`).
2. In the API route or server action that should trigger the email, instantiate Resend and call `resend.emails.send()`:

```ts
import { Resend } from 'resend'
import { myEmailHtml, myEmailText } from '@/lib/email/my-template'

const resend = new Resend(process.env.RESEND_API_KEY)

const { error } = await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL!,
  to: recipientAddress,
  subject: 'Your Subject',
  html: myEmailHtml(data),
  text: myEmailText(data),
})

if (error) {
  console.error('Email send error:', error)
}
```

3. If the email is customer-facing (not internal), add `replyTo` only if appropriate.
4. If the endpoint is public-facing (user-submitted), add rate limiting using `checkRateLimit` from `lib/email/rate-limit.ts`.

---

## Troubleshooting

**Email not arriving:**
1. Check that `RESEND_API_KEY` is set in the correct Vercel environment (Preview vs Production).
2. Verify the domain in `RESEND_FROM_EMAIL` is verified in the Resend dashboard under Domains.
3. Check Vercel function logs for `"Resend error:"` or `"email send error:"` entries.
4. Check the recipient's spam folder — new domains often land there.
5. For gift card emails specifically: verify the Stripe webhook is configured (see `project-documentation/gift-card.md`).

**`resend.emails.send()` returns an error but the route still returns 200:**
- The contact form route returns `500` on email error.
- The Stripe webhook handler logs the error but still returns `{ received: true }` — this is intentional so Stripe does not retry the webhook unnecessarily.

**Rate limit hitting legitimate users:**
- The contact form allows 3 submissions per IP per hour. This is intentionally strict. If it needs loosening, edit `MAX_REQUESTS` in `lib/email/rate-limit.ts`.
