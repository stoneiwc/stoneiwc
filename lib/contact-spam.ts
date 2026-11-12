// Spam checks for the contact form, on top of the honeypot in lib/honeypot.ts.
//
// Fill time: the form reports how long it was open before submit. People take
// several seconds; bots post instantly, or skip the browser entirely and post
// without the field. Either way the submission is dropped.
//
// Content signals: link-heavy messages and links in name fields are typical of
// SEO and phishing spam, but a real customer can trip them too, so those
// messages still reach the team — flagged in the subject — and skip the
// auto-reply, so the form can't be used to send mail to arbitrary addresses.
export const FILL_TIME_FIELD = "fill_ms"

const MIN_FILL_MS = 3000
const MAX_MESSAGE_LINKS = 1

// Not global: a /g regex keeps lastIndex between .test() calls.
const URL_PATTERN = /(https?:\/\/|www\.)\S+/i
const URL_PATTERN_ALL = new RegExp(URL_PATTERN.source, "gi")

export type FillTimeFields = { [FILL_TIME_FIELD]?: number }

export function isFilledTooFast(body: unknown): boolean {
  const value = (body as Record<string, unknown> | null)?.[FILL_TIME_FIELD]
  return typeof value !== "number" || !Number.isFinite(value) || value < MIN_FILL_MS
}

export function spamSignals(data: {
  firstName: string
  lastName: string
  message: string
}): string[] {
  const signals: string[] = []
  if (URL_PATTERN.test(`${data.firstName} ${data.lastName}`)) signals.push("link in name")
  const links = data.message.match(URL_PATTERN_ALL)?.length ?? 0
  if (links > MAX_MESSAGE_LINKS) signals.push(`${links} links in message`)
  return signals
}
