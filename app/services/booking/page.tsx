import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"
import {
  Calendar,
  Stethoscope,
  Utensils,
  Droplets,
  Sparkles,
  Hand,
  Heart,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Book Our Services",
  description:
    "Book our team for any of our 100+ professional holistic wellness services. From lymphatic care to body contouring, from nutritional guidance to culinary wellness.",
}

const serviceCategories = [
  {
    icon: Droplets,
    title: "Lymphatic Care & Drainage",
    services: [
      "Personalized Lymphatic Drainage",
      "Lymphedema Care",
      "Post-Surgical Lymphatic Support",
      "Detox Lymphatic Protocols",
    ],
  },
  {
    icon: Sparkles,
    title: "Non-Surgical Body Contouring",
    services: [
      "Non-Invasive Body Sculpting",
      "Cellulite Reduction",
      "Skin Tightening",
      "Weight Loss Programs",
    ],
  },
  {
    icon: Hand,
    title: "Restorative Hand & Foot Care",
    services: [
      "Ingrown Treatment",
      "Callus & Corn Removal",
      "Nail Restoration",
      "Hand & Foot Reflexology",
    ],
  },
  {
    icon: Heart,
    title: "Semi-Permanent Aesthetics",
    services: [
      "Cherry Angioma Removal",
      "Pigmentation Correction",
      "Wart Removal",
      "Pre-Skin Cancer Removal",
      "Chronic Acne Treatment",
    ],
  },
  {
    icon: Utensils,
    title: "Holistic Nourishment Guidance",
    services: [
      "Nutritional Detox Programs",
      "Pantry Cleanouts",
      "Grocery Guidance",
      "Private Cooking Classes",
      "Chef-Prepared Healing Meals",
    ],
  },
  {
    icon: Stethoscope,
    title: "Traditional Holistic Treatments",
    services: [
      "Traditional Fire Cupping",
      "Wet Cupping (Hijama)",
      "Gua Sha Therapy",
      "TMJ Treatment",
      "Ear Detox & Cleansing",
      "Tear Duct Cleansing",
    ],
  },
]

export default function BookingPage() {
  return (
    <>
      <PageHeader
        title="Book Our Services"
        subtitle="Choose from over 100 professional holistic wellness services. We come to you -- or visit us at The Source of Hope facility in Plano, TX."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/book-services.jpg"
                alt="Booking holistic wellness services"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                How to Book
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Schedule Your Service
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Booking with Stone IWC is simple. Browse our service
                categories below, then use our online booking system to
                schedule your appointment. For questions or custom packages,
                contact us directly.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-body text-muted-foreground">
                    <strong className="text-foreground">
                      Concierge Services:
                    </strong>{" "}
                    We come to your location anywhere in the service area
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-body text-muted-foreground">
                    <strong className="text-foreground">
                      In-Facility Services:
                    </strong>{" "}
                    Visit us at The Source of Hope in Plano, TX
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Our Services
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              100+ Professional Services
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">
              Devoted to restoring the body from the inside out. Browse our
              service categories below, then book online.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((cat) => (
              <div
                key={cat.title}
                className="flex flex-col rounded-sm border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                  {cat.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {cat.services.map((service) => (
                    <li
                      key={service}
                      className="flex items-start gap-2 text-sm font-body text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/services/treatments"
              className="inline-flex items-center gap-2 text-sm font-body font-bold text-primary transition-colors hover:text-primary/80"
            >
              <span>View All 100+ Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
            Need Help Choosing?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground font-body">
            Not sure which service is right for you? Contact us for a free
            consultation. We will help you create a personalized treatment
            plan.
          </p>
          <a
            href={`mailto:${CONTACT_INFO.email}?subject=Service Consultation Request`}
            className="mt-8 inline-flex items-center justify-center rounded-sm border border-border px-10 py-3.5 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
          >
            Contact Us
          </a>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Every Service Funds The Source of Hope
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            When you book with Stone IWC, proceeds from your services go
            directly to sustaining The Source of Hope foundation --
            extending holistic health access to underserved communities.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
          >
            Book Your Service
          </a>
        </div>
      </section>
    </>
  )
}
