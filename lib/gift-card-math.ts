// Gift card amount rules, shared by the server (lib/pricing.ts) and the
// checkout page, so the amount the customer sees is the amount Stripe charges.
//
// Gift cards cover merchandise only; shipping is always paid in cash. The
// amount is also capped so the charge never falls below Stripe's minimum.

export const MIN_STRIPE_CHARGE = 0.5 // Stripe rejects USD charges under $0.50

const round2 = (n: number) => Math.round(n * 100) / 100

export function giftCardAmount({
  merchandise,
  shipping,
  balance,
}: {
  merchandise: number
  shipping: number
  balance: number
}): number {
  const merch = Math.max(0, merchandise)
  const cap = Math.max(0, merch + shipping - MIN_STRIPE_CHARGE)
  return round2(Math.max(0, Math.min(balance, merch, cap)))
}
