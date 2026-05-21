import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import {
  giftCardEmailHtml,
  giftCardEmailText,
  giftCardPurchaseConfirmationHtml,
  giftCardPurchaseConfirmationText,
} from '@/lib/email/gift-card-template'
import { client as sanityClient } from '@/lib/sanity.client'
import { createGiftCard, redeemGiftCard } from '@/lib/gift-cards'
import { markOrderFailed, markOrderPaid } from '@/lib/orders'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  if (
    event.type !== 'payment_intent.succeeded' &&
    event.type !== 'payment_intent.payment_failed'
  ) {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const meta = paymentIntent.metadata ?? {}

  // Handle payment failures: flip the corresponding pending order to 'failed'.
  if (event.type === 'payment_intent.payment_failed') {
    if (meta.order_type === 'storefront') {
      try {
        await markOrderFailed(paymentIntent.id)
      } catch (err) {
        console.error('Failed to mark order as failed:', err)
      }
    }
    return NextResponse.json({ received: true })
  }

  // payment_intent.succeeded from here on.

  // Mark the matching Sanity order as paid for storefront purchases.
  if (meta.order_type === 'storefront') {
    try {
      await markOrderPaid(paymentIntent.id)
    } catch (err) {
      console.error('Failed to mark order as paid:', err)
    }
  }

  // Deduct balance for any gift card redeemed in this order.
  const redeemedCode = meta.gift_card_code
  const appliedAmountRaw = meta.gift_card_applied_amount
  if (redeemedCode && appliedAmountRaw) {
    const appliedAmount = parseFloat(appliedAmountRaw)
    if (appliedAmount > 0) {
      try {
        await redeemGiftCard(redeemedCode, appliedAmount, paymentIntent.id)
      } catch (err) {
        console.error('Gift card redemption failed:', err)
      }
    }
  }

  if (meta.order_type !== 'gift_card') {
    return NextResponse.json({ received: true })
  }

  const customerEmail = paymentIntent.receipt_email ?? meta.customer_email
  const recipientEmail = meta.recipient_email || customerEmail
  const senderName = meta.sender_name
  const recipientName = meta.recipient_name
  const note = meta.gift_card_note
  const amountDollars = paymentIntent.amount / 100

  if (!customerEmail || !recipientEmail || !senderName) {
    console.error('Gift card webhook: required metadata missing', paymentIntent.id)
    return NextResponse.json({ error: 'Required gift card metadata missing.' }, { status: 400 })
  }

  // Idempotency — if Stripe retries the webhook, skip re-creating the card.
  const existing = await sanityClient.fetch<{ code: string } | null>(
    `*[_type == "giftCard" && paymentIntentId == $pid][0]{ code }`,
    { pid: paymentIntent.id },
  )

  let code: string
  let expiryDate: Date

  if (existing) {
    code = existing.code
    // Re-derive expiry for email rendering. The exact value isn't critical here —
    // the card itself in Sanity holds the source of truth.
    expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
  } else {
    expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    try {
      const created = await createGiftCard({
        amount: amountDollars,
        purchaserName: senderName,
        purchaserEmail: customerEmail,
        recipientName,
        recipientEmail,
        note,
        paymentIntentId: paymentIntent.id,
        expiresAt: expiryDate,
      })
      code = created.code
    } catch (err) {
      console.error('Gift card Sanity creation error:', err)
      return NextResponse.json({ error: 'Failed to create gift card.' }, { status: 500 })
    }
  }

  const expiresAt = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const emailData = {
    code,
    amount: amountDollars,
    senderName,
    recipientName,
    recipientEmail,
    purchaserEmail: customerEmail,
    note,
    expiresAt,
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: recipientEmail,
    subject: `${senderName} sent you a $${amountDollars} Stone IWC gift card`,
    html: giftCardEmailHtml(emailData),
    text: giftCardEmailText(emailData),
  })

  if (emailError) {
    console.error('Gift card email send error:', emailError)
  }

  if (recipientEmail.toLowerCase() !== customerEmail.toLowerCase()) {
    const confirmationData = {
      amount: amountDollars,
      senderName,
      recipientName,
      recipientEmail,
      expiresAt,
    }

    const { error: confirmationError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: customerEmail,
      subject: `Your $${amountDollars} Stone IWC gift card has been sent`,
      html: giftCardPurchaseConfirmationHtml(confirmationData),
      text: giftCardPurchaseConfirmationText(confirmationData),
    })

    if (confirmationError) {
      console.error('Gift card purchase confirmation email error:', confirmationError)
    }
  }

  return NextResponse.json({ received: true })
}
