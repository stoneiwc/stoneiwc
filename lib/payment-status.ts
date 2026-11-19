import 'server-only'
import Stripe from 'stripe'

export type PaymentOutcome = 'complete' | 'processing' | 'failed' | 'not_found'

export interface PaymentStatus {
  outcome: PaymentOutcome
  customerEmail?: string
  // Gift card purchases have nothing to ship and no cart to clear.
  isGiftCard: boolean
}

const NOT_FOUND: PaymentStatus = { outcome: 'not_found', isGiftCard: false }

function outcomeOf(status: Stripe.PaymentIntent.Status): PaymentOutcome {
  switch (status) {
    case 'succeeded':
      return 'complete'
    case 'requires_payment_method':
    case 'canceled':
      return 'failed'
    default:
      // processing, requires_action, requires_confirmation, requires_capture
      return 'processing'
  }
}

// The status of the payment a customer just made, for the success page.
//
// Only the browser that made the payment holds the client secret (Stripe adds
// it to its redirect URL; the checkout form adds it for card payments), so
// requiring it to match keeps a PaymentIntent ID alone, which appears in URLs,
// from revealing a customer's email.
export async function getVerifiedPaymentStatus(
  paymentIntentId: string | undefined,
  clientSecret: string | undefined,
): Promise<PaymentStatus> {
  if (!paymentIntentId || !clientSecret) return NOT_FOUND

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Stripe is not configured.')

  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await new Stripe(secretKey).paymentIntents.retrieve(paymentIntentId)
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError) return NOT_FOUND
    throw err
  }

  if (paymentIntent.client_secret !== clientSecret) return NOT_FOUND

  return {
    outcome: outcomeOf(paymentIntent.status),
    customerEmail: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email || undefined,
    isGiftCard: paymentIntent.metadata?.order_type === 'gift_card',
  }
}
