import { NextResponse } from 'next/server'
import { getGiftCardByCode } from '@/lib/gift-cards'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Codes are bearer credentials and this returns balances, so cap how fast
  // one client can try codes.
  const limited = await rateLimit('giftCardLookup', request, 'Too many attempts. Please try again later.')
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Gift card code is required.' }, { status: 400 })
  }

  const card = await getGiftCardByCode(code)

  if (!card) {
    return NextResponse.json({ valid: false, error: 'Gift card not found.' }, { status: 404 })
  }

  if (card.status === 'redeemed' || card.currentBalance <= 0) {
    return NextResponse.json({ valid: false, error: 'This gift card has no remaining balance.' })
  }

  if (card.status === 'expired' || new Date(card.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This gift card has expired.' })
  }

  return NextResponse.json({
    valid: true,
    code: card.code,
    balance: card.currentBalance,
    originalAmount: card.originalAmount,
  })
}
