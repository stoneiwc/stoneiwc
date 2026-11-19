import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { LinkCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/ui/cta-band"
import { FeatureSplit } from "@/components/ui/feature-split"
import { BOOKING_URL } from "@/lib/navigation"
import { BOOKING_CATEGORIES } from "@/lib/cal-api"
import { getServicesPageImages, getVirtualConsultationsImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

const DESCRIPTION =
  "Holistic treatments at our Plano clinic, at your home or office, or by video: cupping, massage, body contouring, skin care, and more."

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: DESCRIPTION,
  path: "/services",
})

export const revalidate = 60

const VIDEO_BOOKING_URL = "/book/consultation-virtual-free"

// Booking categories that aren't a kind of treatment.
const NOT_A_SERVICE_AREA = new Set(["consultation", "concierge"])

const VIDEO_TOPICS = [
  "A first consultation to plan your treatments",
  "Nutrition and meal planning",
  "Lymphatic care you can do at home",
  "Body contouring program planning",
  "Follow-ups between visits",
]

export default async function ServicesPage() {
  const [images, videoImages] = await Promise.all([
    getServicesPageImages(),
    getVirtualConsultationsImages(),
  ])

  const ways = [
    {
      title: "At our clinic",
      text: "Treatment rooms at 1108 W Parker Rd, Plano.",
      href: "#areas",
      cta: "See service areas",
      image: images?.treatmentsImage?.asset
        ? urlFor(images.treatmentsImage).width(900).height(675).url()
        : "/images/treatment-room.jpg",
      alt: images?.treatmentsImage?.alt ?? "A treatment room at the Plano clinic",
    },
    {
      title: "Where you are",
      text: "Concierge visits to homes, offices, hotels, churches, and events.",
      href: "/services/concierge",
      cta: "About concierge visits",
      image: images?.conciergeImage?.asset
        ? urlFor(images.conciergeImage).width(900).height(675).url()
        : "/images/concierge-service.jpg",
      alt: images?.conciergeImage?.alt ?? "A concierge treatment on location",
    },
    {
      title: "By video",
      text: "Video consultations when you can't come in.",
      href: "#video",
      cta: "About video consultations",
      image: videoImages?.mainImage?.asset
        ? urlFor(videoImages.mainImage).width(900).height(675).url()
        : "/images/virtual-consultation.jpg",
      alt: videoImages?.mainImage?.alt ?? "A video consultation on a laptop",
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
                cta={way.cta}
                media={<Image src={way.image} alt={way.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />}
              >
                {way.text}
              </LinkCard>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="card" id="areas">
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
          Not sure what you need? See{" "}
          <Link href="/education/concerns" className="font-bold text-primary-strong underline-offset-4 hover:underline">
            health concerns
          </Link>{" "}
          or{" "}
          <Link href="/book/consultation-in-person" className="font-bold text-primary-strong underline-offset-4 hover:underline">
            book a consultation
          </Link>
          .
        </p>
      </PageSection>

      <div id="video" className="scroll-mt-24">
        <FeatureSplit
          image={{
            src: ways[2].image,
            alt: ways[2].alt,
          }}
        >
          <SectionHeading eyebrow="By video" title="Video consultations" />
          <p className="text-lead">
            Talk with one of our practitioners by video. Hands-on treatments need a clinic or
            concierge visit, but a video call can cover:
          </p>
          <ul className="flex flex-col gap-2 font-body text-foreground">
            {VIDEO_TOPICS.map((topic) => (
              <li key={topic} className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                {topic}
              </li>
            ))}
          </ul>
          <p className="font-body text-sm text-muted-foreground">
            Book a time online and we&apos;ll email you the video link.
          </p>
          <Button asChild>
            <Link href={VIDEO_BOOKING_URL}>Book a video consultation</Link>
          </Button>
        </FeatureSplit>
      </div>

      <CtaBand title="Book an appointment" secondary={{ label: "Questions and policies", href: "/faq" }}>
        Book online, or call us and we&apos;ll help you choose.
      </CtaBand>
    </>
  )
}
