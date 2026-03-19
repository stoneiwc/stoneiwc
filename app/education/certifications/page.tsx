import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import {
  ArrowRight,
  Flame,
  Droplets,
  Sparkles,
  Hand,
  Heart,
  Leaf,
  CheckCircle2,
  Clock,
  Award,
  GraduationCap,
} from "lucide-react"
import { getCertificationImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "Holistic Practitioner Certifications",
  description:
    "Earn your holistic practitioner certification at Stone IWC. Training programs in cupping, lymphatic drainage, non-invasive cosmetic procedures, bodywork, and more.",
}

const certificationPrograms = [
  {
    icon: Flame,
    title: "Fire Cupping Certification",
    description:
      "Master traditional fire cupping -- our signature modality refined over five decades. Learn glass cup techniques, fire safety, patient assessment, treatment protocols, and aftercare. Includes all 6 cupping types: fire, wet/hijama, dry, moving, flash, and facial.",
    modules: [
      "History and theory of cupping therapy",
      "Fire cupping safety and glass cup handling",
      "Wet cupping (Hijama) technique and protocols",
      "Dry, moving, flash, and facial cupping methods",
      "Patient assessment and contraindications",
      "Aftercare and follow-up protocols",
    ],
  },
  {
    icon: Droplets,
    title: "Lymphatic Drainage Certification",
    description:
      "Learn the specialized techniques of lymphatic drainage therapy -- a critical modality for patients dealing with lymphedema, post-surgical recovery, inflammation, and chronic swelling. This certification covers both manual and instrument-assisted methods.",
    modules: [
      "Lymphatic system anatomy and physiology",
      "Manual lymphatic drainage techniques",
      "Lymphedema assessment and staging",
      "Instrument-assisted lymphatic protocols",
      "Post-surgical and post-treatment drainage",
      "Patient care plans and documentation",
    ],
  },
  {
    icon: Sparkles,
    title: "Non-Invasive Cosmetic Procedures",
    description:
      "Train in non-invasive holistic cosmetic procedures including cherry angioma removal, skin tag removal, wart removal, pigmentation correction, and pre-skin cancer spot removal. All techniques are non-surgical and use holistic approaches refined over decades of practice.",
    modules: [
      "Cherry angioma identification and removal",
      "Skin tag and wart removal techniques",
      "Pigmentation correction protocols",
      "Pre-skin cancer spot assessment and removal",
      "Chronic acne holistic treatment methods",
      "Patient safety, consent, and documentation",
    ],
  },
  {
    icon: Hand,
    title: "Holistic Bodywork Certification",
    description:
      "A comprehensive certification in hands-on holistic bodywork modalities including deep tissue, reflexology, gua sha, moxibustion, acupressure, craniosacral technique, and myofascial release. Learn the art of treating the whole body from the inside out.",
    modules: [
      "Deep tissue and myofascial release techniques",
      "Reflexology and acupressure point mapping",
      "Gua sha and moxibustion theory and practice",
      "Craniosacral technique fundamentals",
      "Hot stone and herbal compress therapy",
      "Treatment planning for chronic conditions",
    ],
  },
  {
    icon: Heart,
    title: "Ear, Eye & TMJ Therapy Certification",
    description:
      "Specialized training in often-overlooked areas: ear detox and cleansing, ear candling, tear duct cleansing, and holistic TMJ treatment. These therapies can dramatically improve quality of life for patients with chronic conditions in these areas.",
    modules: [
      "Ear detox therapy and ear cleansing protocols",
      "Ear candling technique and safety",
      "Tear duct cleansing procedure",
      "TMJ holistic assessment and treatment",
      "TMJ tension release and jaw alignment bodywork",
      "Tinnitus support protocols",
    ],
  },
  {
    icon: Leaf,
    title: "Culinary Wellness & Nutrition Certification",
    description:
      "Become a certified culinary wellness practitioner. Learn to design nutritional detox programs, lead pantry cleanouts, guide grocery trips, and prepare healing meals using the Stone IWC 3-day concept. 17+ chefs have trained through this program.",
    modules: [
      "Nutritional science foundations for holistic healing",
      "The 3-day meal rotation concept",
      "Legume, organic, and whole-food cooking techniques",
      "Pantry cleanout and grocery guidance protocols",
      "Smoothie, dessert, and variety day programming",
      "Corporate and group wellness meal planning",
    ],
  },
]

