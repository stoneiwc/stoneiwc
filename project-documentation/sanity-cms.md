# Sanity CMS — Technical Documentation

## Overview

Sanity is the content management system for all dynamic content — products, categories, coupons, shipping methods, team members, articles, press items, and various page images. The Studio runs separately at `http://localhost:3333` (dev) and is deployed at its own URL in production.

All data access goes through GROQ queries in `lib/sanity.queries.ts`. The frontend never talks to the Sanity HTTP API directly — everything goes through `lib/sanity.client.ts`.

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/sanity.client.ts` | Sanity client initialization (`@sanity/client` directly; `next-sanity` was dropped because it pulled the whole Studio and its ~150 vulnerable transitive packages into the website's dependencies) |
| `lib/sanity.queries.ts` | All GROQ queries and TypeScript types |
| `lib/sanity.image.ts` | Image URL builder (`urlFor`) |
| `studio/schemaTypes/` | Schema definitions for all content types |
| `studio/schemaTypes/index.ts` | Registers all schemas with the Studio |

---

## Client Setup (`lib/sanity.client.ts`)

Initialized with:
- `projectId`: `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `dataset`: `NEXT_PUBLIC_SANITY_DATASET`
- `apiVersion`: `NEXT_PUBLIC_SANITY_API_VERSION`
- `useCdn: false`: reads go to the live API. Next's Data Cache does the caching (below); the API CDN could hand a just-published change back stale after a webhook revalidation.
- `token`: `SANITY_API_TOKEN`, server-only (`lib/sanity.client.ts` imports `server-only`). Needed for writes (orders, gift cards) and for every read once the dataset is private.

> **The `production` dataset must be private.** Orders (customer names, emails, addresses) and gift cards (codes and balances) live in it, and a public dataset lets anyone with the project ID query them. Set it in sanity.io/manage → Datasets. The site reads with the token, so nothing else changes.

---

## Caching & ISR

Two kinds of reads in [`lib/sanity.queries.ts`](../lib/sanity.queries.ts):

- **Page content** goes through `contentFetch`, which caches the result in Next's Data Cache for `CONTENT_REVALIDATE_SECONDS` and tags it with the document types it reads.
- **Checkout data** (coupons, shipping methods, and everything in `lib/pricing.ts`, `lib/orders.ts`, `lib/gift-cards.ts`) is read live with `cache: 'no-store'`, so a deactivated coupon or a price change applies to the next order.

```ts
contentFetch(query, params, ['product', 'category'])
```

Each content type is its own cache tag. The list is `CONTENT_TYPES` in [`lib/sanity-tags.ts`](../lib/sanity-tags.ts); `contentFetch` only accepts types from it, so a query can't use a tag the webhook doesn't know.

Pages backed by Sanity export `revalidate = 60`, matching `CONTENT_REVALIDATE_SECONDS`.

### On-demand revalidation (Sanity webhook)

`POST /api/revalidate` revalidates the tag named by the body's `_type`. It needs the `x-webhook-secret` header to match `SANITY_WEBHOOK_SECRET`, compared in constant time, and refuses everything if the variable is unset.

To wire it up, go to sanity.io/manage → API → Webhooks → Create:
- **URL:** `https://stoneiwc.com/api/revalidate` (and a second webhook for the Preview URL if wanted)
- **Trigger on:** Create, Update, Delete
- **Filter:** leave empty
- **Projection:** `{_type}`
- **HTTP method:** POST
- **HTTP headers:** `x-webhook-secret: <SANITY_WEBHOOK_SECRET>`

Once publishes are confirmed to refresh pages within seconds, raise `CONTENT_REVALIDATE_SECONDS` and every page's `export const revalidate` from 60 to 3600. That way Sanity is read hourly instead of every minute.

`{ "_type": "calEvents" }` refreshes the booking pages straight after a change in Cal.com (they otherwise refresh every 5 minutes).

---

## Content Schemas

### Product (`studio/schemaTypes/product.ts`)

The core e-commerce document type.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | Display name |
| `slug` | slug | ✓ | Auto-generated from name, used in URL `/products/[slug]` |
| `price` | number | ✓ | Must be positive |
| `originalPrice` | number | — | Set for sale items; triggers strikethrough display |
| `shortDescription` | string | ✓ | Max 200 chars, shown on product cards |
| `description` | text | ✓ | Full text for product detail page |
| `image` | image | ✓ | With hotspot enabled + `alt` text field |
| `category` | reference → Category | ✓ | Linked category document |
| `tags` | string[] | — | e.g. `"bestseller"`, `"organic"`, `"new"` |
| `inStock` | boolean | — | Default: `true` |
| `featured` | boolean | — | Default: `false`; shows on homepage featured section |

**Special product — Gift Certificate:**
- Slug must be exactly `stoneiwc-gift-certificate`
- This slug is hardcoded in `components/products/gift-card-purchase.tsx` as `GIFT_CARD_SLUG`
- When this slug is detected, the product detail page renders a gift card purchase form instead of the standard add-to-cart UI
- The `price` field is ignored for this product — pricing is handled dynamically in the purchase form

