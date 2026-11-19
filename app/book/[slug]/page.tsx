import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, ArrowLeft } from "lucide-react"
import { CalBooker } from "@/components/cal-booker"
import { pageMetadata } from "@/lib/seo"
import {
  getEventTypes,
  getCategoryFromSlug,
  BOOKING_CATEGORIES,
} from "@/lib/cal-api"

type Props = {
  params: Promise<{ slug: string }>
}

// Re-check Cal.com every 5 minutes (CAL_EVENTS_REVALIDATE_SECONDS; route
// config must be a literal). Services added since the last build render on
// first visit.
export const revalidate = 300

export async function generateStaticParams() {
  try {
    const events = await getEventTypes(process.env.NEXT_PUBLIC_CAL_USERNAME!)
    return events.map((event) => ({ slug: event.slug }))
  } catch (err) {
    // Don't fail the deploy because Cal.com is down; pages render on demand.
    console.error("Could not prebuild booking pages:", err)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME!
  const events = await getEventTypes(username).catch(() => [])
  const event = events.find((e) => e.slug === slug)

  return pageMetadata({
    title: event ? `Book ${event.title}` : "Book a Service",
    // Cal.com descriptions can be long and contain newlines; keep the meta tag short.
    description: (event?.description ?? "Schedule your appointment with Stone IWC.").replace(/\s+/g, " ").slice(0, 300),
    path: `/book/${slug}`,
  })
}

export default async function BookingSlugPage({ params }: Props) {
  const { slug } = await params
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME!

  const events = await getEventTypes(username)
  const event = events.find((e) => e.slug === slug)

  if (!event) return notFound()

  const category = getCategoryFromSlug(slug)
  const categoryLabel = BOOKING_CATEGORIES.find((c) => c.value === category)?.label

  const backHref = category ? `/book?category=${category}` : "/book"

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {categoryLabel ?? "All Services"}
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[320px_1fr]">
          {/* Left: Service detail */}
          <aside className="flex flex-col gap-6">
            <div>
              {categoryLabel && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-body font-bold uppercase tracking-[0.2em] text-primary">
                  {categoryLabel}
                </span>
              )}
              <h1 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground text-balance">
                {event.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-body text-foreground">
                {event.lengthInMinutes} minutes
              </span>
            </div>

            {event.price > 0 && (
              <div className="rounded-sm border border-border bg-card px-4 py-3">
                <p className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Starting from
                </p>
                <p className="mt-1 font-sans text-2xl font-semibold text-foreground">
                  {(event.price / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: event.currency.toUpperCase(),
                  })}
                </p>
              </div>
            )}

            {event.description && (
              <div className="rounded-sm border border-border bg-card p-4">
                <p className="text-sm leading-relaxed text-muted-foreground font-body">
                  {event.description}
                </p>
              </div>
            )}

            <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-body font-bold uppercase tracking-[0.2em] text-primary">
                Questions?
              </p>
              <p className="mt-2 text-sm font-body text-muted-foreground">
                Contact us before booking if you have any questions about this
                service.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex text-sm font-body font-bold text-primary underline-offset-4 hover:underline"
              >
                Get in touch
              </Link>
            </div>
          </aside>

          {/* Right: Cal.com embed */}
          <div className="min-h-[600px]">
            <CalBooker calLink={`${username}/${slug}`} />
          </div>
        </div>
      </div>
    </section>
  )
}
