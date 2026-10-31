// Spam honeypot shared by the public form endpoints (contact, checkout, gift
// cards). Each form renders an extra input that people never see; most bots
// fill every input they find. A request with this field filled gets a normal
// success response but no side effects, so the bot learns nothing.
//
// The name is chosen so no browser or password manager autofills it. Don't
// rename it to anything like email, company, website, phone or code — a real
// visitor's autofill would then trip it and their submission would vanish.
export const HONEYPOT_FIELD = "reference_note"

export type HoneypotFields = { [HONEYPOT_FIELD]?: string }

export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD]
  if (value === undefined || value === null) return false
  return typeof value !== "string" || value.trim() !== ""
}

// A well-formed but nonexistent PaymentIntent for answering bots on the
// payment endpoints. Nothing is created in Stripe.
export function decoyPaymentIntent() {
  const hex = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24)
  const id = `pi_${hex()}`
  return { id, clientSecret: `${id}_secret_${hex()}` }
}
