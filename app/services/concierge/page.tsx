import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import {
  Building2,
  Church,
  PartyPopper,
  Home,
  Hotel,
  Hospital,
  HeartPulse,
  GlassWater,
  Check,
} from "lucide-react"
import { getConciergeImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "Concierge Services",
  description:
    "We come to you -- corporate offices, churches, events, homes, hotels, hospitals, and more. 100+ holistic services delivered to your location.",
}

const locations = [
  {
    icon: Building2,
    title: "Corporate Offices",
    description:
      "Employee wellness programs, executive health days, team nutrition workshops, and on-site holistic treatments. We set up a full treatment station at your office.",
  },
  {
    icon: Church,
    title: "Churches & Ministries",
    description:
      "Congregation wellness days, health ministry events, community healing sessions, and nutritional education programs for church groups.",
  },
  {
    icon: PartyPopper,
    title: "Events & Gatherings",
    description:
      "Girls' night out, bridal parties, wellness retreats, birthday celebrations, and private group experiences tailored to your occasion.",
  },
  {
    icon: Home,
    title: "Private Homes",
    description:
      "In-home treatments, pantry cleanouts, family cooking lessons, grocery guidance, and personalized care for individuals and families.",
  },
  {
    icon: Hotel,
    title: "Hotels & Resorts",
    description:
      "In-suite treatments for travelers, conference wellness services, retreat programs, and guest holistic care packages.",
  },
  {
    icon: Hospital,
    title: "Hospitals",
    description:
      "Complementary bedside holistic support for patients seeking additional wellness modalities alongside their existing care plan.",
  },
  {
    icon: HeartPulse,
    title: "Hospice",
    description:
      "Compassionate holistic treatments providing comfort, relief, and dignity to hospice patients and their families during difficult times.",
  },
  {
    icon: GlassWater,
    title: "Anywhere You Need Us",
    description:
      "No location is too unique. If you need holistic care, nutritional guidance, or culinary wellness, we will find a way to bring it to you.",
  },
]

const conciergeIncludes = [
  "Full portable treatment setup at your location",
  "Experienced holistic practitioners on-site",
  "Trained chefs for culinary wellness programs",
  "Custom service packages for groups and events",
  "Nutritional consultations and pantry assessments",
  "Follow-up care and program continuity",
  "Flexible scheduling including evenings and weekends",
  "All equipment, supplies, and products provided",
]

export const revalidate = 60

export default async function ConciergePage() {
  const images = await getConciergeImages()
  const mainImageSrc = images?.mainImage?.asset
    ? urlFor(images.mainImage).width(900).height(675).url()
    : "/images/concierge-service.jpg"
  const mainImageAlt = images?.mainImage?.alt ?? "Concierge wellness service setup"
  return (
    <>
      <PageHeader
        title="Concierge Services"
        subtitle="We bring over 100 holistic services directly to your location -- wherever you are, whatever the occasion."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                How It Works
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                We Come to You
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone IWC was built on a concierge model from day one. We do
                not wait for you to find us -- we bring our full practice
                directly to your location with the same professional
                standards and comprehensive care as our facility. Our
                practitioners arrive with everything needed for a complete
                treatment experience.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Whether it is a single treatment for one person or a full
                wellness day for your entire organization, our concierge team
                handles everything from setup to cleanup. You just show up
                and receive care.
              </p>
              <div className="mt-8">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Book a Concierge Visit
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={mainImageSrc}
                alt={mainImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Locations We Serve
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Where Can We Come?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">
              From boardrooms to living rooms, from churches to hotel suites
              -- our practitioners and chefs bring holistic care to any
              setting.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {locations.map((loc) => (
              <div
                key={loc.title}
                className="flex flex-col rounded-sm border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <loc.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                  {loc.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {loc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                What is Included
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Every Concierge Visit Includes
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
                Our concierge service is designed to be completely turnkey.
                We handle every detail so you can focus entirely on your
                health and wellness.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {conciergeIncludes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-sm border border-border bg-card p-4"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-body text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Every Service Benefits The Source of Hope
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            When you book a concierge visit, all profits go directly to
            sustaining The Source of Hope foundation -- extending holistic
            health access to underserved communities.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Schedule a Concierge Visit
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
