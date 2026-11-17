import type { Metadata } from "next"
import { Hero } from "@/components/home/hero"
import { Offerings } from "@/components/home/offerings"
import { AboutFeature } from "@/components/home/about-feature"
import { ConciergeFeature } from "@/components/home/concierge-feature"
import { ShopFeature } from "@/components/home/shop-feature"
import { Review } from "@/components/home/review"
import { CtaBand } from "@/components/ui/cta-band"
import {
  getFeaturedProducts,
  getHeroSlides,
  getHomePageImages,
  getProductBySlug,
} from "@/lib/sanity.queries"
import { GIFT_CARD_SLUG } from "@/lib/constants"

// Title and description come from the root layout; only the URL is the
// homepage's own. openGraph is repeated whole because Next replaces it
// rather than merging it with the root's.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Stone International Wellness Center",
    title: "Stone International Wellness Center",
    url: "/",
    locale: "en_US",
  },
}

export const revalidate = 60

export default async function HomePage() {
  const [heroSlides, homePageImages, giftCard, featuredProducts] = await Promise.all([
    getHeroSlides(),
    getHomePageImages(),
    getProductBySlug(GIFT_CARD_SLUG),
    getFeaturedProducts(),
  ])

  return (
    <>
      <Hero slides={heroSlides} />
      <Offerings />
      <AboutFeature image={homePageImages?.aboutImage} />
      <ConciergeFeature image={homePageImages?.servicesConciergeImage} />
      <ShopFeature giftCard={giftCard} featuredProducts={featuredProducts} />
      <Review />
      <CtaBand
        title="Book an appointment"
        secondary={{ label: "Our policies", href: "/our-policies" }}
      >
        Appointments only, paid when you book. Cancel at least 24 hours ahead for a refund.
      </CtaBand>
    </>
  )
}