const programBenefits = [
  "Hands-on training from practitioners with 50+ years of experience",
  "Both Eastern and Western modalities covered in every program",
  "Small class sizes for personalized instruction",
  "Certification recognized by Stone IWC for concierge practice eligibility",
  "Ongoing mentorship and continuing education after certification",
  "Graduates eligible to join the Stone IWC practitioner network",
]

export const revalidate = 60

export default async function CertificationsPage() {
  const images = await getCertificationImages()
  const mainImageSrc = images?.mainImage
    ? urlFor(images.mainImage).width(900).height(675).url()
    : "/images/certifications.jpg"
  const mainImageAlt = images?.mainImage?.alt ?? "Holistic practitioner certification training at Stone IWC"
  return (
    <>
      <PageHeader
        title="Holistic Practitioner Certifications"
        subtitle="Train under practitioners with 50+ years of experience. Earn your certification in holistic health, wellness, and non-invasive cosmetic procedures."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Professional Training
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Become a Certified Holistic Practitioner
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone IWC offers comprehensive certification programs for
                individuals who want to practice holistic health and
                wellness professionally. Whether you are interested in
                traditional cupping therapy, lymphatic drainage,
                non-invasive cosmetic procedures, or culinary wellness --
                our programs give you the hands-on training and knowledge
                needed to serve patients at the highest level.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                All programs are taught by experienced practitioners who
                have refined these modalities over five decades. We honor
                both Eastern and Western approaches, teaching you when and
                how to apply each for maximum patient benefit.
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-foreground">
                      6 Programs
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      Available now
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-foreground">
                      Recognized
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      Stone IWC certified
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={mainImageSrc}
                alt={mainImageAlt}
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
              Certification Programs
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Choose Your Specialty
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">
              Each program includes comprehensive hands-on training,
              theoretical instruction, patient practice, and a final
              assessment for certification.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {certificationPrograms.map((program) => (
              <div
                key={program.title}
                className="group flex flex-col rounded-sm border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <program.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                  {program.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">
                  {program.description}
                </p>
                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs font-body font-bold uppercase tracking-wider text-primary mb-3">
                    What You Will Learn
                  </p>
                  <div className="flex flex-col gap-2">
                    {program.modules.map((mod) => (
                      <div key={mod} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                        <span className="text-xs font-body text-foreground leading-relaxed">
                          {mod}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Why Stone IWC
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                What Sets Our Training Apart
              </h2>
              <div className="mt-8 flex flex-col gap-4">
                {programBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span className="text-base font-body text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-sm border border-primary/20 bg-primary/5 p-8">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-sans text-xl font-semibold text-foreground">
                  Flexible Scheduling
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">
                  All certification programs are available on flexible
                  schedules to accommodate working professionals. Evening
                  and weekend sessions available upon request.
                </p>
              </div>
              <div className="rounded-sm border border-accent/20 bg-accent/5 p-8">
                <Award className="h-8 w-8 text-accent" />
                <h3 className="mt-4 font-sans text-xl font-semibold text-foreground">
                  Practice Eligibility
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">
                  Graduates are eligible to apply to the Stone IWC
                  practitioner network, serving patients through our
                  concierge model across all locations. Many of our current
                  practitioners began as students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Start Your Certification
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Contact us to learn about enrollment, program schedules, and
            tuition for any of our certification programs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Inquire About Programs
            </a>
            <Link
              href="/education/licensee"
              className="inline-flex items-center gap-2 rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
            >
              <span>Licensee Programs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
