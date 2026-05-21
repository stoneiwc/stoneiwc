'use client'

import { useState, useEffect } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { CartItem } from '@/lib/cart-context'
import type { SanityShippingMethod } from '@/lib/sanity.queries'
import type { AppliedGiftCard } from '@/app/checkout/page'

interface CheckoutFormState {
  email: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  shippingAddressLine1: string
  shippingAddressLine2: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountry: string
  shippingSameAsBilling: boolean
  shippingMethod: string
}

interface PaymentFormProps {
  clientSecret: string
  total: number
  onSuccess: (paymentIntent: any) => void
}

function PaymentForm({ clientSecret, total, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'An error occurred')
      setIsProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Complete Purchase • $${total.toFixed(2)}`
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  )
}

interface SelfCheckoutSectionProps {
  items: CartItem[]
  totalPrice: number
  onShippingMethodChange: (method: string, cost: number) => void
  shippingCost: number
  appliedGiftCard: AppliedGiftCard | null
  giftCardDiscount: number
  onGiftCardChange: (giftCard: AppliedGiftCard | null) => void
}

export default function SelfCheckoutSection({
  items,
  totalPrice,
  onShippingMethodChange,
  shippingCost,
  appliedGiftCard,
  giftCardDiscount,
  onGiftCardChange,
}: SelfCheckoutSectionProps) {
  // Initialize form with saved shipping method or default to 'standard'
  const [form, setForm] = useState<CheckoutFormState>(() => ({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: 'US',
    shippingSameAsBilling: true,
    shippingMethod: '',
  }))

  const [shippingMethods, setShippingMethods] = useState<SanityShippingMethod[]>([])
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [giftCardInput, setGiftCardInput] = useState('')
  const [giftCardError, setGiftCardError] = useState<string | null>(null)
  const [isValidatingGiftCard, setIsValidatingGiftCard] = useState(false)

  const handleApplyGiftCard = async () => {
    const code = giftCardInput.trim().toUpperCase()
    if (!code) return
    setGiftCardError(null)
    setIsValidatingGiftCard(true)
    try {
      const res = await fetch(`/api/gift-cards/validate?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!data.valid) {
        setGiftCardError(data.error || 'Invalid gift card code.')
      } else {
        onGiftCardChange({ code: data.code, balance: data.balance })
        setGiftCardInput('')
      }
    } catch {
      setGiftCardError('Failed to validate gift card. Please try again.')
    } finally {
      setIsValidatingGiftCard(false)
    }
  }

  // Fetch shipping methods and restore saved selection
  useEffect(() => {
    fetch('/api/shipping-methods')
      .then((r) => r.json())
      .then((methods: SanityShippingMethod[]) => {
        setShippingMethods(methods)
        const savedMethod =
          (typeof window !== 'undefined' && localStorage.getItem('selectedShippingMethod')) ||
          (methods[0]?.id ?? '')
        const shipping = methods.find((m) => m.id === savedMethod)
        if (shipping) {
          setForm((prev) => ({ ...prev, shippingMethod: shipping.id }))
          onShippingMethodChange(shipping.name, shipping.cost)
        }
      })
  }, [onShippingMethodChange])

  const updateField = <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'shippingMethod') {
      // Save selected shipping method to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedShippingMethod', String(value))
      }
      
      const method = shippingMethods.find((m) => m.id === value)
      if (method) {
        onShippingMethodChange(method.name, method.cost)
      }
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateZipCode = (zipCode: string) => {
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipCode.length === 0 || zipRegex.test(zipCode)
  }

  const isFormValid = () => {
    return (
      form.email &&
      form.firstName &&
      form.lastName &&
      form.addressLine1 &&
      form.city &&
      form.state &&
      form.postalCode &&
      validateEmail(form.email) &&
      validateZipCode(form.postalCode) &&
      form.shippingMethod &&
      (!form.shippingSameAsBilling
        ? form.shippingAddressLine1 &&
          form.shippingCity &&
          form.shippingState &&
          form.shippingPostalCode
        : true)
    )
  }

  const initializePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Zero-total checkout (gift card covers everything): skip Stripe entirely.
      if (totalPrice <= 0 && appliedGiftCard && giftCardDiscount > 0) {
        const res = await fetch('/api/checkout/redeem-gift-card-only', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            giftCardCode: appliedGiftCard.code,
            appliedAmount: giftCardDiscount,
            email: form.email,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to finalize order.')
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedShippingMethod')
          sessionStorage.setItem('checkoutEmail', form.email)
          window.location.href = `/checkout/success?gift_card_only=1&order=${encodeURIComponent(
            data.orderId,
          )}`
        }
        return
      }

      // Fetch Stripe publishable key
      const keyResponse = await fetch('/api/checkout/retrieve-stripe-publishable-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const keyData = await keyResponse.json()

      if (keyData.error || !keyData.publishableKey) {
        throw new Error('Failed to load payment system')
      }

      const stripe = await loadStripe(keyData.publishableKey)
      setStripePromise(stripe)

      // Create Payment Intent
      const response = await fetch('/api/checkout/create-stripe-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          shippingMethod: form.shippingMethod,
          shippingCost,
          totalAmount: totalPrice,
          email: form.email,
          giftCardCode: appliedGiftCard?.code,
          giftCardAppliedAmount: appliedGiftCard ? giftCardDiscount : undefined,
          shippingAddress: {
            firstName: form.shippingSameAsBilling ? form.firstName : form.firstName,
            lastName: form.shippingSameAsBilling ? form.lastName : form.lastName,
            address: form.shippingSameAsBilling ? form.addressLine1 : form.shippingAddressLine1,
            city: form.shippingSameAsBilling ? form.city : form.shippingCity,
            state: form.shippingSameAsBilling ? form.state : form.shippingState,
            zipCode: form.shippingSameAsBilling ? form.postalCode : form.shippingPostalCode,
            country: form.shippingSameAsBilling ? form.country : form.shippingCountry,
          },
          billingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.addressLine1,
            city: form.city,
            state: form.state,
            zipCode: form.postalCode,
            country: form.country,
          },
        }),
      })

      const data = await response.json()

      if (data.error || !data.clientSecret) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditInformation = () => {
    setClientSecret(null)
    setStripePromise(null)
    setError(null)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Clear selected shipping method on successful payment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedShippingMethod')
    }
    // Redirect to success page
    if (typeof window !== 'undefined') {
      window.location.href = `/checkout/success?payment_intent=${paymentIntent.id}`
    }
  }

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="font-sans text-2xl font-semibold tracking-wide text-foreground">
        Payment Information
      </h2>
      <p className="mt-2 text-sm font-body text-muted-foreground">
        Provide the billing and contact details required to create and confirm a Stripe payment intent.
      </p>

      {!clientSecret ? (
        <div className="mt-8 space-y-8">
          {/* Customer Details */}
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">
              Customer Details
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">
              Billing Address
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="addressLine1"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Address Line 1 *
                </label>
                <input
                  id="addressLine1"
                  required
                  value={form.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="addressLine2"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Address Line 2
                </label>
                <input
                  id="addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => updateField('addressLine2', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  City *
                </label>
                <input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  State / Province *
                </label>
                <input
                  id="state"
                  required
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Postal Code *
                </label>
                <input
                  id="postalCode"
                  required
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Country *
                </label>
                <select
                  id="country"
                  required
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-sans text-lg font-semibold text-foreground">
                Shipping Address
              </h3>
              <label className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.shippingSameAsBilling}
                  onChange={(e) => updateField('shippingSameAsBilling', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Same as billing
              </label>
            </div>

            {!form.shippingSameAsBilling && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddressLine1"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Address Line 1 *
                  </label>
                  <input
                    id="shippingAddressLine1"
                    required={!form.shippingSameAsBilling}
                    value={form.shippingAddressLine1}
                    onChange={(e) => updateField('shippingAddressLine1', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddressLine2"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Address Line 2
                  </label>
                  <input
                    id="shippingAddressLine2"
                    value={form.shippingAddressLine2}
                    onChange={(e) => updateField('shippingAddressLine2', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingCity"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    City *
                  </label>
                  <input
                    id="shippingCity"
                    required={!form.shippingSameAsBilling}
                    value={form.shippingCity}
                    onChange={(e) => updateField('shippingCity', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingState"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    State / Province *
                  </label>
                  <input
                    id="shippingState"
                    required={!form.shippingSameAsBilling}
                    value={form.shippingState}
                    onChange={(e) => updateField('shippingState', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingPostalCode"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Postal Code *
                  </label>
                  <input
                    id="shippingPostalCode"
                    required={!form.shippingSameAsBilling}
                    value={form.shippingPostalCode}
                    onChange={(e) => updateField('shippingPostalCode', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingCountry"
                    className="mb-2 block text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Country *
                  </label>
                  <select
                    id="shippingCountry"
                    required={!form.shippingSameAsBilling}
                    value={form.shippingCountry}
                    onChange={(e) => updateField('shippingCountry', e.target.value)}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-body text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">
              Shipping Method
            </h3>
            <div className="mt-4 space-y-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 rounded-sm border border-input p-4 cursor-pointer transition-colors hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={form.shippingMethod === method.id}
                    onChange={(e) => updateField('shippingMethod', e.target.value)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-body font-semibold text-foreground">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-foreground">
                    {method.cost > 0 ? `$${method.cost.toFixed(2)}` : 'FREE'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Gift Card */}
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">Gift Card</h3>
            {appliedGiftCard ? (
              <div className="mt-4 flex items-center justify-between rounded-sm border border-border bg-background p-4">
                <div>
                  <p className="font-body font-semibold text-foreground">{appliedGiftCard.code}</p>
                  <p className="text-xs text-primary">
                    -${giftCardDiscount.toFixed(2)} applied
                    {appliedGiftCard.balance > giftCardDiscount && (
                      <span className="text-muted-foreground"> · ${(appliedGiftCard.balance - giftCardDiscount).toFixed(2)} balance remaining</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onGiftCardChange(null)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={giftCardInput}
                  onChange={(e) => { setGiftCardInput(e.target.value); setGiftCardError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyGiftCard()}
                  placeholder="STONE-XXXX-XXXX"
                  className="flex-1 rounded-sm border border-input bg-background px-3 py-2 text-sm font-body font-mono text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleApplyGiftCard}
                  disabled={!giftCardInput.trim() || isValidatingGiftCard}
                  className="rounded-sm bg-primary px-4 py-2 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  {isValidatingGiftCard ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {giftCardError && (
              <p className="mt-2 text-xs font-body text-red-600">{giftCardError}</p>
            )}
          </div>

          {error && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={initializePayment}
            disabled={!isFormValid() || isLoading}
            className="w-full rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
          >
            {isLoading ? 'Loading...' : 'Continue to Payment'}
          </button>
        </div>
      ) : stripePromise && clientSecret ? (
        <>
          {/* Review Contact Information */}
          <div className="mt-8 rounded-sm border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Contact & Shipping Information
              </h3>
              <button
                type="button"
                onClick={handleEditInformation}
                className="text-xs font-medium text-primary transition-colors hover:text-primary/90"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">{form.firstName} {form.lastName}</strong>
              </div>
              <div>{form.email}</div>
              <div>{form.phone}</div>
              <div>
                {form.addressLine1}
                {form.addressLine2 && `, ${form.addressLine2}`}
              </div>
              <div>
                {form.city}, {form.state} {form.postalCode}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="mt-8">
            <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Payment Information
            </h3>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                total={totalPrice}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </>
      ) : null}
    </div>
  )
}
