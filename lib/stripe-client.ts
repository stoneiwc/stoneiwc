import { loadStripe, type Stripe } from '@stripe/stripe-js'

// Browser-side Stripe.js, loaded once on first use. The publishable key is
// public (NEXT_PUBLIC_), so it's read straight from the bundle rather than
// fetched from an API route.
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) return Promise.reject(new Error('Stripe is not configured.'))
    stripePromise = loadStripe(key).catch((err) => {
      stripePromise = null // let the next attempt retry a failed script load
      throw err
    })
  }
  return stripePromise
}
