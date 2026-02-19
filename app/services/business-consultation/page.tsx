import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { CONTACT_INFO } from "@/lib/navigation"
import {
  Building2,
  TrendingUp,
  MapPin,
  Package,
  Users,
  Megaphone,
  Check,
  Mail,
  Phone,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Business Consultation Services",
  description:
    "Turnkey business setup for salons, spas, nail salons, medical spas, and holistic practitioner facilities. From location finding to full system buildout and marketing.",
}

const services = [
  {
    icon: Building2,
    title: "Turnkey Facility Setup",
    description:
      "We build your wellness business from scratch -- location scouting, lease negotiation, interior design, equipment procurement, and full facility buildout.",
  },
  {
    icon: MapPin,
    title: "Location Finding & Lease Negotiation",
    description:
      "Expert guidance in finding the perfect location for your wellness facility, including market analysis, lease negotiation, and site evaluation.",
  },
  {
    icon: Package,
    title: "Complete Systems & Operations",
    description:
      "Booking systems, inventory management, staff protocols, treatment menus, pricing structures, and operational playbooks -- everything you need to open your doors.",
  },
  {
    icon: Users,
    title: "Staff Training & Certification",
    description:
      "Train your team in holistic wellness modalities, customer service excellence, and operational best practices. We can also provide certified practitioners.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Brand Development",
    description:
      "Full marketing services including brand identity, website development, social media strategy, local SEO, and patient acquisition campaigns.",
  },
  {
    icon: TrendingUp,
    title: "Growth & Expansion Consulting",
    description:
      "Already operating? We provide strategic consulting to scale your wellness business, optimize operations, and increase profitability.",
  },
]

const idealFor = [
  "Salon owners looking to add holistic services",
  "Spa operators wanting to expand service offerings",
  "Medical spa practices seeking holistic integration",
  "Nail salon owners interested in wellness expansion",
  "Aspiring holistic practitioners opening their first facility",
  "Existing wellness centers looking to scale operations",
  "Real estate investors building wellness properties",
  "Healthcare professionals transitioning to holistic practice",
]

export default function BusinessConsultationPage() {
  return (
    <>
      <PageHeader
        title="Business Consultation Services"
        subtitle="Turnkey solutions for salons, spas, medical spas, and holistic wellness facilities. We build your business from the ground up."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Turnkey Business Solutions
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                We Build Wellness Businesses
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                With over 50 years of experience in holistic wellness and
                business operations, Stone IWC provides comprehensive
                consultation services for wellness facility owners and
                aspiring entrepreneurs.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Whether you are opening a salon, spa, medical spa, nail
                salon, or holistic practitioner facility from scratch -- or
                looking to expand an existing operation -- we provide
                end-to-end support from location finding to grand opening
                and beyond.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                We do not just consult. We build complete, turnkey wellness
                businesses ready to serve patients on day one.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/business-consultation.jpg"
                alt="Business consultation for wellness facilities"
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
              What We Provide
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Comprehensive Business Services
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex flex-col rounded-sm border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground font-body">
                  {service.description}
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
                Who We Work With
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Ideal For
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
                Our business consultation services are designed for wellness
                entrepreneurs, facility owners, and investors looking to
                enter or expand in the holistic health space.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {idealFor.map((item) => (
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

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-sm border border-border bg-card p-12 text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Get Started
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Schedule a Business Consultation
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">
              Contact us to discuss your wellness business vision. We will
              schedule a consultation to understand your goals, budget, and
              timeline, then provide a comprehensive proposal for your
              turnkey facility.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`mailto:${CONTACT_INFO.email}?subject=Business Consultation Inquiry`}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-10 py-3.5 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Built on 50+ Years of Experience
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Stone IWC has been operating holistic wellness facilities for
            over five decades. We know what works -- and what does not. Let
            us help you build a thriving wellness business.
          </p>
        </div>
      </section>
    </>
  )
}
