import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const VALID_AMOUNTS = [25, 50, 75, 100, 150, 200]
const MAX_CUSTOM_AMOUNT = 500

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  let body: { amount?: number; purchaserEmail?: string; recipientEmail?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { amount, purchaserEmail, recipientEmail } = body

  if (!amount || typeof amount !== 'number' || amount < 1 || amount > MAX_CUSTOM_AMOUNT) {
    return NextResponse.json({ error: `Amount must be between $1 and $${MAX_CUSTOM_AMOUNT}.` }, { status: 400 })
  }

  if (!purchaserEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const stripe = new Stripe(stripeSecretKey)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    receipt_email: purchaserEmail,
    metadata: {
      order_type: 'gift_card',
      customer_email: purchaserEmail,
      recipient_email: recipientEmail?.trim() || purchaserEmail,
      gift_card_amount: String(amount),
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
