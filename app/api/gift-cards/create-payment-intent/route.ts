import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decoyPaymentIntent, isHoneypotTripped, type HoneypotFields } from '@/lib/honeypot'
import { GIFT_CARD_MAX, GIFT_CARD_MIN } from '@/lib/gift-card-math'
import { isValidEmail } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'

const NOTE_MAX_LENGTH = 500

export async function POST(request: Request) {
  const limited = await rateLimit('giftCardPurchase', request)
  if (limited) return limited

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  let body: HoneypotFields & {
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

  // Honeypot filled → a bot. Hand back a decoy client secret; nothing is
  // created in Stripe.
  if (isHoneypotTripped(body)) {
    console.warn('Gift card honeypot tripped; request dropped')
    return NextResponse.json({ clientSecret: decoyPaymentIntent().clientSecret })
  }

  const { amount, senderName, purchaserEmail, recipientName, recipientEmail, note } = body

  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount < GIFT_CARD_MIN ||
    amount > GIFT_CARD_MAX
  ) {
    return NextResponse.json(
      { error: `Amount must be between $${GIFT_CARD_MIN} and $${GIFT_CARD_MAX}.` },
      { status: 400 },
    )
  }

  const trimmedSender = senderName?.trim()
  if (!trimmedSender) {
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
  }

  if (!isValidEmail(purchaserEmail)) {
    return NextResponse.json({ error: 'A valid sender email address is required.' }, { status: 400 })
  }

  if (!isValidEmail(recipientEmail)) {
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
