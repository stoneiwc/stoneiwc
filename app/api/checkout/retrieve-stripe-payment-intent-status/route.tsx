import { NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * GET /api/checkout/retrieve-stripe-payment-intent-status
 *   ?payment_intent=pi_...&payment_intent_client_secret=pi_..._secret_...
 *
 * Status for the checkout success page. The client secret must match, so
 * only the browser that made the payment can read it (the response includes
 * the customer's email). Stripe adds both parameters to its redirect URL;
 * the checkout form adds them when the payment completes without a redirect.
 */
export async function GET(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent')
  const clientSecret = searchParams.get('payment_intent_client_secret')

  if (!paymentIntentId || !clientSecret) {
    return NextResponse.json({ error: 'Payment Intent ID and client secret are required' }, { status: 400 })
  }

  try {
    const stripe = new Stripe(stripeSecretKey)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.client_secret !== clientSecret) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: paymentIntent.status,
      customer_email: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email || '',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    console.error('Retrieve Payment Intent status error:', error)
    return NextResponse.json({ error: 'Failed to retrieve Payment Intent status' }, { status: 500 })
  }
}
