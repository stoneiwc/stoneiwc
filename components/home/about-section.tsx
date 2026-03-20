import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Award, Users } from "lucide-react"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHomePageImages } from "@/lib/sanity.queries"

interface AboutSectionProps {
  image?: SanityHomePageImages["aboutImage"]
}

export function AboutSection({ image }: AboutSectionProps) {
  const imageSrc = image?.asset
    ? urlFor(image).width(800).height(1000).url()
    : "/images/about-wellness.jpg"
  const imageAlt = image?.alt ?? "Stone IWC holistic practitioners"
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden h-48 w-48 border-2 border-primary/20 rounded-sm lg:block" />
            <div className="absolute -top-6 -left-6 hidden h-32 w-32 bg-primary/5 rounded-sm lg:block" />
          </div>

          <div>
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Who We Are
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
              Devoted to Restoring the Body from the Inside Out
            </h2>
            <div className="mt-8 flex flex-col gap-5">
              <p className="text-base leading-relaxed text-muted-foreground font-body">
                Stone International Wellness Center is a concierge holistic
                wellness retreat specializing in personalized lymphatic care,
                non-surgical body contouring, restorative hand and foot care,
                holistic nourishment guidance, and refined semi-permanent
                aesthetics.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground font-body">
                We operate as a concierge service, traveling to patients'
                homes, hospice, hospitals, or wherever care is needed. When
                an in-person location is required, we see patients at
                The Source of Hope facility. We honor both Eastern and
                Western medicine -- each for its intended purpose.
              </p>
            </div>

            <div className="mt-8 flex items-start gap-4 rounded-sm border border-primary/20 bg-primary/5 p-5">
              <Users className="h-8 w-8 shrink-0 text-primary mt-0.5" />
              <div>
                <h3 className="font-sans text-base font-semibold text-foreground">
                  Full-Circle Practitioners
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground font-body">
                  Many of our practitioners were once recipients of
                  The Source of Hope foundation. Today, they serve you as
                  trained, experienced holistic professionals -- bringing
                  their personal healing journey into every service they
                  deliver.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-4 rounded-sm border border-accent/30 bg-accent/5 p-5">
              <Award className="h-8 w-8 shrink-0 text-accent mt-0.5" />
              <div>
                <h3 className="font-sans text-base font-semibold text-foreground">
                  Presidential Award-Winning Practice
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground font-body">
                  Recognized by the President and launched before the
                  pandemic. When you book Stone IWC, the proceeds from your
                  services directly fund The Source of Hope -- extending
                  holistic health access to underserved communities.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link
                href="/about/our-story"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about/team"
                className="inline-flex items-center gap-2 text-sm font-body font-bold tracking-wider text-primary transition-colors hover:text-primary/80"
              >
                Meet the Practitioners
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
