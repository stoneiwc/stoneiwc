import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import {
  ArrowRight,
  GraduationCap,
  Briefcase,
  BookOpen,
  AlertCircle,
  Flame,
  FileText,
  Globe,
} from "lucide-react"
import { getEducationPageImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "Education",
  description:
    "Stone IWC advanced education center -- practitioner certifications, licensee programs, and holistic health education honoring Eastern and Western traditions.",
}

export const revalidate = 60

const featuredPrograms = [
  {
    icon: GraduationCap,
    title: "Holistic Practitioner Certifications",
    description:
      "Earn your certification in fire cupping, lymphatic drainage, non-invasive cosmetic procedures, holistic bodywork, ear/eye/TMJ therapies, and culinary wellness. Hands-on training from practitioners with 50+ years of experience.",
    href: "/education/certifications",
    cta: "View Certifications",
    accent: "primary",
  },
  {
    icon: Briefcase,
    title: "Licensee Programs",
    description:
      "Operate a Stone IWC concierge wellness practice in your own market. Gain access to our proven business model, brand reputation, treatment protocols, operational playbook, and ongoing mentorship.",
    href: "/education/licensee",
    cta: "Learn About Licensing",
    accent: "accent",
  },
]

const educationLinks = [
  {
    icon: BookOpen,
    title: "General Services Information",
    description:
      "Understand how our 100+ holistic services work, what to expect during treatments, and how our concierge model operates.",
    href: "/education/general",
  },
  {
    icon: AlertCircle,
    title: "Concerns We Address",
    description:
      "Learn about the chronic conditions and health concerns our holistic modalities can help support -- from diabetes and inflammation to lymphedema and skin conditions.",
    href: "/education/concerns",
  },
  {
    icon: Flame,
    title: "Cupping Therapy",
    description:
      "A deep dive into traditional fire cupping -- our signature modality refined over five decades. Learn about the types, benefits, and what to expect.",
    href: "/education/cupping",
  },
  {
    icon: FileText,
    title: "Articles",
    description:
      "Insights, research, and perspectives from our practitioners on holistic health, nutrition, Eastern and Western medicine, and root-cause healing.",
    href: "/education/articles",
  },
]

export default async function EducationPage() {
  const images = await getEducationPageImages()

  const heroImageUrl = images?.heroImage?.asset
    ? urlFor(images.heroImage).width(900).height(675).url()
    : "/images/education-center.jpg"
  const heroImageAlt = images?.heroImage?.alt ?? "Stone IWC advanced education center"

  return (
    <>
      <PageHeader
        title="Education Center"
        subtitle="Practitioner certifications, licensee programs, and in-depth health education -- empowering you with knowledge from both Eastern and Western traditions."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={heroImageUrl}
                alt={heroImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Advanced Holistic Education
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Where Eastern & Western Wisdom Meet
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Our advanced education center is a cornerstone of Stone IWC.
                We offer two distinct tracks: practitioner certifications
                for individuals who want to learn and practice holistic
                health and non-invasive cosmetic procedures, and licensee
                programs for those who want to operate a Stone IWC practice
                in their own market.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                We teach both Eastern and Western approaches, honoring each
                for its intended purpose. All programs are led by
                practitioners with five decades of hands-on experience.
              </p>
              <div className="mt-8 flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-foreground">
                      Certifications
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      6 specialties
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/10">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-foreground">
                      Licensee Program
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      Territories available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Featured Programs
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Certifications & Licensing
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {featuredPrograms.map((program) => (
              <Link
                key={program.title}
                href={program.href}
                className="group relative flex flex-col rounded-sm border border-border bg-background p-10 transition-all hover:border-primary/40 hover:shadow-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-sm bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 transition-opacity group-hover:opacity-100" />
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-sm ${
                    program.accent === "accent"
                      ? "bg-accent/10"
                      : "bg-primary/10"
                  }`}
                >
                  <program.icon
                    className={`h-7 w-7 ${
                      program.accent === "accent"
                        ? "text-accent"
                        : "text-primary"
                    }`}
                  />
                </div>
                <h3 className="mt-6 font-sans text-2xl font-semibold text-foreground">
                  {program.title}
                </h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-muted-foreground font-body">
                  {program.description}
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-body font-bold text-primary transition-transform group-hover:translate-x-1">
                  <span>{program.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Patient & Public Education
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Health Education Resources
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {educationLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col rounded-sm border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-body font-bold text-primary">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
