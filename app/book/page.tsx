import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Clock, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { BookingTabs } from "@/components/booking-tabs"
import {
  getEventTypes,
  filterEventsByCategory,
  type BookingCategory,
} from "@/lib/cal-api"

export const metadata: Metadata = {
  title: "Book a Service",
  description:
    "Schedule a professional treatment, concierge visit, or virtual consultation with Stone IWC.",
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function BookPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = (category as BookingCategory) ?? "all"

  const username = process.env.NEXT_PUBLIC_CAL_USERNAME!
  const allEvents = await getEventTypes(username)
  const events = filterEventsByCategory(allEvents, activeCategory)

  return (
    <>
      <PageHeader
        title="Book a Service"
        subtitle="Select a service below to schedule your appointment. All services available in-person or via concierge."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          {/* Tab bar */}
          <Suspense>
            <BookingTabs />
          </Suspense>

          {/* Event grid */}
          {events.length === 0 ? (
            <div className="mt-16 rounded-sm border border-border bg-card p-12 text-center">
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
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {event.length} min
                    </span>
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
                    {event.price > 0 ? (
                      <span className="text-sm font-body font-bold text-foreground">
                        {(event.price / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: event.currency.toUpperCase(),
                        })}
                      </span>
                    ) : (
                      <span className="text-sm font-body text-muted-foreground">
                        Contact for pricing
                      </span>
                    )}

                    <Link
                      href={`/book/${event.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      Book Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
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
      </section>
    </>
  )
}
