import 'server-only'
import { randomInt } from 'node:crypto'
import { client } from './sanity.client'
import { isSanityConflict } from './sanity-errors'

const VALID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export interface GiftCardDoc {
  _id: string
  _rev: string
  code: string
  originalAmount: number
  currentBalance: number
  status: 'active' | 'redeemed' | 'expired'
  purchaserName?: string
  purchaserEmail: string
  recipientName?: string
  recipientEmail: string
  note?: string
  paymentIntentId?: string
  expiresAt: string
  // Set once the gift card email has been sent (see claimGiftCardEmail).
  emailedAt?: string
  redemptions?: Array<{ orderId: string; amount: number; redeemedAt: string }>
}

const GIFT_CARD_FIELDS = `
  _id, _rev, code, originalAmount, currentBalance, status,
  purchaserName, purchaserEmail, recipientName, recipientEmail,
  note, paymentIntentId, expiresAt, emailedAt, redemptions
`

// Codes are bearer credentials, so they come from a CSPRNG.
export function generateGiftCardCode(): string {
  const segment = () =>
    Array.from({ length: 4 }, () => VALID_CHARS[randomInt(VALID_CHARS.length)]).join('')
  return `STONE-${segment()}-${segment()}`
}

interface CreateGiftCardInput {
  amount: number
  purchaserName?: string
  purchaserEmail: string
  recipientName?: string
  recipientEmail: string
  note?: string
  paymentIntentId: string
  expiresAt: Date
}

async function getGiftCardByPaymentIntent(paymentIntentId: string): Promise<GiftCardDoc | null> {
  const result = await client.fetch<GiftCardDoc | null>(
    `*[_type == "giftCard" && paymentIntentId == $pid][0]{ ${GIFT_CARD_FIELDS} }`,
    { pid: paymentIntentId },
    { cache: 'no-store' },
  )
  return result ?? null
}

// Returns the gift card for a purchase, creating it on the first call.
//
// Safe under Stripe retries and concurrent deliveries of the same event: the
// document _id is derived from the PaymentIntent, so a second create fails
// with 409 and the existing card is returned instead of minting another.
export async function getOrCreateGiftCardForPayment(input: CreateGiftCardInput): Promise<GiftCardDoc> {
  const existing = await getGiftCardByPaymentIntent(input.paymentIntentId)
  if (existing) return existing

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateGiftCardCode()
    const collision = await client.fetch<{ _id: string } | null>(
      `*[_type == "giftCard" && code == $code][0]{ _id }`,
      { code },
      { cache: 'no-store' },
    )
    if (collision) continue

    try {
      await client.create({
        _id: `giftCard-${input.paymentIntentId}`,
        _type: 'giftCard',
        code,
        originalAmount: input.amount,
        currentBalance: input.amount,
        status: 'active',
        purchaserName: input.purchaserName,
        purchaserEmail: input.purchaserEmail,
        recipientName: input.recipientName,
        recipientEmail: input.recipientEmail,
        note: input.note,
        paymentIntentId: input.paymentIntentId,
        expiresAt: input.expiresAt.toISOString(),
        redemptions: [],
      })
    } catch (err) {
      if (!isSanityConflict(err)) throw err
      // Another delivery created it first.
    }
    const card = await getGiftCardByPaymentIntent(input.paymentIntentId)
    if (card) return card
    throw new Error(`Gift card for ${input.paymentIntentId} missing after create.`)
  }

  throw new Error('Failed to generate a unique gift card code after 5 attempts.')
}

// Marks the card's email as sent, before sending it. Returns false if it was
// already claimed (sent, or being sent by a concurrent delivery). Pair a
// failed send with releaseGiftCardEmail so a Stripe retry can try again.
export async function claimGiftCardEmail(card: Pick<GiftCardDoc, '_id' | '_rev' | 'emailedAt'>): Promise<boolean> {
  if (card.emailedAt) return false
  try {
    await client
      .patch(card._id)
      .ifRevisionId(card._rev)
      .set({ emailedAt: new Date().toISOString() })
      .commit()
    return true
  } catch (err) {
    if (isSanityConflict(err)) return false
    throw err
  }
}

export async function releaseGiftCardEmail(cardId: string): Promise<void> {
  await client.patch(cardId).unset(['emailedAt']).commit()
}

export async function getGiftCardByCode(code: string): Promise<GiftCardDoc | null> {
  const normalized = code.trim().toUpperCase()
  const result = await client.fetch<GiftCardDoc | null>(
    `*[_type == "giftCard" && code == $code][0]{ ${GIFT_CARD_FIELDS} }`,
    { code: normalized },
    { cache: 'no-store' },
  )
  return result ?? null
}

export interface RedeemResult {
  applied: number
  remainingBalance: number
  status: GiftCardDoc['status']
}

const MAX_REDEEM_ATTEMPTS = 5

const round2 = (n: number) => Math.round(n * 100) / 100

// Deducts the order's amount from the card, at most once per order.
//
// Safe to call again for the same order (Stripe redelivers events, and staff
// can resend them from the dashboard): if the card's redemptions already list
// this orderId, nothing changes. The patch only commits against the revision
// that was read, so two orders on one card can't both spend the same balance;
// on a conflict the card is re-read and the deduction retried.
export async function redeemGiftCard(
  code: string,
  orderAmount: number,
  orderId: string,
): Promise<RedeemResult> {
  for (let attempt = 1; attempt <= MAX_REDEEM_ATTEMPTS; attempt++) {
    const card = await getGiftCardByCode(code)
    if (!card) {
      throw new Error(`Gift card not found: ${code}`)
    }

    const previous = card.redemptions?.find((r) => r.orderId === orderId)
    if (previous) {
      return { applied: previous.amount, remainingBalance: card.currentBalance, status: card.status }
    }

    if (card.status !== 'active') {
      return { applied: 0, remainingBalance: card.currentBalance, status: card.status }
    }

    const applied = round2(Math.min(orderAmount, card.currentBalance))
    const remainingBalance = round2(card.currentBalance - applied)
    const newStatus: GiftCardDoc['status'] = remainingBalance <= 0 ? 'redeemed' : 'active'

    try {
      await client
        .patch(card._id)
        .ifRevisionId(card._rev)
        .setIfMissing({ redemptions: [] })
        .set({ currentBalance: remainingBalance, status: newStatus })
        .append('redemptions', [
          {
            _key: `${orderId}-${Date.now()}`,
            orderId,
            amount: applied,
            redeemedAt: new Date().toISOString(),
          },
        ])
        .commit()
      return { applied, remainingBalance, status: newStatus }
    } catch (err) {
      if (!isSanityConflict(err) || attempt === MAX_REDEEM_ATTEMPTS) throw err
    }
  }

  // Unreachable: the last attempt either returns or throws.
  throw new Error(`Gift card redemption failed: ${code}`)
}
