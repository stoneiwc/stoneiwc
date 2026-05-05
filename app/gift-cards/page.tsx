'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { PageHeader } from '@/components/page-header'

const PRESET_AMOUNTS = [25, 50, 100, 150, 200]

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
}

function PaymentForm({ amount, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'An error occurred.')
      setIsProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/gift-cards/success`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed.')
      setIsProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-body font-semibold text-red-800">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Purchase $${amount} Gift Card`
        )}
      </button>
      <p className="text-center text-xs font-body text-muted-foreground">
        Your payment information is encrypted and secure
      </p>
    </form>
  )
}

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const finalAmount = isCustom ? Number(customAmount) : selectedAmount

  const isFormValid =
    finalAmount >= 1 &&
    finalAmount <= 500 &&
    !isNaN(finalAmount) &&
    isValidEmail(purchaserEmail) &&
    (recipientEmail === '' || isValidEmail(recipientEmail))

  const handleProceed = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const keyRes = await fetch('/api/checkout/retrieve-stripe-publishable-key', { method: 'POST' })
      const keyData = await keyRes.json()
      if (!keyData.publishableKey) throw new Error('Failed to load payment system.')

      const res = await fetch('/api/gift-cards/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          purchaserEmail,
          recipientEmail: recipientEmail || purchaserEmail,
        }),
      })
      const data = await res.json()
      if (data.error || !data.clientSecret) throw new Error(data.error || 'Failed to initialize payment.')

      setStripePromise(loadStripe(keyData.publishableKey))
      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <>
        <PageHeader title="Gift Card Sent!" subtitle="Your gift card is on its way." />
        <section className="py-16">
          <div className="mx-auto max-w-lg px-6 text-center">
            <div className="rounded-sm border border-border bg-card p-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-sans text-2xl font-semibold text-foreground">Purchase Complete</h2>
              <p className="mt-4 font-body text-muted-foreground">
                The gift card code will be delivered to{' '}
                <strong className="text-foreground">{recipientEmail || purchaserEmail}</strong> shortly.
              </p>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Gift Cards"
        subtitle="Give the gift of wellness. Redeemable on any product at Stone IWC."
      />

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-sm border border-border bg-card p-8">
            {!clientSecret ? (
              <div className="space-y-8">
                {/* Amount Selection */}
                <div>
                  <h2 className="font-sans text-lg font-semibold text-foreground">Select Amount</h2>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setSelectedAmount(amt); setIsCustom(false) }}
                        className={`rounded-sm border py-3 text-sm font-body font-bold tracking-wide transition-colors ${
                          !isCustom && selectedAmount === amt
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background text-foreground hover:border-primary'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setIsCustom(true)}
                      className={`w-full rounded-sm border py-3 text-sm font-body font-bold tracking-wide transition-colors ${
                        isCustom
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background text-foreground hover:border-primary'
                      }`}
                    >
                      Custom Amount
                    </button>
                    {isCustom && (
                      <div className="relative mt-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-muted-foreground">$</span>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount (max $500)"
                          className="w-full rounded-sm border border-input bg-background py-2 pl-7 pr-3 text-sm font-body text-foreground outline-none transition-colors focus:border-primary"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <h2 className="font-sans text-lg font-semibold text-foreground">Details</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        value={purchaserEmail}
                        onChange={(e) => setPurchaserEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Recipient Email <span className="normal-case font-normal">(optional — leave blank to send to yourself)</span>
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-sm border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-body font-semibold text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={!isFormValid || isLoading}
                  className="w-full rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  {isLoading ? 'Loading...' : `Continue to Payment — $${isNaN(finalAmount) ? '0' : finalAmount}`}
                </button>
              </div>
            ) : stripePromise ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-foreground">${finalAmount} Gift Card</p>
                    <p className="text-sm font-body text-muted-foreground">
                      Sending to {recipientEmail || purchaserEmail}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setClientSecret(null); setStripePromise(null) }}
                    className="text-xs font-medium text-primary hover:text-primary/90"
                  >
                    Edit
                  </button>
                </div>

                <div className="h-px bg-border" />

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    amount={finalAmount}
                    onSuccess={() => setIsSuccess(true)}
                  />
                </Elements>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
