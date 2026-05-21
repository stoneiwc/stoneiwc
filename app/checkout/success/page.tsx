'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useCart } from '@/lib/cart-context'

type OrderStatus = 'complete' | 'processing' | 'error' | null

interface StatusResponse {
  status: string
  customer_email?: string
}

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<OrderStatus>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const hasProcessed = useRef(false)
  const { clearCart } = useCart()

  const fetchPaymentIntentStatus = async (paymentIntentId: string) => {
    try {
      const response = await fetch(
        `/api/checkout/retrieve-stripe-payment-intent-status?payment_intent=${paymentIntentId}`
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error ${response.status}:`, errorText)
        return { error: `Failed to retrieve payment status (${response.status})` }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        return { error: 'Invalid response from payment API' }
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching payment status:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    // Prevent duplicate processing on re-renders
    if (hasProcessed.current) return
    hasProcessed.current = true

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const paymentIntent = urlParams.get('payment_intent')
    const giftCardOnly = urlParams.get('gift_card_only')
    const email = sessionStorage.getItem('checkoutEmail') || ''
    sessionStorage.removeItem('checkoutEmail')

    // Gift-card-only checkout: no Stripe involved.
    if (giftCardOnly === '1') {
      setStatus('complete')
      setCustomerEmail(email)
      setIsLoading(false)
      return
    }

    // If no payment intent, not a valid success page
    if (!paymentIntent) {
      setIsLoading(false)
      return
    }

    // Handle Stripe Payment Intent success
    fetchPaymentIntentStatus(paymentIntent)
      .then((response) => {
        if (response.error) {
          console.error('Error fetching Payment Intent status:', response.error)
          setStatus('error')
          return
        }
        const statusMap: { [key: string]: OrderStatus } = {
          succeeded: 'complete',
          processing: 'processing',
          requires_payment_method: 'error',
        }
        setStatus((statusMap[response.status] as OrderStatus) || 'processing')
        setCustomerEmail(response.customer_email || email)
      })
      .catch((error) => {
        console.error('Error fetching Payment Intent status:', error)
        setStatus('error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (status === 'complete') {
      clearCart()
    }
  }, [status, clearCart])

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Processing Order"
          subtitle="Please wait while we process your payment..."
        />
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <div className="flex justify-center">
              <Loader className="h-12 w-12 animate-spin text-primary" />
            </div>
            <p className="mt-4 font-body text-muted-foreground">
              Verifying your payment...
            </p>
          </div>
        </section>
      </>
    )
  }

  if (status === 'processing') {
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

  if (status === 'error') {
    return (
      <>
        <PageHeader
          title="Payment Error"
          subtitle="There was an issue processing your payment"
        />
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-sm border border-red-200 bg-red-50 p-8 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-foreground">
                Payment Error
              </h2>
              <p className="mt-2 font-body text-muted-foreground">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/checkout"
                  className="inline-flex rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Try Again
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
                <li className="flex items-start gap-3 font-body text-muted-foreground">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    ✓
                  </span>
                  <span>
                    You'll receive an order confirmation email with your receipt
                    {customerEmail && ` to: `}
                    {customerEmail && (
                      <strong className="block text-foreground">{customerEmail}</strong>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3 font-body text-muted-foreground">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    ✓
                  </span>
                  <span>We'll send you shipping updates as your order is processed</span>
                </li>
                <li className="flex items-start gap-3 font-body text-muted-foreground">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    ✓
                  </span>
                  <span>
                    Your order will be shipped according to the shipping method you selected
                  </span>
                </li>
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
              Need help? Email us at support@stoneiwc.com or check your email for order details.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
