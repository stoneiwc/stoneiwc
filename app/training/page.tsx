import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/ui/cta-band"
import { FeatureSplit } from "@/components/ui/feature-split"
import { getCertificationImages, getLicenseeProgramImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = pageMetadata({
  title: "Training",
  description:
    "Hands-on certification courses in cupping, lymphatic drainage, bodywork and more, taught by Stone IWC practitioners, and a licensing program for running a Stone IWC concierge practice.",
  path: "/training",
})

export const revalidate = 60

const INQUIRY_URL = "/contact"

const COURSES = [
  {
    title: "Fire cupping",
    text: "All six cupping methods we use: fire, wet (hijama), dry, moving, flash and facial.",
    modules: [
      "History and theory of cupping",
      "Fire safety and glass cup handling",
      "Client assessment and when not to cup",
      "Aftercare and follow-up",
    ],
  },
  {
    title: "Lymphatic drainage",
    text: "Manual and instrument-assisted lymphatic drainage, including after surgery.",
    modules: [
      "Anatomy of the lymphatic system",
      "Manual drainage techniques",
      "Instrument-assisted methods",
      "Care plans and record keeping",
    ],
  },
  {
    title: "Non-invasive cosmetic procedures",
    text: "Non-surgical removal of skin tags, cherry angiomas and warts, and pigmentation care.",
    modules: [
      "Identifying common skin imperfections",
      "Removal techniques",
      "Pigmentation care",
      "Safety, consent and records",
    ],
  },
  {
    title: "Holistic bodywork",
    text: "Hands-on techniques from deep tissue work to gua sha and moxibustion.",
    modules: [
      "Deep tissue and myofascial release",
      "Reflexology and acupressure",
      "Gua sha and moxibustion",
      "Hot stone and herbal compress",
    ],
  },
  {
    title: "Ear, eye and TMJ care",
    text: "Ear cleansing and candling, tear duct cleansing, and jaw (TMJ) bodywork.",
    modules: [
      "Ear cleansing and candling",
      "Tear duct cleansing",
      "TMJ assessment",
      "Jaw tension release",
    ],
  },
  {
    title: "Culinary wellness and nutrition",
    text: "Plan meals and lead cooking, pantry and grocery sessions using our three-day meal rotation.",
    modules: [
      "Nutrition basics",
      "The three-day meal rotation",
      "Whole-food and legume cooking",
      "Pantry cleanouts and grocery trips",
    ],
  },
]

const LICENSEE_GETS = [
  "Training in our treatments, booking and concierge model",
  "An operations manual: forms, treatment protocols, pricing, suppliers and marketing templates",
  "A defined territory [confirm terms]",
  "Ongoing mentorship and quality reviews",
]

const LICENSEE_STEPS = [
  { title: "Get in touch", text: "Tell us about your background and the area you'd serve." },
  { title: "Review", text: "We talk through your experience and your market." },
  { title: "Training", text: "You complete our training and certification." },
  { title: "Launch", text: "You open your practice, with our support." },
]

export default async function TrainingPage() {
  const [certImages, licenseeImages] = await Promise.all([
    getCertificationImages(),
    getLicenseeProgramImages(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Training"
        title="Training for practitioners"
        subtitle="Certification courses taught by our practitioners, and a licensing program for running a Stone IWC concierge practice."
      >
        <Button asChild size="lg">
          <Link href={INQUIRY_URL}>Ask about training</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#licensing">Licensing</a>
        </Button>
      </PageHeader>

      <div id="certifications" className="scroll-mt-24">
        <FeatureSplit
          image={{
            src: certImages?.mainImage?.asset
              ? urlFor(certImages.mainImage).width(1200).height(900).url()
              : "/images/certifications.jpg",
            alt: certImages?.mainImage?.alt ?? "A certification class at Stone IWC",
          }}
        >
          <SectionHeading eyebrow="Certifications" title="Certification courses" />
          <p className="text-lead">
            Hands-on courses in the treatments we use every day, taught in small groups by our
            practitioners. Each course ends with a practical assessment.
          </p>
          <p className="font-body text-muted-foreground">
            [Course length, schedule, tuition and prerequisites.] Evening and weekend sessions on
            request.
          </p>
        </FeatureSplit>
      </div>

      <PageSection tone="card">
        <SectionHeading title="Courses" />
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <li key={course.title} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 md:p-8">
              <h3 className="text-h3">{course.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{course.text}</p>
              <ul className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {course.modules.map((mod) => (
                  <li key={mod} className="flex items-start gap-2 font-body text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                    {mod}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </PageSection>

      <div id="licensing" className="scroll-mt-24">
        <FeatureSplit
          imageRight
          image={{
            src: licenseeImages?.mainImage?.asset
              ? urlFor(licenseeImages.mainImage).width(1200).height(900).url()
              : "/images/licensee-program.jpg",
            alt: licenseeImages?.mainImage?.alt ?? "Stone IWC licensees at a certification ceremony",
          }}
        >
          <SectionHeading eyebrow="Licensing" title="Run a Stone IWC practice" />
          <p className="text-lead">
            Our licensing program is for practitioners who want to run a Stone IWC concierge
            practice in their own area.
          </p>
          {/* LEGAL REVIEW: the "not a franchise" wording is kept as the owner wrote it.
              Have it checked before changing or relying on it. */}
          <p className="font-body leading-relaxed text-muted-foreground">
            This is not a franchise. It is a licensee partnership: you operate independently within
            your territory while maintaining Stone IWC brand standards and quality of care.
          </p>
          <ul className="flex flex-col gap-2 font-body text-foreground">
            {LICENSEE_GETS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </FeatureSplit>
      </div>

      <PageSection tone="card">
        <SectionHeading title="How to become a licensee" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LICENSEE_STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2">
              <span className="font-sans text-3xl font-semibold text-primary-strong" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="text-h3">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <CtaBand title="Ask about training" primary={{ label: "Contact us", href: INQUIRY_URL }}>
        Tell us which course or program you&apos;re interested in, and we&apos;ll send dates and
        details.
      </CtaBand>
    </>
  )
}
