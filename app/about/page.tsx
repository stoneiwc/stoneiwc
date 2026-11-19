import type { Metadata } from "next"
import Link from "next/link"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { LinkCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/ui/cta-band"
import { FeatureSplit } from "@/components/ui/feature-split"
import { getAboutPageImages, getOurStoryImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

const DESCRIPTION =
  "Stone International Wellness Center: holistic practitioners in Plano, Texas, with 50 years of hands-on practice. All proceeds support The Source of Hope."

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description: DESCRIPTION,
  path: "/about",
})

export const revalidate = 60

const SOURCE_OF_HOPE_URL = "https://thesourceofhope.org"

const PRINCIPLES = [
  {
    title: "Eastern and Western, each where it works",
    text: "Western medicine for diagnosis and acute care. Eastern methods, like fire cupping, for prevention and everyday wellbeing. We respect both.",
  },
  {
    title: "Food is part of care",
    text: "We write meal plans, lead grocery trips and pantry cleanouts, and teach families to cook with vegetables, legumes and whole foods.",
  },
  {
    title: "We teach what we do",
    text: "Our practitioners train new practitioners, and teach clients what they can do at home between visits.",
  },
]

const MORE = [
  { title: "Our team", text: "The practitioners you'll see.", href: "/about/team", cta: "Meet the team" },
  { title: "Partners", text: "The organizations we work with.", href: "/about/partners", cta: "See partners" },
  { title: "Media", text: "Press, videos, our podcast and The QC Show.", href: "/media", cta: "See media" },
]

export default async function AboutPage() {
  const [aboutImages, storyImages] = await Promise.all([getAboutPageImages(), getOurStoryImages()])

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="50 years of hands-on practice"
        subtitle="Holistic practitioners in Plano, Texas. All proceeds support The Source of Hope, our nonprofit foundation."
      />

      <FeatureSplit
        image={{
          src: aboutImages?.heroImage?.asset
            ? urlFor(aboutImages.heroImage).width(1200).height(900).url()
            : "/images/our-story.jpg",
          alt: aboutImages?.heroImage?.alt ?? "Stone International Wellness Center practitioners",
        }}
      >
        <SectionHeading eyebrow="Our story" title="Not doctors, not a spa" />
        <p className="text-lead">
          We&apos;re holistic practitioners with 50 years of experience. Fire cupping is our
          signature treatment, alongside lymphatic drainage, bodywork, skin care and nutrition.
        </p>
        <p className="font-body leading-relaxed text-muted-foreground">
          Stone IWC was founded by Quynh Chau Stone [in YEAR] to bring that care to our community,
          in our Plano clinic and wherever our clients are. In [YEAR], we received [AWARD NAME] for
          our health and community work.
        </p>
      </FeatureSplit>

      <PageSection tone="card">
        <SectionHeading title="How we work" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 md:p-8">
              <h3 className="text-h3">{p.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      <FeatureSplit
        imageRight
        image={{
          src: storyImages?.mainImage?.asset
            ? urlFor(storyImages.mainImage).width(1200).height(900).url()
            : "/images/about-wellness.jpg",
          alt: storyImages?.mainImage?.alt ?? "A Stone IWC practitioner with a client",
        }}
      >
        <SectionHeading eyebrow="Our foundation" title="The Source of Hope" />
        <p className="text-lead">
          All proceeds from Stone IWC support The Source of Hope, our nonprofit foundation, which
          provides food, education and wellness programs for families across Dallas–Fort Worth.
        </p>
        <Button asChild variant="outline">
          <a href={SOURCE_OF_HOPE_URL} target="_blank" rel="noopener noreferrer">
            Visit The Source of Hope
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Button>
      </FeatureSplit>

      <PageSection tone="card">
        <SectionHeading title="More about us" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {MORE.map((item) => (
            <li key={item.href}>
              <LinkCard href={item.href} title={item.title} cta={item.cta}>
                {item.text}
              </LinkCard>
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaBand title="Book an appointment" secondary={{ label: "Contact us", href: "/contact" }}>
        See us at our Plano clinic, at your location, or by video.
      </CtaBand>
    </>
  )
}
