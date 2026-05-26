# Content Workflows — Studio User Guide

This doc is for **anyone managing content** (staff, admins, content editors) — not just developers. It walks through the tasks you do in Sanity Studio: adding products, services, images, managing orders and gift cards, editing coupons and shipping.

The Studio URL: ask your admin. It's typically `https://stoneiwc-studio.sanity.studio` (or whatever name was chosen during deploy). You also need a Sanity account with access to the project.

For developer-oriented schema details (field validations, GROQ queries), see [sanity-cms.md](sanity-cms.md).

---

## Contents

- [Getting started in Studio](#getting-started-in-studio) ← **read this first**
- [Adding a product](#adding-a-product)
- [Adding a service / Cal.com booking](#adding-a-service--calcom-booking)
- [Uploading images correctly](#uploading-images-correctly)
- [Managing orders (fulfillment)](#managing-orders-fulfillment)
- [Managing gift cards](#managing-gift-cards)
- [Editing coupons](#editing-coupons)
- [Editing shipping methods](#editing-shipping-methods)
- [Editing page images and hero slides](#editing-page-images-and-hero-slides)
- [Publishing articles](#publishing-articles)
- [Updating team members and partners](#updating-team-members-and-partners)

---

## Getting started in Studio

If this is your first time, do these things in order before touching anything else.

### 1. Get access

You need a Sanity account that's been added to the Stone IWC project. Steps:

1. Your admin sends you an invite by email — subject like "You've been invited to a Sanity project"
2. Open the email, click the invite link
3. Sign in or create a Sanity account using the **same email** the invite was sent to
4. Once accepted, the Stone IWC project shows up in your Sanity dashboard

> If the invite link is expired or missing, ask the admin to resend it. Don't sign up with a different email — you'll create a separate account that has no access.

### 2. Open the Studio

Two ways to reach it:

- **Hosted URL** (recommended for daily work) — the link the admin gave you, looks like `https://stoneiwc-studio.sanity.studio`. Bookmark it.
- **Local** (only if you're working with a developer running the project on their machine) — `http://localhost:3333`

Sign in with the same Sanity account from step 1.

### 3. Understand the sidebar

The left sidebar is the **map of everything you can edit**. The top-level sections are:

| Section | Contains |
|---|---|
| **Pages** | Editable images, text, and assets for each public page of the site (Home, About Us, Services, Education, Featured On) |
| **Products** | The storefront — All products and Categories |
| **Order** | Customer orders. Day-to-day fulfillment work happens here. |
| **Gift Cards** | Issued + manually created gift cards |
| **Shipping & Coupons** | Discount codes and shipping options shown at checkout |

Within **Pages**, the layout mirrors the site navigation. So **Pages → About Us → Our Story → Images** edits the images on the `/about/our-story` URL.

### 4. Drafts vs Published — the most important thing to know

Every document in Studio has two states:

- **Draft** (the local copy you're editing — orange dot in the corner of the field)
- **Published** (the version live on the website)

When you type, Sanity **auto-saves** your draft every few seconds. **But that does NOT make it live.** To make changes visible on `stoneiwc.com`, you must click the green **Publish** button at the bottom of the document.

```
You type → auto-saved as draft (visitors still see the old published version)
You click Publish → live within ~60 seconds (ISR cache refresh)
```

If you don't see your change on the live site after a minute:
1. Did you click Publish? Look for the green button — when there's an unpublished draft, it says "Publish" and is highlighted
2. Hard-refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Wait another 60 seconds — ISR caches refresh on the next request after the timeout

To **discard** a draft without publishing: open the document → three-dot menu → "Discard changes".

### 5. Undo / revision history

Sanity tracks every change. If you mess something up:

1. Open the document
2. Click the **clock icon** in the top-right corner (or the document's three-dot menu → "Inspect")
3. Browse the timeline — you can see who changed what, when
4. Click any past version to preview it, or restore to that version

This is your safety net. You almost can't permanently break anything as long as you don't *delete* the document.

### 6. Search — Cmd+K

Press **Cmd+K** (Mac) or **Ctrl+K** (Windows) anywhere in Studio to open the global search. Type a product name, an order number, a customer email, anything — Studio finds matching documents across all types. Useful when there are too many products to scroll through.

### 7. Image hotspot — what it does

When you upload an image, click the image to edit it and you'll see a circle you can drag — the **hotspot**. This tells Studio which part of the image is the "focal point" — the part that must stay visible when the image gets cropped for different layouts (square card vs. wide banner).

Practical tip:
- For a portrait → drag the hotspot to the face
- For a wide scene → drag the hotspot to the main subject
- For a flat-lay (e.g. product photography) → center the hotspot

Also fill in the **alt text** — read by screen readers, used by Google. A short description of what's in the image. Not the file name.

### 8. If something looks wrong

- "I can't see my change on the site" → see [Drafts vs Published](#4-drafts-vs-published--the-most-important-thing-to-know) above
- "I accidentally deleted something" → revision history (#5) — if the document still exists, restore it. If you fully deleted the document, ask the admin (they may be able to recover from a Sanity dataset backup)
- "I see fields I don't recognize" → don't fill them out randomly; ask the admin. New schema fields sometimes appear without instructions
- "Studio is showing 'Insufficient permissions'" → you have Viewer access, not Editor. Ask the admin to upgrade you

### Quick reference

| Action | How |
|---|---|
| Save a draft | Automatic, no button needed |
| Publish (make live) | Green "Publish" button at the bottom |
| Discard a draft | Three-dot menu → Discard changes |
| Restore an older version | Clock icon → pick version → Restore |
| Search anything | Cmd+K / Ctrl+K |
| Switch documents quickly | Click in the sidebar, the breadcrumbs stay |

Once you've done all this once, the workflows in the rest of this doc make sense.

---

## Adding a product

Sidebar: **Products → All Products → Create**

### Required fields

| Field | What to enter |
|---|---|
| Name | The product's display name. Title-case. |
| Slug | Auto-generates from name (e.g. "Coffee Sampler" → `coffee-sampler`). Used in URL `/products/coffee-sampler`. Change only before first publish; changing later breaks customer bookmarks and SEO. |
| Price | Dollar amount as a number. **No `$` sign.** Decimal allowed (`24.99`). |
| Short description | One sentence (max 200 characters). Shown on product cards. |
| Description | Full text. Shown on the product detail page. |
| Image | See [Uploading images](#uploading-images-correctly) below |
| Category | Must already exist (Products → Categories). Pick from the dropdown. |

### Optional fields

| Field | What to enter |
|---|---|
| Original price | Set this only if the product is on sale. The card shows the original price crossed out and a "Sale" badge. |
| Tags | Free-form. Common: `bestseller`, `organic`, `new`, `gift-set`. Used for filtering. |
| In stock | Default `true`. Set to `false` to hide the "Add to cart" button (product still visible). |
| Featured | If `true`, shows on the homepage featured carousel. |

### After saving

The product is live within ~60 seconds (ISR cache refresh) at `https://stoneiwc.com/products/<slug>`. If you don't see it after a minute, force a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or wait another cycle.

### Do not do this

- **Don't change the slug** after publishing. If you must, set up a redirect manually (file an issue with the dev team).
- **Don't delete a product** that has orders referencing it — the order page will show "Item" as a placeholder name. Better to set `inStock: false`.
- **Don't rename the gift card product slug** (`stoneiwc-gift-certificate`). It's hardcoded as the trigger for the special purchase UI.

---

## Adding a service / Cal.com booking

Services that customers can book (consultations, programs, etc.) are **NOT** in Sanity. They live in **Cal.com**. The storefront just reads from Cal.com's API and renders the booking UI.

### To add a new bookable service

1. **Create the event in Cal.com:**
   - Cal.com → Event Types → Create
   - Slug — use kebab-case (e.g. `wellness-consultation`)
   - Title, description, duration, location (in-person / Zoom / etc.), price (if paid)
   - Save

2. **Slug conventions** (important for how it's displayed on the storefront):

| Slug pattern | Effect |
|---|---|
| `*-free` (e.g. `intro-call-free`) | Card shows "Free" |
| `*-consultation-*` (e.g. `health-consultation-30min`) | Card shows "Price for Consultation" badge |
| Anything else | Shows the actual Cal.com price |

3. The new service should appear at `https://stoneiwc.com/book/<slug>` within seconds (Cal.com data isn't ISR-cached the same way).

4. **Provisioning via script** (developer task): if you have many services to create at once, the dev team can use `scripts/cal_events_*.py` to provision them in bulk. See [cal-events.md](cal-events.md).

### Editing or removing a service

- Edit in Cal.com directly. Don't touch Sanity for services.
- Removing: delete in Cal.com. The storefront will stop showing it. Existing bookings remain in Cal.com history.

See [cal-com-booking.md](cal-com-booking.md) for the technical details.

---

## Uploading images correctly

Image quality is a recurring pain point. Following these guidelines avoids 90% of issues.

### Recommended dimensions

| Use | Min dimensions | Aspect ratio | Format |
|---|---|---|---|
| Product image | 1200 × 1200 | 1:1 (square) | JPG or PNG |
| Hero slide | 2400 × 1200 | 2:1 (landscape) | JPG |
| Team member portrait | 800 × 1000 | 4:5 (portrait) | JPG |
| Article cover | 1600 × 900 | 16:9 (landscape) | JPG |
| Page section image | At least 1600 wide | Varies | JPG |

Sanity's CDN will resize down — uploading larger is fine, uploading smaller looks blurry. **Don't upload images larger than ~5MB** — it works but slows the Studio.

### The alt text

Every image field has an `alt` text input (sometimes labeled "Alternative text" or hidden under "Edit details"). **Fill it in.** This:
- Is read aloud by screen readers (accessibility)
- Is used by Google to understand the image (SEO)
- Falls back when an image fails to load

A good alt text describes the image, not the file: ✓ "Stone-built spa entrance with cedar door" vs. ✗ "image1.jpg" or "Spa".

### The hotspot

Sanity images support a "hotspot" — a focal point used when the image is cropped. Click the image in the Studio, drag the hotspot circle to the part that must stay visible. Useful for portraits (keep the face centered when the card is square) and wide shots (keep the subject in frame when cropped to vertical).

---

## Managing orders (fulfillment)

Sidebar: **Order**

The order list shows the most recent orders first. Each row shows: order number (`SIWC-…`), status badge, total amount, customer email.

### The order lifecycle

```
pending  →  paid  →  shipped  →  delivered
                                  refunded (terminal)
                                  cancelled (terminal)
            failed (terminal)
```

- **`pending`** — order created, payment in flight. Should advance to `paid` within seconds. If it stays `pending` longer than 1 minute, check the [runbook](runbook.md#order-stuck-in-pending-forever).
- **`paid`** — payment succeeded. Time to fulfill.
- **`shipped`** — package handed to carrier. Fill `shippedAt`, `trackingCarrier`, `trackingNumber`.
- **`delivered`** — confirmed received (optional; some teams skip this).
- **`refunded`** — money returned to customer. Issue the refund in Stripe Dashboard FIRST, then set this status in Sanity.
- **`cancelled`** — order cancelled before fulfillment. Use `internalNotes` to explain why.
- **`failed`** — payment failed at checkout. No money was charged. No action needed.

### To ship an order

1. Open the order
2. Fill in:
   - `Shipped at` → current date+time
   - `Tracking carrier` → e.g. `USPS`, `UPS`, `FedEx`
   - `Tracking number` → from the carrier's label
3. Change `status` to `shipped`
4. Publish (the green button)

Customer doesn't get an automated "your order has shipped" email yet — this is a future enhancement (see [open-backlog.md](open-backlog.md)). For now, send an email manually if your process requires it.

### To refund an order

1. **Stripe Dashboard → Payments** → find the payment by amount or customer email → click → "Refund"
2. **Sanity Studio → Orders** → open the order → set `status` to `refunded`
3. Add a note in `internalNotes` explaining the reason

If only refunding partially: do the partial refund in Stripe, then in Sanity status stays at the previous state (e.g. `delivered`) with a note about the partial refund. The Sanity `total` field is NOT auto-updated; record the refund amount in `internalNotes`.

### Internal notes

The `internalNotes` field is freeform text. Use it for:
- "Customer asked for back-door delivery"
- "Reshipped after first package lost in transit"
- "Refunded $20 for late delivery, kept the rest"

These notes are not visible to the customer.

---

## Managing gift cards

Sidebar: **Gift Cards**

Gift cards are created automatically when someone buys one through the storefront. You'll only manage them when:
- A customer reports a problem (lost code, partially used, etc.)
- You want to manually issue a card (for promotions, replacements)
- You need to deactivate a card

### Fields

| Field | Notes |
|---|---|
| `code` | Customer-facing code, format `STONE-XXXX-XXXX`. Auto-generated, don't change. |
| `originalAmount` | What the card was sold for. Don't change after creation. |
| `currentBalance` | What's left. Decreases on each redemption. |
| `status` | `active` (usable) / `redeemed` (fully consumed) / `expired` (past expiry) / `void` (admin-revoked) |
| `purchaser` | Who bought it (name + email) |
| `recipient` | Who it's for (name + email, may equal purchaser) |
| `note` | Personal message from purchaser |
| `expiresAt` | Default: 1 year from purchase |
| `redemptions[]` | Array of redemption events — each has `amount`, `orderNumber`, `paymentIntentId`, `redeemedAt` |
| `paymentIntentId` | Stripe PaymentIntent that paid for the card (used for idempotency) |

### To manually issue a gift card

(For promotions, refunds in card form, etc.)

1. Sidebar **Gift Cards → Create**
2. Fill:
   - `code` — generate one yourself or copy the format `STONE-XXXX-XXXX`. Must be unique.
   - `originalAmount` — dollar amount
   - `currentBalance` — same as original
   - `status` — `active`
   - `purchaser` — your team's contact (e.g. info@stoneiwc.com)
   - `recipient` — customer's name + email
   - `expiresAt` — pick a date (default 1 year)
   - Leave `paymentIntentId` blank (no Stripe PI for manual issuance)
3. Publish
4. Email the code to the recipient (no automatic email is sent for manually-created cards)

### To deactivate a card (lost/stolen/dispute)

Set `status` to `void`. The validation API will reject it on next use.

### To resend the gift card email

There's no UI button for this. Currently the only way is to manually compose an email with the code. Future enhancement: a "Resend email" button (see [open-backlog.md](open-backlog.md)).

### See also

- [gift-card.md](gift-card.md) — technical details on creation, validation, redemption

---

## Editing coupons

Sidebar: **Shipping & Coupons → Coupons**

### To create a coupon

1. Create
2. Fill:
   - `code` — case-sensitive, what customer types (e.g. `SUMMER10`, `WELCOME`)
   - `description` — internal only, won't be shown to customers (e.g. "Summer 2026 promo")
   - `type` — `percentage` (off subtotal) or `fixed` (dollar amount off)
   - `value` — for percentage, enter `10` for 10%. For fixed, enter `10` for $10.
   - `minSubtotal` — optional. e.g. `50` means coupon only valid on orders ≥ $50.
   - `isActive` — `true` to enable
3. Publish

The coupon is usable immediately (no ISR delay — coupon validation is a server fetch on each checkout).

### To disable a coupon

Set `isActive` to `false`. The validation API will reject it.

### Coupon behavior

- Coupons apply to **merchandise subtotal**, before shipping
- A coupon and a gift card can be combined (see [orders.md](orders.md))
- Discount is capped at the subtotal (a $100 coupon on a $50 cart = $50 off, not a $50 refund)
- One coupon per order (customers can't stack coupons)

---

## Editing shipping methods

Sidebar: **Shipping & Coupons → Shipping Methods**

### To add a shipping method

1. Create
2. Fill:
   - `id` — slug used in Stripe metadata (e.g. `standard`, `express`, `local-pickup`)
   - `name` — display name at checkout (e.g. "Standard Shipping")
   - `description` — shown under the name (e.g. "5-7 business days")
   - `cost` — dollar amount. **Use `0` for free shipping, never below `0.50`** (Stripe minimum charge is $0.50 — see warning below)
   - `isActive` — `true` to show at checkout
   - `order` — display order, lower numbers first
3. Publish

### Warning: never set cost to a non-zero amount below $0.50

Stripe rejects charges below $0.50. If a customer's order total falls below this (e.g. small product + $0.10 shipping with a gift card covering the rest), the PaymentIntent fails. Either set shipping to $0 (free) or ≥ $0.50.

There's no Sanity validation enforcing this yet. Be careful.

### To disable a method

Set `isActive` to `false`. It won't appear at checkout.

---

## Editing page images and hero slides

Sidebar: **Pages → [section] → Images** (varies by section)

Many pages have a singleton "Images" document with multiple slots (hero, secondary, gallery). You edit them in place — no create/delete needed.

### Homepage hero slides

Sidebar: **Pages → Home → Hero Slides**

These are ordered — drag to reorder, or set `orderRank` numerically. Each slide has:
- `title`, `subtitle`, `description`
- `image` (with alt text)
- (Optionally a CTA button)

### Other page images

Each page has its own image set. The Studio sidebar mirrors the site nav — **Pages → About Us → Our Story → Images**, etc. See [sanity-cms.md](sanity-cms.md#singleton-image-documents) for the full list.

---

## Publishing articles

Sidebar: **Pages → Education → Articles**

1. Create
2. Fill:
   - `title`, `slug` (URL becomes `/education/articles/<slug>`)
   - `publishedAt` — set to current time or schedule for later
   - `coverImage` — recommended 1600 × 900
   - `excerpt` — one paragraph teaser
   - `tags` — for categorization on the index page
   - `body` — rich text editor (block content). Headings, paragraphs, images, links all supported.
3. Publish

Article appears on `/education` within ~60 seconds.

---

## Updating team members and partners

Sidebar: **Pages → About Us → Team Members** or **Partners & Affiliates**

Both are ordered lists with similar fields:
- `name`, `title`, `image`, `bio`
- (Team) `specialties` — array of strings
- (Partner) `websiteUrl` — clickable on the partners section

Drag to reorder or set `orderRank` numerically.

---

## A note on publishing

In Sanity Studio, **clicking "Publish" makes changes go live**. Saving (the auto-save dot in the corner) only saves the draft — readers on the live site won't see it until you publish.

Always publish your changes. Drafts can pile up unnoticed.

---

## See also

- [sanity-cms.md](sanity-cms.md) — schema fields and technical structure
- [orders.md](orders.md) — order lifecycle in depth
- [gift-card.md](gift-card.md) — gift card flow in depth
- [cal-com-booking.md](cal-com-booking.md) — service / booking specifics
- [open-backlog.md](open-backlog.md) — known limitations / planned improvements
