import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { contactEmailHtml, contactEmailText } from "@/lib/email/contact-template"
import { checkRateLimit } from "@/lib/email/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ContactFormPayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, retryAfterSeconds } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    )
  }

  let body: ContactFormPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { firstName, lastName, email, phone, message } = body

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  const data = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone?.trim(), message: message.trim() }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.CONTACT_EMAIL_TO!,
    replyTo: data.email,
    subject: `New Contact Message — ${data.firstName} ${data.lastName}`,
    html: contactEmailHtml(data),
    text: contactEmailText(data),
  })

  if (error) {
    console.error("Resend error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
