import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import { ArrowRight, Stethoscope, MapPin } from "lucide-react"
import { getServicesPageImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

const DESCRIPTION =
  "Over 100 holistic wellness services -- professional treatments in Plano, plus select services brought to your location."

export const metadata: Metadata = {
  title: "Services",
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: { title: "Services | Stone IWC", description: DESCRIPTION, url: "/services", type: "website" },
  twitter: { card: "summary_large_image", title: "Services | Stone IWC", description: DESCRIPTION },
}

export const revalidate = 60

const highlights = [
  { value: "100+", label: "Holistic Services" },
  { value: "50", label: "Years Experience" },
  
  { value: "8+", label: "Location Types Served" },
]

export default async function ServicesPage() {
  const images = await getServicesPageImages()

  const serviceCategories = [
    {
      icon: Stethoscope,
      title: "Professional Treatments",
      description:
        "Over 100 holistic treatments addressing chronic conditions at the root -- from traditional fire cupping and lymphatic drainage to skin imperfection removal, chronic acne care, and weight loss programs.",
      href: "/services/treatments",
      image: images?.treatmentsImage?.asset
        ? urlFor(images.treatmentsImage).width(900).height(675).url()
        : "/images/treatment-room.jpg",
      imageAlt: images?.treatmentsImage?.alt ?? "Professional Treatments",
    },
    {
      icon: MapPin,
      title: "Concierge Services",
      description:
        "Select services can be brought to you -- corporate offices, churches, events, private homes, hotels, hospitals, and hospice.",
      href: "/services/concierge",
      image: images?.conciergeImage?.asset
        ? urlFor(images.conciergeImage).width(900).height(675).url()
        : "/images/concierge-service.jpg",
      imageAlt: images?.conciergeImage?.alt ?? "Concierge Services",
    },
  ]

  return (
    <>
      <PageHeader
        title="Our Services"
        subtitle="Over 100 holistic services addressing chronic conditions at the root -- in Plano, with select services available at your location."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.label} className="text-center">
                <p className="font-sans text-3xl font-semibold text-primary md:text-4xl">
                  {h.value}
                </p>
                <p className="mt-2 text-sm font-body text-muted-foreground">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-20">
            {serviceCategories.map((cat, i) => (
              <div
                key={cat.title}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mt-6 font-sans text-2xl font-semibold text-foreground md:text-3xl">
                    {cat.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                    {cat.description}
                  </p>
                  <Link
                    href={cat.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-body font-bold text-primary transition-colors hover:text-primary/80"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-sm ${
                    i % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Ready to Begin?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Schedule a consultation and let us create a personalized
            treatment plan for your needs.
          </p>
          <Link
            href={BOOKING_URL}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </>
  )
}
