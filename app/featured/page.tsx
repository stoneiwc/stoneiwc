import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { ArrowRight, Newspaper, Tv, Trophy, Mic, Radio } from "lucide-react"
import { getFeaturedPageImages } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

const DESCRIPTION =
  "Stone International Wellness Center in the press, media, podcasts, awards, and thought leadership platforms."

export const metadata: Metadata = {
  title: "Featured On",
  description: DESCRIPTION,
  alternates: { canonical: "/featured" },
  openGraph: { title: "Featured On | Stone IWC", description: DESCRIPTION, url: "/featured", type: "website" },
  twitter: { card: "summary_large_image", title: "Featured On | Stone IWC", description: DESCRIPTION },
}

export const revalidate = 60

const subPages = [
  {
    icon: Newspaper,
    title: "Press",
    description:
      "Stone IWC in the news — print and digital coverage highlighting our mission, practitioners, and community impact.",
    href: "/featured/press",
  },
  {
    icon: Tv,
    title: "Media",
    description:
      "Video appearances, interviews, and feature segments showcasing our holistic approach and the work we do.",
    href: "/featured/media",
  },
  {
    icon: Trophy,
    title: "Awards",
    description:
      "Recognition and accolades received for our commitment to holistic wellness, community service, and excellence in care.",
    href: "/featured/awards",
  },
  {
    icon: Mic,
    title: "Stone IWC Podcast",
    description:
      "Conversations on holistic health, Eastern and Western medicine, nutrition, and root-cause healing — available on Spotify.",
    href: "/featured/podcast",
  },
  {
    icon: Radio,
    title: "The QC Show",
    description:
      "Our broadcast program bringing holistic wellness education to a wider audience through engaging conversations and expert insight.",
    href: "/featured/qc-show",
  },
]

export default async function FeaturedPage() {
  const images = await getFeaturedPageImages()

  const heroImageUrl = images?.heroImage?.asset
    ? urlFor(images.heroImage).width(900).height(675).url()
    : "/images/our-story.jpg"
  const heroImageAlt = images?.heroImage?.alt ?? "Stone International Wellness Center featured on press and media"

  return (
    <>
      <PageHeader
        title="Featured On"
        subtitle="Our presence across press, media, awards, and thought leadership platforms."
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
                Our Reach
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Recognized Across Press, Media & Beyond
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Stone International Wellness Center has been recognized by
                press outlets, media programs, and award bodies for our
                commitment to holistic health and community wellness. Our
                practitioners share knowledge through podcasts, broadcast
                shows, and public appearances.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                From a Presidential award to local media features, our story
                is one of dedication -- bringing holistic healing to those
                who need it most, wherever they are.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Explore
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Our Coverage & Recognition
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
