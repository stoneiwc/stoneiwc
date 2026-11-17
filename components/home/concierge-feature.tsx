import Link from "next/link"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHomePageImages } from "@/lib/sanity.queries"
import { CONTACT_INFO } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section"
import { FeatureSplit } from "@/components/home/feature-split"

export function ConciergeFeature({ image }: { image?: SanityHomePageImages["servicesConciergeImage"] }) {
  return (
    <FeatureSplit
      imageRight
      image={{
        src: image?.asset ? urlFor(image).width(1200).height(900).url() : "/images/concierge.jpg",
        alt: image?.alt ?? "A concierge treatment at a client's home",
      }}
    >
      <SectionHeading eyebrow="Concierge" title="We come to you" />
      <p className="text-lead">
        Many of our services are available wherever you are: your home, office, hotel, church,
        or event. Our practitioners bring everything they need and set up on site.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button asChild variant="outline">
          <Link href="/services/concierge">How concierge visits work</Link>
        </Button>
        <a
          href={`tel:${CONTACT_INFO.phoneConcierge.replace(/[^+\d]/g, "")}`}
          className="font-body text-sm font-bold text-primary-strong underline-offset-4 hover:underline"
        >
          Call {CONTACT_INFO.phoneConcierge}
        </a>
      </div>
    </FeatureSplit>
  )
}
