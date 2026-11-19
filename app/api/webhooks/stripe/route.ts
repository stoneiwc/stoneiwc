import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handleStripeEvent } from '@/lib/stripe-webhook'

// Verifies the Stripe signature, then hands the event to lib/stripe-webhook.ts.
// The status code returned decides whether Stripe retries the event.
export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey)
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  try {
    const result = await handleStripeEvent(event)
    return NextResponse.json(result.body, { status: result.status })
  } catch (err) {
    console.error(`Unhandled error processing Stripe event ${event.id}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }
}
