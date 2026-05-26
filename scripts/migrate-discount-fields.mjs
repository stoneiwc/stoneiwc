#!/usr/bin/env node
/**
 * One-off migration: swap legacy `originalPrice` → new `discountedPrice` semantics.
 *
 * Legacy format:  price = sale price,        originalPrice = regular (higher) price
 * New format:     price = regular price,     discountedPrice = sale (lower) price + isDiscount=true
 *
 * For each product where originalPrice > price, this script:
 *   1. Sets price       = old originalPrice    (regular price)
 *   2. Sets discountedPrice = old price        (sale price)
 *   3. Sets isDiscount = true
 *   4. Unsets the legacy originalPrice field
 *
 * Usage:
 *   node scripts/migrate-discount-fields.mjs              # dry run (default)
 *   node scripts/migrate-discount-fields.mjs --apply      # actually write
 *
 * Reads SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * NEXT_PUBLIC_SANITY_API_VERSION from .env.local.
 */

import {readFileSync} from 'node:fs'
import {createClient} from '@sanity/client'

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of raw.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    // ignore — env vars may be set externally
  }
}

loadEnvLocal()

const apply = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

if (!client.config().token) {
  console.error('SANITY_API_TOKEN missing — set it in .env.local')
  process.exit(1)
}

const products = await client.fetch(
  `*[_type == "product" && defined(originalPrice) && originalPrice > price]{
    _id, name, price, originalPrice, isDiscount, discountedPrice
  }`
)

if (products.length === 0) {
  console.log('No legacy products to migrate. Nothing to do.')
  process.exit(0)
}

console.log(`${apply ? 'Migrating' : 'Would migrate'} ${products.length} product(s):\n`)

for (const p of products) {
  console.log(`  • ${p.name}`)
  console.log(`      price:           ${p.price} → ${p.originalPrice}`)
  console.log(`      discountedPrice: ${p.discountedPrice ?? '—'} → ${p.price}`)
  console.log(`      isDiscount:      ${p.isDiscount ?? '—'} → true`)
  console.log(`      originalPrice:   ${p.originalPrice} → (unset)`)

  if (apply) {
    await client
      .patch(p._id)
      .set({
        price: p.originalPrice,
        discountedPrice: p.price,
        isDiscount: true,
      })
      .unset(['originalPrice'])
      .commit()
    console.log('      ✓ migrated\n')
  } else {
    console.log()
  }
}

if (!apply) {
  console.log('Dry run complete. Re-run with --apply to write changes.')
}
