import Link from "next/link"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHomePageImages } from "@/lib/sanity.queries"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section"
import { FeatureSplit } from "@/components/home/feature-split"

export function AboutFeature({ image }: { image?: SanityHomePageImages["aboutImage"] }) {
  return (
    <FeatureSplit
      tone="card"
      image={{
        src: image?.asset ? urlFor(image).width(1200).height(900).url() : "/images/about-wellness.jpg",
        alt: image?.alt ?? "A Stone IWC practitioner with a client",
      }}
    >
      <SectionHeading eyebrow="About us" title="50 years of hands-on practice" />
      <p className="text-lead">
        We combine Eastern methods, like fire cupping, with a Western understanding of the body,
        and use each where it works best.
      </p>
      <p className="text-lead">
        All proceeds support The Source of Hope, our nonprofit foundation, which provides food,
        education, and wellness programs for families across Dallas–Fort Worth.
      </p>
      <Button asChild variant="outline">
        <Link href="/about/our-story">Our story</Link>
      </Button>
    </FeatureSplit>
  )
}
