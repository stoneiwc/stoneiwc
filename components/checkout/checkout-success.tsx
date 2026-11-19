'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useCart } from '@/lib/cart-context'
import type { PaymentOutcome } from '@/lib/payment-status'

interface CheckoutSuccessProps {
  outcome: PaymentOutcome
  customerEmail?: string
  isGiftCard: boolean
}

// Renders the result the server already verified (app/checkout/success/page.tsx).
// Client-side only for clearing the cart once a storefront order is paid.
export function CheckoutSuccess({ outcome, customerEmail, isGiftCard }: CheckoutSuccessProps) {
  const { clearCart } = useCart()

  useEffect(() => {
    // A gift card purchase never used the cart, so leave it alone.
    if (outcome === 'complete' && !isGiftCard) clearCart()
  }, [outcome, isGiftCard, clearCart])

  if (outcome === 'processing') {
    return (
      <>
        <PageHeader
          title="Payment Processing"
          subtitle="Your payment is being processed"
        />
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-sm border border-yellow-200 bg-yellow-50 p-8 text-center">
              <div className="flex justify-center">
                <Loader className="h-12 w-12 animate-spin text-yellow-600" />
              </div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-foreground">
                Payment Processing
              </h2>
              <p className="mt-2 font-body text-muted-foreground">
                Your payment is being processed. You'll receive an email confirmation once it's complete.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (outcome === 'failed' || outcome === 'not_found') {
    const notFound = outcome === 'not_found'
    return (
      <>
        <PageHeader
          title={notFound ? 'No Payment Found' : 'Payment Error'}
          subtitle={notFound ? 'There is no completed payment to show here' : 'There was an issue processing your payment'}
        />
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-sm border border-red-200 bg-red-50 p-8 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-foreground">
                {notFound ? 'We couldn’t find this payment' : 'Payment Error'}
              </h2>
              <p className="mt-2 font-body text-muted-foreground">
                {notFound
                  ? 'If you just paid, check your email for a confirmation, or contact us at info@stoneiwc.com.'
                  : 'There was an issue processing your payment. Please try again or contact support.'}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={notFound ? '/view-cart' : '/checkout'}
                  className="inline-flex rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {notFound ? 'View Cart' : 'Try Again'}
                </Link>
                <Link
                  href="/"
                  className="inline-flex rounded-sm border border-border bg-background px-6 py-3 text-sm font-body font-bold tracking-wider text-foreground transition-colors hover:bg-muted"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  const nextSteps = isGiftCard
    ? [
        'The gift card email with its code is on its way to the recipient',
        customerEmail ? `Your receipt is going to ${customerEmail}` : 'Your receipt is on its way by email',
      ]
    : [
        customerEmail
          ? `You'll receive an order confirmation email with your receipt at ${customerEmail}`
          : "You'll receive an order confirmation email with your receipt",
        "We'll send you shipping updates as your order is processed",
        'Your order will be shipped according to the shipping method you selected',
      ]

  return (
    <>
      <PageHeader
        title="Order Successful!"
        subtitle="Thank you for your purchase"
      />

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-sm border border-border bg-card p-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>

            <h2 className="mt-6 text-center font-sans text-2xl font-semibold tracking-wide text-foreground">
              Order Confirmed
            </h2>

            <p className="mt-4 text-center font-body text-muted-foreground">
              Thank you for your purchase! We've received your order and will send you a confirmation
              email shortly.
            </p>

            {/* Order Details */}
            <div className="mt-8 rounded-sm border border-border bg-background p-6">
              <h3 className="font-sans text-lg font-semibold text-foreground">
                What's Next?
              </h3>
              <ul className="mt-4 space-y-3">
                {nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3 font-body text-muted-foreground">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      ✓
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Back to Home
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-6 py-3 text-sm font-body font-bold tracking-wider text-foreground transition-colors hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Support Message */}
            <p className="mt-8 text-center text-xs font-body text-muted-foreground">
              Need help? Email us at info@stoneiwc.com or check your email for order details.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
