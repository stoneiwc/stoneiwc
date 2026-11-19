import Link from "next/link"
import { BOOKING_URL } from "@/lib/navigation"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHeroSlide } from "@/lib/sanity.queries"
import { Button } from "@/components/ui/button"
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel"

const EYEBROW = "Holistic wellness · Plano, Texas"

// Shown only if Sanity has no hero slides.
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero-cupping.jpg",
    subtitle: "",
    title: "Hands-on holistic care, 50 years in practice",
    description:
      "Cupping, lymphatic care, body contouring, and skin treatments at our Plano clinic, with many services available at your home or office.",
  },
  {
    image: "/images/hero-wellness.jpg",
    subtitle: "",
    title: "We come to you",
    description:
      "Book a concierge visit and our practitioners bring the treatment to your home, office, hotel, or event.",
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
      slogan={EYEBROW}
      actions={
        <>
          <Button asChild size="lg">
            <Link href={BOOKING_URL}>Book an appointment</Link>
          </Button>
          <Button asChild size="lg" variant="inverse">
            <Link href="/services">View services</Link>
          </Button>
        </>
      }
    />
  )
}
