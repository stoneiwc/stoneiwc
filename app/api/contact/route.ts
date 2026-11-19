import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { contactEmailHtml, contactEmailText } from "@/lib/email/contact-template"
import {
  contactAutoReplyHtml,
  contactAutoReplyText,
} from "@/lib/email/contact-autoreply-template"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTripped, type HoneypotFields } from "@/lib/honeypot"
import { isFilledTooFast, spamSignals, type FillTimeFields } from "@/lib/contact-spam"
import { isValidEmail } from "@/lib/validation"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ContactFormPayload extends HoneypotFields, FillTimeFields {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
}

// Generous for real messages; stops oversized payloads reaching Resend.
const MAX_LENGTH = { name: 100, phone: 40, message: 5000 }

export async function POST(req: NextRequest) {
  const limited = await rateLimit("contact", req, "Too many submissions. Please try again later.")
  if (limited) return limited

  let body: ContactFormPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // Honeypot filled → a bot. Answer like a normal send, but email nobody.
  if (isHoneypotTripped(body)) {
    console.warn("Contact form honeypot tripped; submission dropped")
    return NextResponse.json({ success: true })
  }

  // Posted instantly, or without the browser form at all. Same silent drop.
  if (isFilledTooFast(body)) {
    console.warn("Contact form submitted too fast; submission dropped")
    return NextResponse.json({ success: true })
  }

  const { firstName, lastName, email, phone, message } = body

  const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0
  if (!isText(firstName) || !isText(lastName) || !isText(email) || !isText(message)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const data = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: typeof phone === "string" ? phone.trim() : undefined,
    message: message.trim(),
  }

  if (!isValidEmail(data.email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  if (
    data.firstName.length > MAX_LENGTH.name ||
    data.lastName.length > MAX_LENGTH.name ||
    (data.phone?.length ?? 0) > MAX_LENGTH.phone ||
    data.message.length > MAX_LENGTH.message
  ) {
    return NextResponse.json(
      { error: `Please keep names under ${MAX_LENGTH.name} characters and the message under ${MAX_LENGTH.message}.` },
      { status: 400 },
    )
  }
  const signals = spamSignals(data)
  if (signals.length > 0) {
    console.warn(`Contact form flagged as possible spam: ${signals.join(", ")}`)
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.CONTACT_EMAIL_TO!,
    replyTo: data.email,
    subject: `${signals.length > 0 ? "[Possible spam] " : ""}New Contact Message — ${data.firstName} ${data.lastName}`,
    html: contactEmailHtml(data),
    text: contactEmailText(data),
  })

  if (error) {
    console.error("Resend error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  // Flagged submissions get no auto-reply (see lib/contact-spam.ts).
  if (signals.length > 0) {
    return NextResponse.json({ success: true })
  }

  // Auto-reply to the customer. We don't fail the request if this errors —
  // the team has already received the submission, which is the critical path.
  const { error: autoReplyError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: data.email,
    replyTo: process.env.CONTACT_EMAIL_TO!,
    subject: "We received your message — Stone IWC",
    html: contactAutoReplyHtml({ firstName: data.firstName }),
    text: contactAutoReplyText({ firstName: data.firstName }),
  })
  if (autoReplyError) {
    console.error("Contact auto-reply error:", autoReplyError)
  }

  return NextResponse.json({ success: true })
}
