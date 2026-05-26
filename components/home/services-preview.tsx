import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHomePageImages } from "@/lib/sanity.queries"

interface ServicesPreviewProps {
  conciergeImage?: SanityHomePageImages["servicesConciergeImage"]
  treatmentRoomImage?: SanityHomePageImages["servicesTreatmentRoomImage"]
}

export function ServicesPreview({ conciergeImage, treatmentRoomImage }: ServicesPreviewProps = {}) {
  const services = [
    {
      title: "Concierge Holistic Treatments",
      description:
        "Personalized lymphatic care, non-surgical body contouring, restorative hand and foot care, refined semi-permanent aesthetics, and 100+ more services -- delivered directly to your location.",
      image: conciergeImage?.asset
        ? urlFor(conciergeImage).width(1600).height(1200).url()
        : "/images/concierge.jpg",
      alt: conciergeImage?.alt ?? "Concierge holistic treatments delivered at your home or office",
      href: "/services/concierge",
    },
    {
      title: "In-Facility at The Source of Hope",
      description:
        "When an in-person location is required, we see patients at The Source of Hope facility in Plano, TX -- home to our advanced holistic education center and full treatment rooms.",
      image: treatmentRoomImage?.asset
        ? urlFor(treatmentRoomImage).width(1600).height(1200).url()
        : "/images/treatment-room.jpg",
      alt: treatmentRoomImage?.alt ?? "The Source of Hope treatment room in Plano, TX",
      href: "/services/treatments",
    },
  ]

  return (
    <section className="bg-foreground py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Over 100 Services
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl lg:text-5xl">
              Holistic Treatments That Go Deeper
            </h2>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-2 font-body text-sm font-bold tracking-wider text-primary transition-colors hover:text-primary/80"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group relative overflow-hidden rounded-sm"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.alt}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-sans text-2xl font-semibold text-background">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-background/70 font-body">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center gap-2 font-body text-sm font-bold tracking-wider text-primary transition-transform group-hover:translate-x-1">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 border-t border-background/10 pt-12">
          <p className="text-center font-body text-sm uppercase tracking-[0.2em] text-background/40 mb-8">
            Some of our services include
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {[
              "Lymphatic Drainage",
              "Lymphedema Care",
              "Non-Surgical Body Contouring",
              "Restorative Hand Care",
              "Restorative Foot Care",
              "Ingrown Treatment",
              "Traditional Fire Cupping",
              "Cherry Angioma Removal",
              "Pigmentation Correction",
              "Semi-Permanent Aesthetics",
              "Wart Removal",
              "Pre-Skin Cancer Removal",
              "Tear Duct Cleansing",
              "Ear Detox & Cleansing",
              "TMJ Treatment",
              "Chronic Acne Treatment",
              "Nutritional Detox Programs",
              "Private Cooking Classes",
              "Pantry Cleanouts",
              "Chef-Prepared Healing Meals",
              "And 80+ More",
            ].map((service) => (
              <span
                key={service}
                className="rounded-full border border-primary/20 px-4 py-1.5 text-xs font-body text-background/70 transition-all hover:border-primary hover:text-primary hover:bg-primary/10"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
