import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: 'Gift card code is required.' }, { status: 400 })
  }

  const stripe = new Stripe(stripeSecretKey)

  const promoCodes = await stripe.promotionCodes.list({
    code,
    limit: 1,
    expand: ['data.promotion.coupon'],
  })

  if (promoCodes.data.length === 0) {
    return NextResponse.json({ valid: false, error: 'Gift card not found.' }, { status: 404 })
  }

  const promoCode = promoCodes.data[0]

  if (!promoCode.active) {
    return NextResponse.json({ valid: false, error: 'This gift card has already been redeemed.' })
  }

  if (promoCode.expires_at && promoCode.expires_at < Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ valid: false, error: 'This gift card has expired.' })
  }

  if (promoCode.max_redemptions && promoCode.times_redeemed >= promoCode.max_redemptions) {
    return NextResponse.json({ valid: false, error: 'This gift card has already been redeemed.' })
  }

  const couponData = promoCode.promotion.coupon
  const coupon = typeof couponData === 'string' ? null : (couponData as Stripe.Coupon)
  const amountOff = coupon?.amount_off ? coupon.amount_off / 100 : 0

  return NextResponse.json({
    valid: true,
    code: promoCode.code,
    amount: amountOff,
    promotionCodeId: promoCode.id,
  })
}
