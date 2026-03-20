import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"
import {
  Video,
  Calendar,
  ShieldCheck,
  Clock,
  Globe,
  MessageSquare,
  Check,
} from "lucide-react"
import { getVirtualConsultationsImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "Virtual Holistic Consultations",
  description:
    "Online wellness consultations with our experienced holistic practitioners. Personalized guidance for lymphatic care, body contouring, nutrition, and more.",
}

const benefits = [
  {
    icon: Globe,
    title: "Access From Anywhere",
    description:
      "Connect with our practitioners no matter where you are -- perfect for remote patients, busy professionals, and international clients.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Book sessions that fit your schedule, including evenings and weekends. No travel time means more convenience.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "HIPAA-compliant video platform ensuring your health information and conversations remain completely confidential.",
  },
  {
    icon: MessageSquare,
    title: "Personalized Guidance",
    description:
      "Receive customized recommendations, treatment plans, and follow-up support from our experienced holistic practitioners.",
  },
]

const servicesOffered = [
  "Initial wellness consultations and assessments",
  "Lymphatic care guidance and at-home protocols",
  "Nutritional coaching and meal planning",
  "Body contouring program design and support",
  "Chronic condition management consultations",
  "Follow-up sessions and progress tracking",
  "Treatment plan reviews and adjustments",
  "Holistic wellness education and Q&A",
]

export const revalidate = 60

export default async function VirtualConsultationsPage() {
  const images = await getVirtualConsultationsImages()
  const mainImageSrc = images?.mainImage?.asset
    ? urlFor(images.mainImage).width(900).height(675).url()
    : "/images/virtual-consultation.jpg"
  const mainImageAlt = images?.mainImage?.alt ?? "Virtual holistic wellness consultation"
  return (
    <>
      <PageHeader
        title="Virtual Holistic Consultations"
        subtitle="Connect with our experienced practitioners online for personalized wellness guidance from anywhere in the world."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={mainImageSrc}
                alt={mainImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Online Wellness Consultations
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Expert Holistic Guidance, Virtually
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone IWC now offers virtual holistic consultations for
                patients who prefer online wellness guidance or cannot visit
                us in person. Connect with our experienced practitioners via
                secure video for personalized holistic health consultations.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Whether you need nutritional coaching, lymphatic care
                guidance, body contouring program design, or chronic
                condition management support -- our virtual consultations
                provide the same expert care you would receive in person.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <Video className="h-4 w-4" />
                  Book Virtual Consultation
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
              Why Choose Virtual
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Benefits of Online Consultations
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col rounded-sm border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-body">
                  {benefit.description}
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
                What We Offer
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Virtual Consultation Services
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
                Our virtual consultations provide personalized holistic
                wellness guidance across a wide range of services. While
                hands-on treatments require in-person visits, many aspects of
                holistic wellness can be effectively addressed online.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {servicesOffered.map((service) => (
                <div
                  key={service}
                  className="flex items-start gap-3 rounded-sm border border-border bg-card p-4"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-body text-foreground">
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-sm border border-border bg-card p-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 font-sans text-2xl font-semibold tracking-wide text-foreground md:text-3xl text-balance">
              How to Schedule
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground font-body">
              Book your virtual consultation through our online booking
              system. After booking, you will receive a secure video link and
              preparation instructions via email. Sessions typically last
              30-60 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Video className="h-4 w-4" />
                Book Now
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}?subject=Virtual Consultation Inquiry`}
                className="inline-flex items-center justify-center rounded-sm border border-border px-10 py-3.5 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Prefer In-Person Care?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            We also offer concierge services (we come to you) and
            in-facility care at The Source of Hope in Plano, TX. Choose the
            option that works best for your needs.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-sm border border-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            View All Services
          </a>
        </div>
      </section>
    </>
  )
}
