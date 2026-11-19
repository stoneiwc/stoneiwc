import 'server-only'
import { createClient, type ClientConfig } from '@sanity/client'

// Both clients read the live API (useCdn: false). Next's Data Cache does the
// caching for page content; the API CDN could hand back a document from
// before a publish and re-cache it after a webhook revalidation.
const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-11',
  useCdn: false,
  perspective: 'published',
}

// Read-only work: page content, prices, coupons, shipping methods. Uses
// SANITY_READ_TOKEN (a Viewer token) when set, so these code paths never hold
// write access; falls back to SANITY_API_TOKEN so nothing breaks without it.
// Orders and gift cards have private IDs (lib/sanity-ids.ts), so the reads that
// touch them (pricing's gift card lookup goes through writeClient) need a token.
export const readClient = createClient({
  ...config,
  token: process.env.SANITY_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

// Orders and gift cards: the only code that writes, plus the reads that guard
// those writes (revision checks, idempotency lookups). Editor token.
export const writeClient = createClient({
  ...config,
  token: process.env.SANITY_API_TOKEN,
})
