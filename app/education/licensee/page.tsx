import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import { getLicenseeProgramImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import {
  ArrowRight,
  Building2,
  Users,
  Globe,
  Shield,
  FileCheck,
  Award,
  CheckCircle2,
  Briefcase,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Licensee Programs",
  description:
    "Become a licensed Stone IWC operator. Our licensee program allows qualified practitioners to operate under the Stone IWC brand and model in their market.",
}

const licenseeFeatures = [
  {
    icon: Building2,
    title: "Operate Under the Stone IWC Brand",
    description:
      "As a licensee, you gain the right to operate a Stone IWC concierge wellness practice in your approved market. You carry the credibility and reputation of a presidential award-winning practice built over five decades.",
  },
  {
    icon: Globe,
    title: "Exclusive Territory",
    description:
      "Each licensee receives an exclusive territory or market area. We protect your investment by ensuring no overlapping Stone IWC operations in your designated region.",
  },
  {
    icon: Users,
    title: "Full Training & Onboarding",
    description:
      "Before you launch, we provide comprehensive training on every aspect of Stone IWC operations -- from treatment protocols and patient assessment to business operations, booking systems, and the concierge delivery model.",
  },
  {
    icon: Shield,
    title: "Proven Concierge Model",
    description:
      "You receive our proven, tested concierge model -- the same system that has served corporate offices, churches, homes, hotels, hospitals, and events for over a decade. We teach you exactly how to replicate it.",
  },
  {
    icon: FileCheck,
    title: "Operational Playbook",
    description:
      "Every licensee receives a complete operational playbook covering patient forms, treatment protocols, pricing structures, supplier relationships, equipment lists, marketing templates, and ongoing compliance standards.",
  },
  {
    icon: Award,
    title: "Ongoing Support & Brand Standards",
    description:
      "We provide ongoing mentorship, quality assurance reviews, continuing education access, and brand standard enforcement. Your success is our success -- and every service you deliver funds The Source of Hope foundation.",
  },
]

const licenseeSteps = [
  {
    step: "01",
    title: "Initial Inquiry",
    description:
      "Contact us to express interest. We will schedule a discovery call to discuss your background, market, and vision for a Stone IWC practice in your area.",
  },
  {
    step: "02",
    title: "Qualification Review",
    description:
      "We review your qualifications, experience, and market potential. Ideal candidates have a background in holistic health, wellness, or healthcare -- though passion and commitment are equally valued.",
  },
  {
    step: "03",
    title: "Training & Certification",
    description:
      "Approved candidates complete our comprehensive training program covering all Stone IWC modalities, business operations, the concierge delivery model, and brand standards.",
  },
  {
    step: "04",
    title: "Launch & Operate",
    description:
      "With your training complete and territory approved, you launch your Stone IWC practice with full support, marketing materials, and ongoing mentorship from our team.",
  },
]

const idealCandidates = [
  "Holistic health practitioners seeking a proven brand and model",
  "Healthcare professionals looking to expand into holistic care",
  "Entrepreneurs passionate about health and wellness",
  "Existing wellness business owners wanting to add concierge services",
  "Former Stone IWC certification graduates ready for the next step",
  "Community leaders wanting to bring holistic wellness to their market",
]

export const revalidate = 60

export default async function LicenseePage() {
  const images = await getLicenseeProgramImages()
  const mainImageSrc = images?.mainImage?.asset
    ? urlFor(images.mainImage).width(900).height(675).url()
    : "/images/licensee-program.jpg"
  const mainImageAlt = images?.mainImage?.alt ?? "Stone IWC licensee program certification ceremony"
  return (
    <>
      <PageHeader
        title="Licensee Programs"
        subtitle="Operate a Stone IWC concierge wellness practice in your market. Carry our brand, our model, and five decades of expertise."
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
                Expand the Mission
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Build a Practice Under the Stone IWC Name
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Our licensee program is for qualified professionals who want
                to operate a Stone IWC concierge wellness practice in their
                own market. You gain access to our proven business model,
                treatment protocols, brand reputation, and five decades of
                holistic expertise -- all while contributing to The Source
                of Hope foundation with every service delivered.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                This is not a franchise. It is a licensee partnership --
                you operate independently within your territory while
                maintaining Stone IWC brand standards and quality of care.
                We provide training, support, and ongoing mentorship to
                ensure your success.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <p className="text-sm font-body font-bold text-foreground">
                  Limited territories available
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
              What You Receive
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              The Licensee Advantage
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {licenseeFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col rounded-sm border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {feature.description}
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
                The Process
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                How to Become a Licensee
              </h2>
              <div className="mt-10 flex flex-col gap-6">
                {licenseeSteps.map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-5 rounded-sm border border-border bg-card p-6"
                  >
                    <span className="shrink-0 font-sans text-3xl font-semibold text-primary/25">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-body">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Ideal Candidates
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Who Should Apply
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
                We are looking for professionals and entrepreneurs who are
                passionate about holistic health and wellness, committed to
                excellence, and ready to build a meaningful practice in
                their community.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {idealCandidates.map((candidate) => (
                  <div key={candidate} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
                    <span className="text-sm font-body text-foreground leading-relaxed">
                      {candidate}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-sm border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm font-body leading-relaxed text-foreground">
                  <span className="font-bold">Note:</span> Every service
                  delivered by a Stone IWC licensee generates proceeds
                  that fund The Source of Hope foundation -- extending
                  holistic health access to underserved communities. As a
                  licensee, you are not just building a business. You are
                  expanding a mission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Interested in Becoming a Licensee?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Contact our team to learn about available territories, program
            details, and the application process.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={BOOKING_URL}
              className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Contact Us About Licensing
            </Link>
            <Link
              href="/education/certifications"
              className="inline-flex items-center gap-2 rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
            >
              <span>View Certifications</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
