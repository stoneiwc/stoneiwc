import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { giftCardEmailHtml, giftCardEmailText } from '@/lib/email/gift-card-template'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `STONE-${segment()}-${segment()}`
}

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
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // Deactivate gift card promo code if one was redeemed in this order
  const redeemedPromoCodeId = paymentIntent.metadata?.gift_card_promotion_code_id
  if (redeemedPromoCodeId) {
    try {
      await stripe.promotionCodes.update(redeemedPromoCodeId, { active: false })
    } catch (err) {
      console.error('Failed to deactivate gift card promo code:', err)
    }
  }

  if (paymentIntent.metadata?.order_type !== 'gift_card') {
    return NextResponse.json({ received: true })
  }

  const customerEmail = paymentIntent.receipt_email ?? paymentIntent.metadata?.customer_email
  const recipientEmail = paymentIntent.metadata?.recipient_email || customerEmail
  const amountDollars = paymentIntent.amount / 100

  if (!customerEmail || !recipientEmail) {
    console.error('Gift card webhook: missing email in payment intent', paymentIntent.id)
    return NextResponse.json({ error: 'Missing customer email.' }, { status: 400 })
  }

  const code = generateGiftCardCode()

  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  try {
    const coupon = await stripe.coupons.create({
      amount_off: paymentIntent.amount,
      currency: 'usd',
      name: `Gift Card $${amountDollars}`,
      max_redemptions: 1,
    })

    await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code,
      max_redemptions: 1,
      expires_at: Math.floor(expiryDate.getTime() / 1000),
      metadata: {
        payment_intent_id: paymentIntent.id,
        purchaser_email: customerEmail,
        recipient_email: recipientEmail,
        amount: String(amountDollars),
      },
    })
  } catch (err) {
    console.error('Gift card Stripe creation error:', err)
    return NextResponse.json({ error: 'Failed to create gift card in Stripe.' }, { status: 500 })
  }

  const expiresAt = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const emailData = {
    code,
    amount: amountDollars,
    recipientEmail,
    purchaserEmail: customerEmail,
    expiresAt,
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: recipientEmail,
    subject: `Your $${amountDollars} Stone IWC Gift Card`,
    html: giftCardEmailHtml(emailData),
    text: giftCardEmailText(emailData),
  })

  if (emailError) {
    console.error('Gift card email send error:', emailError)
  }

  return NextResponse.json({ received: true })
}
