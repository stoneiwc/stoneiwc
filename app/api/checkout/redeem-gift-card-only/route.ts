import { NextResponse } from 'next/server'
import { getGiftCardByCode, redeemGiftCard } from '@/lib/gift-cards'

type Body = {
  giftCardCode?: string
  appliedAmount?: number
  email?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { giftCardCode, appliedAmount, email } = body

  if (!giftCardCode) {
    return NextResponse.json({ error: 'Gift card code is required.' }, { status: 400 })
  }

  if (!appliedAmount || typeof appliedAmount !== 'number' || appliedAmount <= 0) {
    return NextResponse.json({ error: 'A positive applied amount is required.' }, { status: 400 })
  }

  const card = await getGiftCardByCode(giftCardCode)

  if (!card) {
    return NextResponse.json({ error: 'Gift card not found.' }, { status: 404 })
  }

  if (card.status !== 'active' || card.currentBalance <= 0) {
    return NextResponse.json({ error: 'Gift card has no remaining balance.' }, { status: 400 })
  }

  if (new Date(card.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Gift card has expired.' }, { status: 400 })
  }

  if (appliedAmount > card.currentBalance + 0.001) {
    return NextResponse.json(
      { error: 'Applied amount exceeds remaining balance.' },
      { status: 400 },
    )
  }

  const orderId = `giftcard-only-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  try {
    const result = await redeemGiftCard(giftCardCode, appliedAmount, orderId)
    return NextResponse.json({
      ok: true,
      orderId,
      applied: result.applied,
      remainingBalance: result.remainingBalance,
      status: result.status,
      email: email ?? null,
    })
  } catch (err) {
    console.error('Gift card only redeem error:', err)
    return NextResponse.json({ error: 'Failed to redeem gift card.' }, { status: 500 })
  }
}
