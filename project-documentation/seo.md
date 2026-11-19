# SEO — Stone IWC

This document covers everything implemented for SEO, what remains to be done, and post-deploy steps required to activate indexing.

---

## What Was Implemented

### 1. Sitemap — `app/sitemap.ts`

Dynamically generated via Next.js `MetadataRoute.Sitemap`. It is rebuilt hourly (`revalidate = 3600`), and publishing a product also refreshes it through the `product` cache tag, so new products and services appear without a deploy.

**Covered routes:**

| Routes | Source | Priority | Change Frequency |
|--------|--------|----------|-----------------|
| `/` | `STATIC_ROUTES` | 1.0 | weekly |
| `/products`, `/book` | `STATIC_ROUTES` | 0.9 | daily / weekly |
| `/education`, `/services` | `STATIC_ROUTES` | 0.8 | weekly / monthly |
| `/about`, `/featured` | `STATIC_ROUTES` | 0.7 | monthly / weekly |
| `/contact` | `STATIC_ROUTES` | 0.6 | yearly |
| `/our-policies` | `STATIC_ROUTES` | 0.3 | yearly |
| Every nav dropdown page (`navigation[].children` in `lib/navigation.ts`) | `SUBPAGE_ROUTES` | 0.7 | monthly |
| `/products/[slug]` (all, from Sanity) | `getAllProductSlugs()` | 0.8 | weekly |
| `/book/[slug]` (all, from Cal.com) | `getEventTypes()` | 0.7 | weekly |

Accessible at: `{NEXT_PUBLIC_FRONTEND_URL}/sitemap.xml`

**Note:** If Cal.com is down when the sitemap rebuilds, the booking pages are left out rather than failing the whole sitemap. Adding a page to the nav menu adds it to the sitemap automatically; a page that isn't in the nav needs an entry in `STATIC_ROUTES`.

---

### 2. Robots — `app/robots.ts`

Allows all crawlers on public pages and blocks:
- `/api/` — internal API routes
- `/studio/` — Sanity CMS Studio
- `/checkout/` — transactional pages
- `/view-cart/` — transactional pages

Points crawlers to the sitemap URL automatically.

---

### 3. Root Layout Metadata — `app/layout.tsx`

Added to the global `metadata` export:

- `metadataBase` — resolves relative URLs in child pages against `NEXT_PUBLIC_FRONTEND_URL`
- `openGraph` — type `website`, siteName, default title and description
- `twitter` — `summary_large_image` card with default title and description
- `robots` — `index: true`, `follow: true` for Google and all bots
- `alternates.canonical` — points to the base URL

---

### 4. JSON-LD Structured Data

A reusable `JsonLd` component lives at `components/seo/json-ld.tsx`. It renders a `<script type="application/ld+json">` tag server-side.

**Schemas injected per context:**

| Page | Schema Type |
|------|------------|
| Root layout | `LocalBusiness` + `WebSite` |
| `/products/[slug]` | `Product` with `Offer` (price, currency, stock status) |

These schemas enable **rich results** in Google Search (product price/availability panels).

---

### 5. Dynamic Metadata — Product Pages

`app/products/[slug]/page.tsx` builds its metadata with `pageMetadata()` from `lib/seo.ts`, the same helper other pages use:

- `alternates.canonical` — the page's own path (the root layout sets no canonical, so pages never inherit the homepage's)
- `openGraph` — `type: website`, site name, title, description and the product image (the 800×800 Sanity URL)
- `twitter` — `summary_large_image` with the same image

---

### 6. Static Page Metadata — All Top-Level Pages

The following pages had `openGraph`, `twitter`, and `alternates.canonical` added:

`/about`, `/book`, `/services`, `/contact`, `/products`, `/education`, `/featured`

Canonical URLs use relative paths (e.g. `/about`) which Next.js resolves against `metadataBase`.

---

## Post-Deploy Steps (Required)

### Submit Sitemap to Google Search Console

This must be done once after the first production deploy.

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select the Stone IWC property
3. In the left menu, click **Sitemaps**
4. Enter `https://stoneiwc.com/sitemap.xml` and click **Submit**

Google will begin crawling and indexing all routes listed in the sitemap.

### Verify Sitemap and Robots Are Live

After deploy, manually verify:

- `https://stoneiwc.com/sitemap.xml` — should return XML with all routes
- `https://stoneiwc.com/robots.txt` — should list `Disallow` rules and `Sitemap:` pointer

---

## Remaining Work (Not Yet Implemented)

### OpenGraph Default Image

Currently no fallback image exists for social previews on pages that do not have a Sanity image (homepage, services, contact, etc.). When shared on social media, these pages will show no preview image.

**To fix:** Add `app/opengraph-image.tsx` (or a static `app/opengraph-image.png`) using the Next.js `ImageResponse` API or a pre-designed static asset.

### Booking Pages (`/book/[slug]`)

Individual booking pages have a `generateMetadata` function pulling title and description from Cal.com, but they are missing:
- `openGraph` and `twitter` metadata
- `alternates.canonical`
- JSON-LD (`Service` schema would be appropriate here)

These pages also have no `generateStaticParams`, so they are fully dynamic (not SSG). Adding `generateStaticParams` using `getEventTypes()` would make them statically generated and improve crawl performance.

### Homepage (`/`)

The root `page.tsx` has no `metadata` export of its own. It inherits the root layout defaults, which is acceptable but not ideal. A dedicated homepage metadata with a richer description and a targeted `openGraph` image would improve click-through rates from search results.

### `keywords` Meta Tag

Not implemented. Google officially ignores the `keywords` meta tag, so this is low priority. Bing still reads it. If Bing coverage matters, add a `keywords` array to the static page metadata exports.

### Structured Data — BreadcrumbList

No breadcrumb schema is in place. Adding `BreadcrumbList` JSON-LD to product pages would enable breadcrumb rich results in Google Search, which increase CTR.

### Structured Data — FAQPage

If any page includes a Q&A or FAQ section (e.g. services, education), wrapping those items in a `FAQPage` schema would unlock FAQ rich results in Google.

### International / Multi-language

Not applicable. The site is English-only. If a Spanish version is ever added, `hreflang` alternates will be needed in the root layout metadata.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/sitemap.ts` | Dynamic sitemap generation |
| `app/robots.ts` | Crawler rules |
| `app/layout.tsx` | Root metadata, JSON-LD Organization/WebSite |
| `components/seo/json-ld.tsx` | Reusable JSON-LD script component |
| `app/products/[slug]/page.tsx` | Product metadata + JSON-LD |
