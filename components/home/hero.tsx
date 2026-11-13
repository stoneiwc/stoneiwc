import Link from "next/link"
import { BOOKING_URL } from "@/lib/navigation"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHeroSlide } from "@/lib/sanity.queries"
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel"

const SLOGAN = "Your Modern Holistic Path to Health & Wellness"

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero-wellness.jpg",
    subtitle: "Concierge Holistic Wellness Retreat",
    title: "Restoring the Body from the Inside Out",
    description:
      "Personalized lymphatic care, non-surgical body contouring, restorative hand and foot care, holistic nourishment guidance, and refined semi-permanent aesthetics -- in Plano, with many of our services available at your location.",
  },
  {
    image: "/images/hero-cupping.jpg",
    subtitle: "Eastern & Western Medicine United",
    title: "Holistic Precision. 50 Years Deep.",
    description:
      "We honor both Eastern and Western medicine -- each for its intended purpose. Over 100 services refined across 50 years of hands-on experience, treating chronic conditions at the root.",
  },
]

interface HeroProps {
  slides?: SanityHeroSlide[]
}

// Server component: builds the slides (Sanity image URLs included) and the
// buttons here, so the browser only gets the small rotating part
// (hero-carousel.tsx) and no image-URL builder.
export function Hero({ slides: sanitySlides }: HeroProps) {
  const fromSanity = (sanitySlides ?? [])
    .filter((s) => s.image?.asset)
    .map((s) => ({
      image: urlFor(s.image).width(1920).height(1080).url(),
      subtitle: s.subtitle,
      title: s.title,
      description: s.description,
    }))
  const slides = fromSanity.length ? fromSanity : DEFAULT_SLIDES

  return (
    <HeroCarousel
      slides={slides}
      slogan={SLOGAN}
      actions={
        <>
          <Link
            href={BOOKING_URL}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Schedule a Consultation
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
          >
            Our Approach
          </Link>
        </>
      }
    />
  )
}