**Adding a new product:**
1. Open Sanity Studio → Products → New
2. Fill all required fields
3. Assign a category (must exist first)
4. Set `featured: true` to appear on the homepage
5. The slug auto-generates from the name — change it if needed before publishing
6. The product page at `/products/[slug]` will be available after the next revalidation (max 60s)

**Sale pricing:**
Set `originalPrice` to the original price and `price` to the sale price. The product card automatically shows:
- A "Sale" badge
- The sale price in full size
- The original price crossed out

---

### Category (`studio/schemaTypes/category.ts`)

Referenced by products. Displayed as filter buttons on `/products`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name, must be unique |
| `slug` | slug | URL-safe identifier |
| `description` | text | Optional |
| `orderRank` | number | Controls display order in filters |

Categories are fetched with `getAllCategories()` which orders by `orderRank asc`. On the products page, "All" is prepended in the frontend — it is not a Sanity document.

---

### Coupon (`studio/schemaTypes/coupon.ts`)

Discount codes applied during checkout. Validated server-side via `POST /api/validate-coupon`.

| Field | Type | Notes |
|-------|------|-------|
| `code` | string | Case-sensitive code customers enter |
| `description` | string | Internal description |
| `type` | `"percentage"` \| `"fixed"` | Percentage off or fixed dollar amount |
| `value` | number | % value or dollar amount |
| `minSubtotal` | number | Optional minimum cart subtotal |
| `isActive` | boolean | Default: `true`; set to `false` to disable |

Only coupons with `isActive == true` are returned by `getCoupons()`.

**Discount calculation:**
- `percentage`: `subtotal × (value / 100)`
- `fixed`: `value` dollars off (capped at subtotal)

---

### Shipping Method (`studio/schemaTypes/shippingMethod.ts`)

Available shipping options shown at checkout. Read live (`getShippingMethods`) by the checkout page and by server pricing.

| Field | Type | Notes |
|-------|------|-------|
| `id` | slug | Used as the identifier in PaymentIntent metadata |
| `name` | string | Display name (e.g. "Standard Shipping") |
| `description` | string | Shown under the name at checkout |
| `cost` | number | Dollar amount ($0 = free) |
| `isActive` | boolean | Only active methods are shown |
| `order` | number | Controls display order |

---

### Other Content Types

These are simpler content types managed in Sanity. Most are single-document types or ordered lists.

| Schema | Used On | Notes |
|--------|---------|-------|
| `heroSlide` | Homepage hero carousel | `subtitle`, `title`, `description`, `image`, ordered by `orderRank` |
| `article` | `/education/articles` | `title`, `slug`, `publishedAt`, `coverImage`, `excerpt`, `tags`, `body` (rich text) |
| `teamMember` | About → Team | `name`, `title`, `bio`, `image`, `specialties`, ordered by `orderRank` |
| `partner` | About → Partners | `name`, `description`, `logo`, `websiteUrl`, ordered by `orderRank` |
| `pressItem` | Featured → Press | `title`, `description`, `image`, `link`, ordered by `orderRank` |
| `awardItem` | Featured → Media (Awards section, shown once one is published) | `title`, `description`, `image`, ordered by `orderRank` |
| `mediaItem` | Featured → Media | `title`, `description`, `youtubeUrl`, ordered by `orderRank` |
| `qcShowFlyer` | Featured → QC Show | Single document, image only |
| `qcShowEpisode` | Featured → QC Show | `youtubeUrl`, ordered by `_createdAt` |

**Singleton image documents** (one document per page section):

| Schema ID | Used On | Studio Path |
|-----------|---------|-------------|
| `homePageImages` | Homepage about + culinary images | Pages → Home → Images |
| `aboutPageImages` | `/about` hero image | Pages → About Us → About Us Page → Images |
| `ourStoryImages` | About → Our Story | Pages → About Us → Our Story → Images |
| `servicesPageImages` | `/services` section images | Pages → Services → Services Page → Images |
| `conciergeImages` | Services → Concierge | Pages → Services → Concierge → Images |
| `virtualConsultationsImages` | Services → Virtual Consultations | Pages → Services → Virtual Consultations → Images |
| `educationPageImages` | `/education` hero image | Pages → Education → Education Page → Images |
| `certificationImages` | Education → Certifications | Pages → Education → Practitioner Certifications → Images |
| `licenseeProgramImages` | Education → Licensee Program | Pages → Education → Licensee Programs → Images |
| `cuppingImages` | Education → Cupping | Pages → Education → Cupping → Images |
| `featuredPageImages` | `/featured` hero image | Pages → Featured On → Featured On Page → Images |
| `qcShowFlyer` | Featured → QC Show | Pages → Featured On → QC Show → Flyer |

These use a fixed `_id` (same as `_type`) so there is always exactly one document per type. Queried with `[0]` selector and the `_id` filter.

