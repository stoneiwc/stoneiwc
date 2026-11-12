import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Clock, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { BookingSidebar } from "@/components/booking-sidebar"
import { BookingSearch } from "@/components/booking-search"
import { BookingMobileBar } from "@/components/booking-mobile-bar"
import {
  BOOKING_CATEGORIES,
  getEventTypes,
  filterEventsByCategory,
  filterEventsBySearch,
  type BookingCategory,
  type CalEventType,
} from "@/lib/cal-api"

// The general consultation is pinned above the grid on the "All" view. It
// must stay in Cal.com — the booking widget needs the event type to exist.
const FEATURED_CONSULTATION_SLUG = "consultation-in-person"

function formatPrice(event: CalEventType) {
  return (event.price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: event.currency.toUpperCase(),
  })
}

function EventCard({ event }: { event: CalEventType }) {
  const isConsultation = event.slug.includes("-consultation-")
  return (
    <div className="group flex flex-col rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {event.lengthInMinutes} min
          </span>
        </div>
        {isConsultation && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-body font-bold uppercase tracking-[0.12em] text-amber-700 whitespace-nowrap">
            Consultation Service
          </span>
        )}
      </div>

      <h3 className="mt-4 font-sans text-xl font-semibold text-foreground">
        {event.title}
      </h3>

      {event.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body line-clamp-3">
          {event.description}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          {isConsultation && (
            <span className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Price for Consultation
            </span>
          )}
          {event.price > 0 ? (
            <span className="text-sm font-body font-bold text-foreground">
              {formatPrice(event)}
            </span>
          ) : event.slug.endsWith("-free") ? (
            <span className="text-sm font-body font-bold text-foreground">
              Free
            </span>
          ) : (
            <span className="text-sm font-body text-muted-foreground">
              Contact for pricing
            </span>
          )}
        </div>

        <Link
          href={`/book/${event.slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 whitespace-nowrap"
        >
          Book Now
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

const gridClass = "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"

const DESCRIPTION =
  "Schedule a professional treatment, concierge visit, or virtual consultation with Stone IWC."

export const metadata: Metadata = {
  title: "Book a Service",
  description: DESCRIPTION,
  alternates: { canonical: "/book" },
  openGraph: { title: "Book a Service | Stone IWC", description: DESCRIPTION, url: "/book", type: "website" },
  twitter: { card: "summary_large_image", title: "Book a Service | Stone IWC", description: DESCRIPTION },
}

type Props = {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function BookPage({ searchParams }: Props) {
  const { category, search } = await searchParams
  const activeCategory = (category ?? "all") as BookingCategory | "all"

  const username = process.env.NEXT_PUBLIC_CAL_USERNAME!
  const allEvents = await getEventTypes(username)
  const categoryFiltered = filterEventsByCategory(allEvents, activeCategory)
  const events = filterEventsBySearch(categoryFiltered, search ?? "")

  // On the unfiltered view, pin the general consultation and group the rest
  // by category; filtered and search views stay a flat grid.
  const isAllView = activeCategory === "all" && !search?.trim()
  const featured = isAllView
    ? events.find((e) => e.slug === FEATURED_CONSULTATION_SLUG)
    : undefined
  const listed = featured ? events.filter((e) => e !== featured) : events
  const groups = isAllView
    ? [
        ...BOOKING_CATEGORIES.map((cat) => ({
          label: cat.label,
          items: listed.filter((e) => e.slug.startsWith(cat.slugPrefix)),
        })),
        {
          label: "Other Services",
          items: listed.filter(
            (e) => !BOOKING_CATEGORIES.some((cat) => e.slug.startsWith(cat.slugPrefix)),
          ),
        },
      ].filter((group) => group.items.length > 0)
    : []

  return (
    <>
      <PageHeader
        title="Book a Service"
        subtitle="Select a service below to schedule your appointment. Services take place at our Plano location unless noted; many of our services are also available through concierge visits."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">

            {/* ── Left Sidebar (desktop) / Horizontal scroll (mobile) ── */}
            <Suspense>
              {/* Desktop sidebar */}
              <aside className="hidden lg:block w-56 shrink-0 sticky top-28">
                <BookingSearch events={allEvents} />
                <BookingSidebar />
              </aside>

              {/* Mobile search + filter sheet */}
              <div className="lg:hidden">
                <BookingMobileBar events={allEvents} />
              </div>
            </Suspense>

            {/* ── Right: event grid + CTA ── */}
            <div className="flex-1 min-w-0">
              {events.length === 0 ? (
                <div className="rounded-sm border border-border bg-card p-12 text-center">
                  <p className="font-sans text-xl font-semibold text-foreground">
                    No services available in this category yet.
                  </p>
                  <p className="mt-3 text-sm font-body text-muted-foreground">
                    Please check back soon or{" "}
                    <Link
                      href="/contact"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      contact us
                    </Link>{" "}
                    directly.
                  </p>
                </div>
              ) : isAllView ? (
                <div className="flex flex-col gap-14">
                  {featured && (
                    <div className="flex flex-col gap-6 rounded-sm border-2 border-primary bg-primary/5 p-8 md:flex-row md:items-center md:justify-between lg:p-10">
                      <div className="max-w-2xl">
                        <p className="font-body text-xs font-bold uppercase tracking-[0.3em] text-primary">
                          Not sure where to start?
                        </p>
                        <h2 className="mt-3 font-sans text-2xl font-semibold text-foreground md:text-3xl">
                          {featured.title}
                        </h2>
                        {featured.description && (
                          <p className="mt-3 text-base leading-relaxed text-muted-foreground font-body">
                            {featured.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-4 text-sm font-body text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {featured.lengthInMinutes} min
                          </span>
                          {featured.price > 0 && (
                            <span className="font-bold text-foreground">{formatPrice(featured)}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/book/${featured.slug}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                      >
                        Book a Consultation
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  {groups.map((group) => (
                    <section key={group.label}>
                      <h2 className="border-b border-border pb-3 font-sans text-2xl font-semibold text-foreground">
                        {group.label}
                      </h2>
                      <div className={`mt-6 ${gridClass}`}>
                        {group.items.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className={gridClass}>
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-16 rounded-sm border border-primary/20 bg-primary/5 p-8 text-center lg:p-12">
                <p className="font-sans text-xl font-semibold text-foreground lg:text-2xl text-balance">
                  {"Don't see what you're looking for?"}
                </p>
                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground font-body">
                  We offer many more specialized modalities and can create custom
                  treatment protocols for your specific needs.
                </p>
                <div className="mt-8">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-3 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
