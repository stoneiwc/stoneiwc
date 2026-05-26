# Frontend & UI

Conventions for building and modifying the user interface. Read this before adding pages, components, or touching theming.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives, copied into `components/ui/`) |
| Icons | `lucide-react` |
| Fonts | Cormorant Garamond (display) + Lato (body), via `next/font/google` |

---

## Design tokens

All colors are defined as CSS custom properties in [`app/globals.css`](../app/globals.css) and exposed as Tailwind utilities via [`tailwind.config.ts`](../tailwind.config.ts). **Use the token, not raw hex.**

| Tailwind class | Token | Use |
|---|---|---|
| `bg-background` / `text-foreground` | base | Page background, default text |
| `bg-card` / `text-card-foreground` | card | Card surfaces |
| `bg-primary` / `text-primary-foreground` | primary (gold) | CTAs, key brand color (`#c9a96e`-ish gold) |
| `bg-secondary` / `text-secondary-foreground` | secondary | Subdued surfaces |
| `bg-muted` / `text-muted-foreground` | muted | Background for inactive states; muted body text |
| `bg-accent` / `text-accent-foreground` | accent (deep brown) | Hover surfaces, secondary CTAs |
| `bg-destructive` / `text-destructive-foreground` | destructive (red) | Errors, danger actions |
| `border-border` | border | All borders. Avoid `border-gray-*`. |

> **Dark mode is configured** (`darkMode: ['class']`) but not actively used. The `:root` CSS vars and the `.dark` variant are both defined. If you want to enable a toggle, add a `ThemeProvider` consumer + `next-themes`.

---

## Typography

Two font families, loaded once in [`app/layout.tsx`](../app/layout.tsx):

| Class | Family | Use |
|---|---|---|
| `font-sans` | Cormorant Garamond | Display: headings, key product copy, navbar, footer brand |
| `font-body` | Lato | Body copy: paragraphs, form labels, captions, button text |

```tsx
<h1 className="font-sans text-3xl font-semibold tracking-wide">Page Title</h1>
<p className="font-body text-base text-muted-foreground">Body copy here.</p>
```

Default body font is `font-body` (set on `<body>` in the root layout) — so on plain text you don't need to add it. Add `font-sans` explicitly for headings and brand copy.

Letter-spacing conventions:
- Major headings: `tracking-wide` (slightly looser, feels editorial)
- Small caps / labels: `tracking-[2-3px]` (e.g. `letter-spacing: 3px`) for the "STONE INTERNATIONAL WELLNESS CENTER" style chrome

---

## Component library

### shadcn/ui (`components/ui/`)

Most low-level components — Button, Input, Select, Sheet, Dialog, etc. — come from shadcn. These are **copied source files**, not a dependency. To upgrade or add new ones:

```bash
npx shadcn@latest add <component>
```

They install into `components/ui/`. Once added, edit freely — they're your code now.

> Don't manually edit core Tailwind tokens to change shadcn behavior. Edit the token in `globals.css` (e.g. `--primary`) and every shadcn component re-themes automatically.

### Project-specific components (`components/`)

Composites built on top of shadcn:

- **`navbar.tsx`** / **`mobile-nav.tsx`** — top navigation
- **`footer.tsx`** — site-wide footer with newsletter form
- **`page-header.tsx`** — repeated page title + subtitle pattern
- **`cart-sheet.tsx`** — slide-over cart (Sheet primitive)
- **`cal-booker.tsx`** — wrapper around `@calcom/embed-react`
- **`checkout/SelfCheckoutSection.tsx`** + **`CheckoutDetailsSection.tsx`** — the two-column checkout layout
- **`products/`** — listing grid, filters, product card, gift card purchase
- **`home/`**, **`education/`**, **`contact/`** — page-specific sections
- **`seo/`** — JSON-LD structured data components

---

## Page layout pattern

Most content pages follow this structure:

