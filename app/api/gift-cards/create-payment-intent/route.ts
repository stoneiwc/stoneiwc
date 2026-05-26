import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const MAX_CUSTOM_AMOUNT = 500
const NOTE_MAX_LENGTH = 500
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  let body: {
    amount?: number
    senderName?: string
    purchaserEmail?: string
    recipientName?: string
    recipientEmail?: string
    note?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { amount, senderName, purchaserEmail, recipientName, recipientEmail, note } = body

  if (!amount || typeof amount !== 'number' || amount < 1 || amount > MAX_CUSTOM_AMOUNT) {
    return NextResponse.json(
      { error: `Amount must be between $1 and $${MAX_CUSTOM_AMOUNT}.` },
      { status: 400 },
    )
  }

  const trimmedSender = senderName?.trim()
  if (!trimmedSender) {
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
  }

  if (!purchaserEmail || !EMAIL_REGEX.test(purchaserEmail)) {
    return NextResponse.json({ error: 'A valid sender email address is required.' }, { status: 400 })
  }

  if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
    return NextResponse.json({ error: 'A valid recipient email address is required.' }, { status: 400 })
  }

  const trimmedNote = note?.trim()
  if (trimmedNote && trimmedNote.length > NOTE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Note must be ${NOTE_MAX_LENGTH} characters or fewer.` },
      { status: 400 },
    )
  }

  const stripe = new Stripe(stripeSecretKey)

  const metadata: Record<string, string> = {
    order_type: 'gift_card',
    customer_email: purchaserEmail,
    sender_name: trimmedSender,
    recipient_email: recipientEmail.trim(),
    gift_card_amount: String(amount),
  }

  const trimmedRecipientName = recipientName?.trim()
  if (trimmedRecipientName) metadata.recipient_name = trimmedRecipientName
  if (trimmedNote) metadata.gift_card_note = trimmedNote

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    receipt_email: purchaserEmail,
    metadata,
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
