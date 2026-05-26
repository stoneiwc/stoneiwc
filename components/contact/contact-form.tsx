"use client"

import { useState } from "react"
import type { ContactFormPayload } from "@/app/api/contact/route"

type Status = "idle" | "loading" | "success" | "error"

const inputClass =
  "mt-2 block w-full rounded-sm border border-border bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

const labelClass = "text-sm font-body font-bold text-foreground"

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const data: ContactFormPayload = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value.trim(),
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim() || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.status === 429) {
        throw new Error("Too many submissions. Please try again in an hour.")
      }

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Something went wrong")
      }

      setStatus("success")
      form.reset()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-sans text-xl font-semibold text-foreground">Message Sent!</h3>
        <p className="text-sm text-muted-foreground font-body">
          Thank you for reaching out. We will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-body font-bold text-primary underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input id="firstName" name="firstName" type="text" required className={inputClass} placeholder="John" />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input id="lastName" name="lastName" type="text" required className={inputClass} placeholder="Doe" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="john@example.com" />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>Phone</label>
        <input id="phone" name="phone" type="tel" className={inputClass} placeholder="(555) 000-0000" />
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea id="message" name="message" rows={4} required className={`${inputClass} resize-none`} placeholder="How can we help you?" />
      </div>

      {status === "error" && (
        <p className="text-sm font-body text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-sm bg-primary py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  )
}