---

## GROQ Queries (`lib/sanity.queries.ts`)

### Product Projection

All product queries share a reusable projection:

```groq
_id,
name,
slug,
price,
originalPrice,
description,
shortDescription,
image,
"category": category->{name},
tags,
inStock,
featured
```

The `"category": category->{name}` syntax dereferences the category reference and returns only the `name` field. This is why the frontend `Product` type has `category: string` (the name), not an object.

### Available Query Functions

| Function | GROQ Filter | Cache Tag |
|----------|------------|-----------|
| `getAllProducts()` | `_type == "product"` ordered by `name` | `product` |
| `getProductBySlug(slug)` | `slug.current == $slug` | `product` |
| `getFeaturedProducts()` | `featured == true` | `product` |
| `getProductsByCategory(name)` | `category->name == $categoryName` | `product` |
| `getAllProductSlugs()` | Returns `slug.current[]` only | `product` |
| `getAllCategories()` | `_type == "category"` ordered by `orderRank` | `category` |
| `getCoupons()` | `isActive == true` | `coupon` |
| `getShippingMethods()` | `isActive == true` ordered by `order` | `shippingMethod` |
| `getArticles()` | ordered by `publishedAt desc` | `article` |
| `getArticleBySlug(slug)` | `slug.current == $slug` | `article` |
| `getAboutPageImages()` | singleton `aboutPageImages` | `aboutPageImages` |
| `getEducationPageImages()` | singleton `educationPageImages` | `educationPageImages` |
| `getFeaturedPageImages()` | singleton `featuredPageImages` | `featuredPageImages` |

### `transformProduct` Function

Sanity returns products as `SanityProduct` (raw Sanity shape). `transformProduct()` converts them to the frontend `Product` type used everywhere:

```ts
// Key transformations:
id: sanityProduct._id                          // Sanity _id → frontend id
image: urlFor(sanityProduct.image).width(800).height(800).url()  // image object → URL string
category: sanityProduct.category.name          // { name } object → string
tags: sanityProduct.tags || []                 // null-safe
```

---

## Image Handling (`lib/sanity.image.ts`)

```ts
import { urlFor } from '@/lib/sanity.image'

urlFor(image).width(800).height(800).url()  // product images
urlFor(image).width(400).url()              // thumbnails
```

Sanity stores images as `{ asset: { _ref, _type } }` objects. `urlFor()` builds an optimized CDN URL using `@sanity/image-url`. Always specify dimensions to avoid serving oversized images.

Images are passed to Next.js `<Image>` which handles further optimization (WebP conversion, lazy loading).

---

## Studio Structure (`studio/sanity.config.ts`)

The Studio sidebar is manually structured — new schema types do not appear automatically. The hierarchy mirrors the site navigation:

```
Pages
├── Home
│   ├── Hero Slides
│   └── Images (homePageImages)
├── About Us
│   ├── About Us Page → Images (aboutPageImages)
│   ├── Our Story → Images (ourStoryImages)
│   ├── Team Members
│   └── Partners & Affiliates
├── Services
│   ├── Services Page → Images (servicesPageImages)
│   ├── Concierge → Images (conciergeImages)
│   └── Virtual Consultations → Images (virtualConsultationsImages)
├── Education
│   ├── Education Page → Images (educationPageImages)
│   ├── Practitioner Certifications → Images (certificationImages)
│   ├── Licensee Programs → Images (licenseeProgramImages)
│   ├── Cupping → Images (cuppingImages)
│   └── Articles
└── Featured On
    ├── Featured On Page → Images (featuredPageImages)
    ├── Press
    ├── Media
    ├── Awards
    └── QC Show (Flyer + Episodes)

Products
└── Categories, All Products

Shipping & Coupons
└── Coupons, Shipping Methods
```

When adding a new schema type, it must be registered in both `studio/schemaTypes/index.ts` AND manually placed in the structure in `sanity.config.ts`. It must also be added to the exclusion filter at the bottom of `sanity.config.ts` to prevent it from appearing twice. If the document is a singleton, add it to the `singletonTypes` array in the same file.

---

## Adding a New Schema Type

1. Create `studio/schemaTypes/{typeName}.ts`
2. Define fields with `defineType` + `defineField`
3. Export the type and import it in `studio/schemaTypes/index.ts`
4. Add to the `schemaTypes` array in `index.ts`
5. Add a `S.listItem()` entry in the correct section of `sanity.config.ts`
6. Add the type name to the exclusion filter array at the bottom of `sanity.config.ts`
7. If singleton: add to `singletonTypes` in `sanity.config.ts` and use a fixed `documentId` matching `_type`
8. Write a query function in `lib/sanity.queries.ts` with an appropriate cache tag
9. Deploy the Studio: `cd studio && npx sanity deploy`

> Schema changes are non-destructive — adding fields does not affect existing documents. Removing or renaming fields will cause existing data to silently disappear from queries.
