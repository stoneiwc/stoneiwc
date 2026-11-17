import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { LinkCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/ui/cta-band"
import { BOOKING_URL } from "@/lib/navigation"
import { BOOKING_CATEGORIES } from "@/lib/cal-api"
import { getServicesPageImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

const DESCRIPTION =
  "Holistic treatments at our Plano clinic, at your home or office, or by video: cupping, massage, body contouring, skin care, and more."

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: DESCRIPTION,
  path: "/services",
})

export const revalidate = 60

// Booking categories that aren't a kind of treatment.
const NOT_A_SERVICE_AREA = new Set(["consultation", "concierge"])

export default async function ServicesPage() {
  const images = await getServicesPageImages()

  const ways = [
    {
      title: "At our clinic",
      text: "Treatment rooms at 1108 W Parker Rd, Plano.",
      href: "/services/treatments",
      image: images?.treatmentsImage?.asset
        ? urlFor(images.treatmentsImage).width(900).height(675).url()
        : "/images/treatment-room.jpg",
      alt: images?.treatmentsImage?.alt ?? "A treatment room at the Plano clinic",
    },
    {
      title: "Where you are",
      text: "Concierge visits to homes, offices, hotels, churches, and events.",
      href: "/services/concierge",
      image: images?.conciergeImage?.asset
        ? urlFor(images.conciergeImage).width(900).height(675).url()
        : "/images/concierge-service.jpg",
      alt: images?.conciergeImage?.alt ?? "A concierge treatment on location",
    },
    {
      title: "By video",
      text: "Virtual consultations when you can't come in.",
      href: "/services/virtual-consultations",
      image: "/images/virtual-consultation.jpg",
      alt: "A virtual consultation on a laptop",
    },
  ]

  const areas = BOOKING_CATEGORIES.filter((c) => !NOT_A_SERVICE_AREA.has(c.value))

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Our services"
        subtitle="Holistic treatments at our Plano clinic, at your location, or by video."
      >
        <Button asChild size="lg">
          <Link href={BOOKING_URL}>Book an appointment</Link>
        </Button>
      </PageHeader>

      <PageSection>
        <SectionHeading title="Three ways to see us" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {ways.map((way) => (
            <li key={way.title}>
              <LinkCard
                href={way.href}
                title={way.title}
                media={<Image src={way.image} alt={way.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />}
              >
                {way.text}
              </LinkCard>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="card">
        <SectionHeading title="Service areas">
          Choose an area to see its treatments, prices, and open times.
        </SectionHeading>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <li key={area.value}>
              <Link
                href={`/book?category=${area.value}`}
                className="flex min-h-14 items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 font-body font-bold text-foreground transition-colors hover:border-primary-strong/40 hover:text-primary-strong"
              >
                {area.label}
                <span aria-hidden="true" className="text-primary-strong">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 font-body text-sm text-muted-foreground">
          Not sure what you need?{" "}
          <Link href="/book/consultation-in-person" className="font-bold text-primary-strong underline-offset-4 hover:underline">
            Book a consultation
          </Link>
          .
        </p>
      </PageSection>

      <CtaBand title="Book an appointment" secondary={{ label: "Ask a question", href: "/contact" }}>
        Book online, or call us and we&apos;ll help you choose.
      </CtaBand>
    </>
  )
}
