import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { LinkCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/ui/cta-band"
import { FeatureSplit } from "@/components/ui/feature-split"
import {
  getCertificationImages,
  getEducationPageImages,
  getLicenseeProgramImages,
} from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { CONTACT_INFO } from "@/lib/navigation"

export const metadata: Metadata = pageMetadata({
  title: "Training and education",
  description:
    "Certification courses in cupping, lymphatic drainage, bodywork, skin care and culinary wellness; classes for families and workplaces; a licensing program; and free guides from Stone IWC.",
  path: "/training",
})

export const revalidate = 60

const INQUIRY_URL = "/contact"

// The four parts of the page, also used as the jump links in the header.
const TRACKS = [
  {
    id: "certifications",
    eyebrow: "For practitioners",
    title: "Certification courses",
    text: "Six hands-on courses in the treatments we use every day, each ending in a practical assessment.",
    cta: "See the courses",
  },
  {
    id: "classes",
    eyebrow: "For clients, families and workplaces",
    title: "Classes and workshops",
    text: "Health workshops, family nutrition and cooking classes, and wellness education days for staff.",
    cta: "See classes",
  },
  {
    id: "licensing",
    eyebrow: "For practice owners",
    title: "Licensing",
    text: "Run a Stone IWC concierge practice in your own area, with our training and support.",
    cta: "About licensing",
  },
  {
    id: "guides",
    eyebrow: "For anyone",
    title: "Free guides",
    text: "Our cupping guide, health concerns, common questions, and our podcast and radio show.",
    cta: "Read the guides",
  },
]

const COURSES = [
  {
    title: "Fire cupping",
    text: "Our signature treatment. Covers all six cupping methods we use: fire, wet (hijama), dry, moving, flash and facial.",
    modules: [
      "History and theory of cupping",
      "Fire safety and glass cup handling",
      "Wet cupping (hijama) technique",
      "Dry, moving, flash and facial cupping",
      "Client assessment and when not to cup",
      "Aftercare and follow-up",
    ],
  },
  {
    title: "Lymphatic drainage",
    text: "Manual and instrument-assisted lymphatic drainage, including care after surgery and for swelling.",
    modules: [
      "Anatomy of the lymphatic system",
      "Manual drainage techniques",
      "Instrument-assisted methods",
      "Drainage after surgery and other treatments",
      "Assessing swelling and lymphedema",
      "Care plans and record keeping",
    ],
  },
  {
    title: "Non-invasive cosmetic procedures",
    text: "Non-surgical removal of common skin imperfections, and pigmentation and acne care.",
    modules: [
      "Identifying cherry angiomas, skin tags and warts",
      "Removal techniques",
      "Pigmentation care",
      "Acne care",
      "Safety, consent and records",
    ],
  },
  {
    title: "Holistic bodywork",
    text: "Hands-on techniques from deep tissue and myofascial work to gua sha, moxibustion and hot stone.",
    modules: [
      "Deep tissue and myofascial release",
      "Reflexology and acupressure",
      "Gua sha and moxibustion",
      "Craniosacral technique basics",
      "Hot stone and herbal compress",
      "Planning a course of treatment",
    ],
  },
  {
    title: "Ear, eye and TMJ care",
    text: "Ear cleansing and candling, tear duct cleansing, and bodywork for jaw (TMJ) tension.",
    modules: [
      "Ear cleansing",
      "Ear candling technique and safety",
      "Tear duct cleansing",
      "TMJ assessment",
      "Jaw tension release and alignment bodywork",
    ],
  },
  {
    title: "Culinary wellness and nutrition",
    text: "Plan meals and lead cooking, pantry and grocery sessions using our three-day meal rotation.",
    modules: [
      "Nutrition basics",
      "The three-day meal rotation",
      "Whole-food, organic and legume cooking",
      "Pantry cleanouts and grocery trips",
      "Smoothies, desserts and variety days",
      "Meal planning for groups and workplaces",
    ],
  },
]

const EVERY_COURSE = [
  "Hands-on training with our practitioners",
  "Eastern and Western methods, and when to use each",
  "Small groups",
  "A practical assessment and a Stone IWC certificate",
  "Mentorship and continuing education afterwards",
  "Graduates can apply to join our practitioner network",
]

const CLASSES = [
  {
    title: "Health workshops",
    text: "Plain-language sessions on holistic health: the basics of Eastern methods, how they fit with Western care, and what you can do at home between visits.",
  },
  {
    title: "Family nutrition and cooking",
    text: "Meal planning with our three-day rotation, cooking with vegetables, legumes and whole foods, and pantry cleanouts and grocery trips with a practitioner.",
  },
  {
    title: "Workplace wellness days",
    text: "Education days for your staff at your office, church or event. Can be paired with concierge treatments on the same day.",
  },
  {
    title: "Continuing education",
    text: "Refreshers and new techniques for practitioners who already hold a Stone IWC certificate.",
  },
]

const LICENSEE_GETS = [
  {
    title: "The Stone IWC name",
    text: "Run your practice under our brand and standards in an approved area.",
  },
  {
    title: "Your territory",
    text: "A defined market area for your practice. [Confirm territory terms.]",
  },
  {
    title: "Training before launch",
    text: "Our treatments, client assessment, booking, business operations and the concierge model.",
  },
  {
    title: "The concierge model",
    text: "How we serve offices, churches, homes, hotels, hospitals and events, step by step.",
  },
  {
    title: "Operations manual",
    text: "Client forms, treatment protocols, pricing, suppliers, equipment lists and marketing templates.",
  },
  {
    title: "Ongoing support",
    text: "Mentorship, quality reviews and continuing education after you open.",
  },
]

const LICENSEE_FOR = [
  "Holistic practitioners who want an established brand and model",
  "Healthcare professionals adding holistic care",
  "Wellness business owners adding concierge services",
  "Stone IWC certificate holders ready for their own practice",
  "Community leaders bringing holistic care to their area",
]

const LICENSEE_STEPS = [
  {
    title: "Get in touch",
    text: "Tell us about your background and the area you'd serve. We'll set up a call.",
  },
  {
    title: "Review",
    text: "We talk through your experience and your market. A background in health or wellness helps, but isn't required.",
  },
  {
    title: "Training",
    text: "You complete our training in the treatments, operations and concierge model.",
  },
  {
    title: "Launch",
    text: "You open your practice with our materials and ongoing mentorship.",
  },
]

const GUIDES = [
  {
    title: "Cupping guide",
    text: "The six types of cupping we use, what a session involves, and aftercare.",
    href: "/education/cupping",
    cta: "Read the guide",
  },
  {
    title: "Health concerns",
    text: "Common concerns our clients bring us, and the services for each.",
    href: "/education/concerns",
    cta: "See concerns",
  },
  {
    title: "Questions and policies",
    text: "How booking, payment and cancellation work, and answers to common questions.",
    href: "/faq",
    cta: "Read the answers",
  },
  {
    title: "Podcast and radio",
    text: "The StoneIWC Podcast and The QC Show: conversations on health, wellness and community.",
    href: "/media#podcast",
    cta: "Listen",
  },
]

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 font-body text-sm text-foreground">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default async function TrainingPage() {
  const [educationImages, certImages, licenseeImages] = await Promise.all([
    getEducationPageImages(),
    getCertificationImages(),
    getLicenseeProgramImages(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Training and education"
        title="Learn with Stone IWC"
        subtitle="Courses for practitioners, classes for families and workplaces, licensing for your own practice, and free guides for anyone."
      >
        <Button asChild size="lg">
          <Link href={INQUIRY_URL}>Ask about training</Link>
        </Button>
      </PageHeader>

      <PageSection spacing="compact">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((track) => (
            <li key={track.id}>
              <LinkCard href={`#${track.id}`} eyebrow={track.eyebrow} title={track.title} cta={track.cta}>
                {track.text}
              </LinkCard>
            </li>
          ))}
        </ul>
      </PageSection>

      <FeatureSplit
        tone="card"
        image={{
          src: educationImages?.heroImage?.asset
            ? urlFor(educationImages.heroImage).width(1200).height(900).url()
            : "/images/education-center.jpg",
          alt: educationImages?.heroImage?.alt ?? "The Stone IWC education center",
        }}
      >
        <SectionHeading eyebrow="Our education center" title="Taught by the people who treat" />
        <p className="text-lead">
          Teaching has always been part of our work. The practitioners who see clients at our clinic
          and on concierge visits are the ones who teach our courses and classes.
        </p>
        <p className="font-body leading-relaxed text-muted-foreground">
          We teach Eastern methods, like fire cupping, alongside a Western understanding of the
          body, and when each is the right tool. [Where classes are held: the Plano clinic, on
          site, or both.]
        </p>
      </FeatureSplit>

      <PageSection id="certifications" width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading eyebrow="For practitioners" title="Certification courses">
              Hands-on courses in the treatments we use every day, for people who want to practise
              holistic care professionally.
            </SectionHeading>
            <p className="font-body text-sm text-muted-foreground">
              [Course length, schedule, tuition and prerequisites.] Evening and weekend sessions on
              request.
            </p>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-h3">Every course includes</h3>
              <div className="mt-4">
                <CheckList items={EVERY_COURSE} />
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              src={
                certImages?.mainImage?.asset
                  ? urlFor(certImages.mainImage).width(1200).height(900).url()
                  : "/images/certifications.jpg"
              }
              alt={certImages?.mainImage?.alt ?? "A certification class at Stone IWC"}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <li key={course.title} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6">
              <h3 className="text-h3">{course.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{course.text}</p>
              <div className="mt-2 border-t border-border pt-4">
                <p className="mb-3 font-body text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  What you&apos;ll learn
                </p>
                <CheckList items={course.modules} />
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="classes" tone="card">
        <SectionHeading eyebrow="For clients, families and workplaces" title="Classes and workshops">
          Not training to practise? We also teach clients, families and organizations what they can
          do for their own health.
        </SectionHeading>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <li key={c.title} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-6">
              <h3 className="text-h3">{c.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 font-body text-sm text-muted-foreground">
          [Class schedule and prices.] To book a class or a workshop for your group, call{" "}
          {CONTACT_INFO.phoneGeneral} or{" "}
          <Link href={INQUIRY_URL} className="font-bold text-primary-strong underline-offset-4 hover:underline">
            contact us
          </Link>
          .
        </p>
      </PageSection>

      <div id="licensing" className="scroll-mt-24">
        <FeatureSplit
          image={{
            src: licenseeImages?.mainImage?.asset
              ? urlFor(licenseeImages.mainImage).width(1200).height(900).url()
              : "/images/licensee-program.jpg",
            alt: licenseeImages?.mainImage?.alt ?? "Stone IWC licensees at a certification ceremony",
          }}
        >
          <SectionHeading eyebrow="For practice owners" title="Run a Stone IWC practice" />
          <p className="text-lead">
            Our licensing program is for practitioners who want to run a Stone IWC concierge
            practice in their own area. Every service a licensee provides also supports The Source
            of Hope.
          </p>
          {/* LEGAL REVIEW: the "not a franchise" wording is kept as the owner wrote it.
              Have it checked before changing or relying on it. */}
          <p className="font-body leading-relaxed text-muted-foreground">
            This is not a franchise. It is a licensee partnership: you operate independently within
            your territory while maintaining Stone IWC brand standards and quality of care.
          </p>
        </FeatureSplit>
      </div>

      <PageSection spacing="compact" className="pt-0 md:pt-0">
        <h3 className="text-h3">What licensees get</h3>
        <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {LICENSEE_GETS.map((item) => (
            <li key={item.title} className="border-t border-border pt-4">
              <p className="font-body font-bold text-foreground">{item.title}</p>
              <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-h3">Who it&apos;s for</h3>
            <div className="mt-4">
              <CheckList items={LICENSEE_FOR} />
            </div>
          </div>
          <div>
            <h3 className="text-h3">How to become a licensee</h3>
            <ol className="mt-6 grid gap-6 sm:grid-cols-2">
              {LICENSEE_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-sans text-3xl font-semibold leading-none text-primary-strong" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-body font-bold text-foreground">{step.title}</p>
                    <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </PageSection>

      <PageSection id="guides" tone="card">
        <SectionHeading eyebrow="For anyone" title="Free guides">
          Read up before your first visit, or between visits.
        </SectionHeading>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => (
            <li key={guide.href}>
              <LinkCard href={guide.href} title={guide.title} cta={guide.cta}>
                {guide.text}
              </LinkCard>
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaBand title="Ask about training" primary={{ label: "Contact us", href: INQUIRY_URL }}>
        Tell us which course, class or program you&apos;re interested in, and we&apos;ll send dates
        and details.
      </CtaBand>
    </>
  )
}
