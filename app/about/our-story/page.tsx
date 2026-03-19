import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import { Award, Heart, Globe, Utensils, GraduationCap, Clock } from "lucide-react"
import { getOurStoryImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Five decades of holistic healing, a Presidential award, and a mission that launched before the pandemic to serve our community.",
}

const milestones = [
  {
    icon: Clock,
    title: "Five Decades of Experience",
    description:
      "Our journey in holistic wellness spans over 50 years. Long before the term 'holistic health' became mainstream, our practitioners were already combining ancient Eastern modalities with Western understanding to help people heal from within.",
  },
  {
    icon: Globe,
    title: "Eastern & Western Medicine United",
    description:
      "We believe Western medicine excels in acute care, diagnostics, and emergency intervention -- and we honor that. Eastern medicine excels in preventive care, root-cause healing, and restoring the body's internal balance. The most beautiful thing is when both work together, and that is the foundation of everything we do.",
  },
  {
    icon: Award,
    title: "Awarded by the President",
    description:
      "Stone International Wellness Center has been recognized at the highest level with a Presidential award for our dedication to holistic health and community service. This recognition fuels our commitment to making wellness accessible to everyone.",
  },
  {
    icon: Heart,
    title: "Launched to Serve Our Community",
    description:
      "Stone IWC was launched before the pandemic with a singular mission: to bring holistic care directly to our community. When the world shut down, the need for root-cause healing and immune support only confirmed what we already knew -- our community needed this.",
  },
  {
    icon: Utensils,
    title: "Food is Medicine",
    description:
      "With 17+ trained chefs on our team, we do not just treat conditions -- we teach people how to heal through nutrition. We write custom meal programs, guide grocery trips, clean out pantries, and teach families the art of healing through food. Vegetables, fruits, organics, legumes, detox smoothies, and healing entrees are all part of our approach.",
  },
  {
    icon: GraduationCap,
    title: "Advanced Education Center",
    description:
      "Our advanced holistic education center teaches both practitioners and patients. We offer comprehensive programs in Eastern and Western modalities, empowering people with the knowledge to take ownership of their health and continue their wellness journey independently.",
  },
]

export default async function OurStoryPage() {
  const storyImages = await getOurStoryImages()
  const mainImageSrc = storyImages?.mainImage
    ? urlFor(storyImages.mainImage).width(900).height(675).url()
    : "/images/our-story.jpg"
  const mainImageAlt = storyImages?.mainImage?.alt ?? "Stone IWC holistic practitioners"
  return (
    <>
      <PageHeader
        title="Our Story"
        subtitle="Five decades of holistic healing, a Presidential award, and a mission to serve our community from the inside out."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Our Beginning
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                More Than a Business -- A Calling
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone International Wellness Center was not born from a
                business plan. It was born from over five decades of watching
                people suffer with chronic conditions -- diabetes, high blood
                pressure, inflammation, lymphedema, kidney issues -- and
                knowing there was a better way to help them.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                We are not doctors. We are not a spa. We are holistic
                practitioners who have dedicated our lives to understanding
                the body from the inside out. We treat the root cause of
                health issues using modalities refined over generations --
                from traditional fire cupping and lymphatic drainage to
                nutritional detox programs and culinary wellness.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                All profits from Stone IWC sustain our foundation,{" "}
                <strong className="text-foreground">The Source of Hope</strong>,
                extending holistic health access to underserved communities.
                When you choose our services, you are not just investing in
                your health -- you are helping someone else access theirs.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={mainImageSrc}
                alt={mainImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-8">
                <p className="font-sans text-2xl font-semibold text-background">
                  50+ Years
                </p>
                <p className="mt-1 text-sm font-body text-background/80">
                  of holistic healing experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Our Journey
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              The Pillars of Our Story
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.title}
                className="flex flex-col rounded-sm border border-border bg-background p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <milestone.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                  {milestone.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-10 text-center lg:p-16">
            <h2 className="font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              The Source of Hope
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              Every service, every treatment, every meal program, every
              education session you book through Stone IWC directly sustains
              The Source of Hope foundation. Our mission is to ensure that
              holistic health is not a luxury -- it is a right. Your healing
              helps us extend that right to communities who need it most.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                Schedule a Consultation
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-3 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
