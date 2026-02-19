import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { CONTACT_INFO } from "@/lib/navigation"
import { Mic2, Radio, Users, Heart, Mail, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Speaking Engagements & QC Show",
  description:
    "Invite QC to speak about holistic health and wellness, The Source of Hope foundation, or to be a guest on your podcast or show.",
}

const topics = [
  {
    icon: Heart,
    title: "Holistic Health & Wellness",
    description:
      "50+ years of experience in Eastern and Western medicine, chronic condition management, lymphatic care, body contouring, and restorative wellness practices.",
  },
  {
    icon: Users,
    title: "The Source of Hope Foundation",
    description:
      "Our presidential award-winning foundation providing holistic health access to underserved communities. Learn about the full-circle model where recipients become practitioners.",
  },
  {
    icon: Radio,
    title: "The QC Show",
    description:
      "QC is available as a guest for your podcast, radio show, or media feature. Authentic conversations about holistic wellness, entrepreneurship, and giving back.",
  },
  {
    icon: Mic2,
    title: "Custom Topic Requests",
    description:
      "From entrepreneurship in wellness to integrating Eastern and Western medicine, from culinary wellness to building turnkey holistic businesses -- we cover it all.",
  },
]

export default function SpeakingPage() {
  return (
    <>
      <PageHeader
        title="Speaking Engagements & QC Show"
        subtitle="Invite QC to speak to your audience about holistic health, The Source of Hope, or to be a guest on your podcast or show."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                About QC
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                A Voice for Holistic Wellness
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                QC is the founder of Stone International Wellness Center and
                The Source of Hope foundation -- a presidential award-winning
                holistic wellness practice with over five decades of combined
                experience in Eastern and Western medicine.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                With a passion for treating chronic conditions at the root,
                QC has helped thousands of patients through personalized
                lymphatic care, non-surgical body contouring, restorative
                hand and foot care, holistic nourishment guidance, and
                refined semi-permanent aesthetics.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                QC is available for speaking engagements, podcasts, media
                appearances, and The QC Show -- bringing real-world holistic
                wellness knowledge to any platform.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/speaking-events.jpg"
                alt="QC speaking at a wellness event"
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
              Speaking Topics
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              What QC Can Speak About
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="flex flex-col rounded-sm border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <topic.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-xl font-semibold text-foreground">
                  {topic.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground font-body">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-sm border border-border bg-card p-12 text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Book QC
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Invite QC to Your Event, Show, or Podcast
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">
              Contact us with details about your event, audience, desired
              topic, and date. We will respond within 48 hours to confirm
              availability and discuss logistics.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`mailto:${CONTACT_INFO.email}?subject=Speaking Inquiry for QC`}
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
            Every Engagement Supports The Source of Hope
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Proceeds from speaking engagements and media appearances go
            directly to sustaining The Source of Hope foundation --
            extending holistic health access to underserved communities.
          </p>
          <Link
            href="/about/our-story"
            className="mt-8 inline-flex items-center justify-center rounded-sm border border-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Learn About Our Story
          </Link>
        </div>
      </section>
    </>
  )
}