```tsx
export default function MyPage() {
  return (
    <>
      <PageHeader title="My Page" subtitle="Short description of what this is." />

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* content */}
        </div>
      </section>
    </>
  )
}
```

Notes:
- `<>...</>` Fragment instead of a wrapper div — `Navbar` and `Footer` are in the root layout
- `py-14 lg:py-20` — standard vertical rhythm
- `mx-auto max-w-6xl px-6` — standard centered container. Use `max-w-7xl` for wider content (product listing), `max-w-3xl` for prose (articles)

---

## Adding a new page

1. Create `app/<route>/page.tsx`
2. Use the layout pattern above
3. If the page needs Sanity data: server-fetch in the component (it's a Server Component by default) using helpers from [`lib/sanity.queries.ts`](../lib/sanity.queries.ts)
4. If using ISR (recommended for any Sanity-backed page):
   ```tsx
   export const revalidate = 60
   ```
5. If the page needs metadata for SEO, export `metadata`:
   ```tsx
   import type { Metadata } from 'next'
   export const metadata: Metadata = {
     title: 'My Page — Stone IWC',
     description: '...',
   }
   ```

### Dynamic routes (`[slug]`)

For `/products/[slug]`, `/book/[slug]`, etc.:

```tsx
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  return {
    title: `${product.name} — Stone IWC`,
    description: product.shortDescription,
  }
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return notFound()
  // ...
}
```

`generateStaticParams` pre-builds all known slugs at build time; `revalidate = 60` keeps them fresh.

---

## Client components — when to use

Default to Server Components. Add `'use client'` only when you need:
- React state (`useState`, `useReducer`)
- Effects (`useEffect`)
- Browser APIs (localStorage, window, etc.)
- Event handlers (`onClick`, `onChange` — these don't work in Server Components)
- Third-party libraries that use any of the above

Examples of client components in this repo:
- [`lib/cart-context.tsx`](../lib/cart-context.tsx) — uses `useReducer` + `localStorage`
- [`components/checkout/SelfCheckoutSection.tsx`](../components/checkout/SelfCheckoutSection.tsx) — form state, Stripe Elements
- [`components/cal-booker.tsx`](../components/cal-booker.tsx) — Cal.com embed needs window

Server components can render client components but not vice versa (a client component can render server components only when passed as `children`).

---

## ISR and revalidation

All Sanity-backed pages should have:

```tsx
export const revalidate = 60   // seconds
```

Combined with tagged queries in [`lib/sanity.queries.ts`](../lib/sanity.queries.ts):

```ts
client.fetch(query, params, { next: { tags: ['product'] } })
```

On-demand revalidation by tag: `POST /api/revalidate` with `{ tag: 'product' }`. Sanity webhooks can call this so changes propagate immediately. Currently not wired up by default — see [open-backlog.md](open-backlog.md).

---

## Forms

There's no form library — forms use raw React state. Two examples to follow:

- [`app/contact/page.tsx`](../app/contact/page.tsx) — simple submission, server validation
- [`components/checkout/SelfCheckoutSection.tsx`](../components/checkout/SelfCheckoutSection.tsx) — complex multi-step

Conventions:
- State as a single `form` object with `setForm((f) => ({ ...f, field: value }))`
- Client-side validation in an `isFormValid()` helper for button disabled state
- Server-side validation always re-checks (never trust client)
- Submit button shows loading state, becomes disabled while in flight
- Errors shown in a `<div className="rounded-sm border border-red-200 bg-red-50 p-4">` block

For inputs, use shadcn `<Input>` / `<Textarea>` / `<Select>` from `components/ui/`.

---

## Cart state

The cart is a React context defined in [`lib/cart-context.tsx`](../lib/cart-context.tsx) and provided from the root layout. It exposes:

```ts
const {
  items, totalItems, subtotal,
  appliedCoupon, applyCoupon, removeCoupon, discountAmount,
  totalPrice,                               // subtotal − coupon (no shipping/gift card)
  addItem, removeItem, updateQuantity, clearCart,
  isOpen, setOpen,                          // cart sheet visibility
} = useCart()
```

Persistence: items and applied coupon are saved to `localStorage` under the key `stone-iwc-cart`. Loaded on mount; saved on every change.

> The checkout page computes its own `finalTotal` because it has access to shipping and gift card discounts which the cart context doesn't know about. See [`app/checkout/page.tsx`](../app/checkout/page.tsx).

---

## Images — Next.js + Sanity

For Sanity-managed images:

```tsx
import Image from 'next/image'
import { urlFor } from '@/lib/sanity.image'

<Image
  src={urlFor(product.image).width(800).height(800).url()}
  alt={product.image.alt || product.name}
  width={800}
  height={800}
  className="object-cover"
/>
```

Always:
- Pass `width` and `height` (or `fill` for filling a parent) — Next.js needs them for layout shift prevention
- Provide an `alt` that's a real description, not empty
- Use `urlFor()` with explicit dimensions to avoid serving multi-MB originals

For static images (logos, icons, decorative):
```tsx
<Image src="/logo.png" alt="Stone IWC" width={200} height={60} />
```
Place them in `public/`.

---

## Animation and motion

There's no animation library in this project — no Framer Motion, no GSAP. The visual style is intentionally restrained: smooth scrolling (`scroll-behavior: smooth`), `transition-colors` on hover, occasional `animate-spin` for loaders. Adding heavy motion is a deliberate design choice; align with the team before adopting.

---

## Responsive breakpoints

Standard Tailwind:

| Prefix | Min width | Use |
|---|---|---|
| (none) | 0 | Mobile first; default classes are mobile |
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Wide desktops |

The mobile-bar pattern (e.g. [`components/booking-mobile-bar.tsx`](../components/booking-mobile-bar.tsx)) is `block lg:hidden` — visible on mobile, hidden on desktop. Conversely, sidebars are `hidden lg:block`.

---

## Accessibility checklist

Things to remember:
- Every `<Image>` has a non-empty `alt`
- Form inputs have associated `<label>` (or `aria-label`)
- Interactive non-button elements get `role="button"` + `tabIndex={0}` + key handlers
- Color contrast: the primary gold on white can be borderline — use `text-foreground` for body text, gold only for emphasis
- Modals and Sheets from Radix already handle focus trapping correctly — don't fight the library

Run a quick check with the **Accessibility tab** in Chrome DevTools or `pnpm dlx lighthouse https://localhost:3000` before shipping a major UI change.

---

## SEO — quick reference

Details in [seo.md](seo.md). Essentials when adding/editing a page:

- Every page exports `metadata` (or `generateMetadata` for dynamic routes) with `title` and `description`
- For Open Graph: extend `metadata.openGraph` if the page is shareable
- For product pages: the JSON-LD `<Product>` component is in [`components/seo/`](../components/seo/) — include it on detail pages
- Sitemap and robots are auto-generated from [`app/sitemap.ts`](../app/sitemap.ts) and [`app/robots.ts`](../app/robots.ts) — add new public routes there if they don't have a Sanity slug

---

## A few patterns to follow

| Goal | Pattern |
|---|---|
| Centered container | `mx-auto max-w-6xl px-6` |
| Card | `rounded-sm border border-border bg-card p-6` |
| Primary button | `rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90` |
| Secondary button | Same shape + `bg-secondary hover:bg-secondary/80` |
| Section spacing | `py-14 lg:py-20` for major sections, `py-8 lg:py-12` for sub-sections |
| Form input | `rounded-sm border border-input bg-background px-3 py-2 text-sm font-body outline-none focus:border-primary` |

---

## See also

- [architecture.md](architecture.md) — system overview, where the frontend fits
- [sanity-cms.md](sanity-cms.md) — data layer that powers most pages
- [seo.md](seo.md) — metadata, sitemap, structured data
- [content-workflows.md](content-workflows.md) — how Studio edits propagate to UI
