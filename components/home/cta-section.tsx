import { BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"
import { Phone } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 bg-card overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,hsl(var(--primary)/0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.06),transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Schedule Your Consultation
        </p>
        <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
          Begin Restoring Your Body from the Inside Out
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
          Book our practitioners for personalized lymphatic care, non-surgical
          body contouring, restorative hand and foot care, holistic nourishment
          guidance, refined semi-permanent aesthetics, or any of our 100+
          concierge services. We come to you -- and every service funds
          The Source of Hope.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Schedule a Consultation
          </a>
          <a
            href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-10 py-3.5 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            {CONTACT_INFO.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
