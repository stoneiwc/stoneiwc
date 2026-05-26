import { NextResponse } from 'next/server'
import { getGiftCardByCode } from '@/lib/gift-cards'

export async function GET(request: Request) {
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
