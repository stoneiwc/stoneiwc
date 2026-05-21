import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createPendingOrder } from '@/lib/orders'

type CheckoutItem = {
  id?: string
  name?: string
  title?: string
  slug?: string
  image?: string
  price?: number
  quantity?: number
}

type CheckoutAddress = {
  firstName?: string
  lastName?: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

type CreateStripePaymentIntentBody = {
  items?: CheckoutItem[]
  subtotal?: number
  couponCode?: string
  couponDiscount?: number
  shippingMethod?: string
  shippingCost?: number
  shippingAddress?: CheckoutAddress
  billingAddress?: CheckoutAddress
  billingSameAsShipping?: boolean
  totalAmount?: number | string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  giftCardCode?: string
  giftCardAppliedAmount?: number
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe payment intent endpoint is available. Use POST to create a payment intent.',
  })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: 'GET,POST,OPTIONS' } })
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey)
    const body = (await request.json()) as CreateStripePaymentIntentBody
    const {
      items,
      subtotal,
      couponCode,
      couponDiscount,
      shippingMethod,
      shippingCost,
      shippingAddress,
      billingAddress,
      billingSameAsShipping,
      totalAmount,
      email,
      firstName,
      lastName,
      phone,
      giftCardCode,
      giftCardAppliedAmount,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 })
    }

    if (totalAmount === undefined || totalAmount === null || Number.isNaN(Number(totalAmount))) {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 })
    }

    const amountInCents = Math.round(Number(totalAmount) * 100)

    const truncate = (s: string, max = 500) =>
      s.length <= max ? s : s.slice(0, max - 1) + '…'
    const itemsSummary = truncate(
      items
        .map((i) => `${Number(i.quantity ?? 1)}× ${i.name ?? i.title ?? 'item'}`)
        .join(', '),
      480,
    )
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

    // Rich metadata — everything an admin needs is visible in the Stripe
    // Dashboard without opening Sanity Studio.
    const metadata: Record<string, string> = {
      order_type: 'storefront',
      customer_email: email || '',
      customer_name: fullName,
      items_count: String(items.length),
      items_summary: itemsSummary,
      subtotal: subtotal != null ? Number(subtotal).toFixed(2) : '0.00',
      shipping_method: shippingMethod || 'standard',
      shipping_cost: shippingCost ? Number(shippingCost).toFixed(2) : '0.00',
      ship_name:
        `${shippingAddress?.firstName ?? firstName ?? ''} ${shippingAddress?.lastName ?? lastName ?? ''}`.trim(),
      ship_line1: shippingAddress?.address ?? '',
      ship_line2: shippingAddress?.addressLine2 ?? '',
      ship_city: shippingAddress?.city ?? '',
      ship_state: shippingAddress?.state ?? '',
      ship_postal: shippingAddress?.zipCode ?? '',
      ship_country: shippingAddress?.country ?? '',
      ...(phone && { customer_phone: phone }),
      ...(couponCode && {
        coupon_code: couponCode,
        coupon_discount: Number(couponDiscount ?? 0).toFixed(2),
      }),
      ...(giftCardCode && { gift_card_code: giftCardCode }),
      ...(giftCardAppliedAmount !== undefined &&
        giftCardAppliedAmount > 0 && {
          gift_card_applied_amount: Number(giftCardAppliedAmount).toFixed(2),
        }),
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata,
      shipping: shippingAddress
        ? {
            name: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
            phone: phone || undefined,
            address: {
              line1: shippingAddress.address || '',
              line2: shippingAddress.addressLine2 || undefined,
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              postal_code: shippingAddress.zipCode || '',
              country: shippingAddress.country || 'US',
            },
          }
        : undefined,
    })

    // Mirror the order into Sanity so admins can manage fulfillment in Studio.
    // Errors here don't break checkout — the customer can still pay; we just
    // log and rely on the Stripe Dashboard fallback for that PaymentIntent.
    try {
      const orderItems = items.map((item) => {
        const quantity = Number(item.quantity ?? 1)
        const unitPrice = Number(item.price ?? 0)
        return {
          productId: item.id,
          name: item.name ?? item.title ?? 'Item',
          slug: item.slug,
          image: item.image,
          quantity,
          unitPrice,
          lineTotal: Math.round(unitPrice * quantity * 100) / 100,
        }
      })

      const computedSubtotal =
        subtotal != null
          ? Number(subtotal)
          : orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

      await createPendingOrder({
        stripePaymentIntentId: paymentIntent.id,
        customer: {
          email: email ?? '',
          firstName,
          lastName,
          phone,
        },
        shippingAddress: shippingAddress
          ? {
              line1: shippingAddress.address,
              line2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.zipCode,
              country: shippingAddress.country,
            }
          : {},
        billingAddress: billingAddress
          ? {
              line1: billingAddress.address,
              line2: billingAddress.addressLine2,
              city: billingAddress.city,
              state: billingAddress.state,
              postalCode: billingAddress.zipCode,
              country: billingAddress.country,
            }
          : {},
        billingSameAsShipping: billingSameAsShipping ?? false,
        items: orderItems,
        subtotal: computedSubtotal,
        couponCode,
        couponDiscount: couponDiscount ? Number(couponDiscount) : undefined,
        shippingMethod: shippingMethod ?? 'standard',
        shippingCost: shippingCost ? Number(shippingCost) : 0,
        giftCardCode,
        giftCardApplied:
          giftCardAppliedAmount !== undefined ? Number(giftCardAppliedAmount) : undefined,
        total: Number(totalAmount),
      })
    } catch (err) {
      console.error('Sanity order creation failed for PaymentIntent', paymentIntent.id, err)
      // intentionally do not throw — checkout continues
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment Intent creation error:', error)
    const details = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create payment intent', details },
      { status: 500 },
    )
  }
}
