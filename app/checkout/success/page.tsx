import { CheckoutSuccess } from '@/components/checkout/checkout-success'
import { getVerifiedPaymentStatus } from '@/lib/payment-status'

type Props = {
  searchParams: Promise<{ payment_intent?: string; payment_intent_client_secret?: string }>
}

// Stripe returns here with ?payment_intent=…&payment_intent_client_secret=…
// (the checkout form adds the same two for card payments). The payment is
// verified on the server before the page renders, so there's no spinner while
// the browser asks an API, and the customer's email never leaves the server
// for anyone without the client secret.
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { payment_intent, payment_intent_client_secret } = await searchParams
  const status = await getVerifiedPaymentStatus(payment_intent, payment_intent_client_secret)

  return (
    <CheckoutSuccess
      outcome={status.outcome}
      customerEmail={status.customerEmail}
      isGiftCard={status.isGiftCard}
    />
  )
}
