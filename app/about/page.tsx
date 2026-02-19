import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { ArrowRight, BookOpen, Users, Handshake } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Stone International Wellness Center -- holistic practitioners with over five decades of experience, honoring both Eastern and Western medicine.",
}

const subPages = [
  {
    icon: BookOpen,
    title: "Our Story",
    description:
      "How five decades of holistic experience, a Presidential award, and a mission to serve our community became Stone IWC.",
    href: "/about/our-story",
  },
  {
    icon: Users,
    title: "Team Members",
    description:
      "Meet the experienced holistic practitioners, trained chefs, and wellness educators who make Stone IWC possible.",
    href: "/about/team",
  },
  {
    icon: Handshake,
    title: "Partners & Affiliates",
    description:
      "The organizations, practitioners, and community partners we collaborate with to extend holistic wellness access.",
    href: "/about/partners",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Holistic practitioners with over five decades of experience, honoring both Eastern and Western medicine for their intended purposes."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/our-story.jpg"
                alt="Stone International Wellness Center practitioners"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Who We Are
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Not Doctors. Not a Spa. Holistic Practitioners.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone International Wellness Center is built on over five
                decades of holistic healing experience. We are not doctors
                and we are not a spa -- we are experienced holistic
                practitioners who address chronic health conditions at the
                root using time-tested modalities from both Eastern and
                Western traditions.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                We believe Western medicine excels in acute care and
                diagnostics. Eastern medicine excels in preventive care and
                root-cause healing. The most beautiful thing is when both
                work together -- and that is what we practice.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Awarded by the President and launched before the pandemic to
                serve our community, all profits from Stone IWC sustain our
                foundation, The Source of Hope, extending holistic health
                access to those who need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Learn More
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Explore Our Story
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {subPages.map((page) => (
              <Link
                key={page.title}
                href={page.href}
                className="group flex flex-col rounded-sm border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <page.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-xl font-semibold text-foreground">
                  {page.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {page.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-body font-bold text-primary">
                  <span>Learn More</span>
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
