import { Hero } from "@/components/home/hero"
import { Philosophy } from "@/components/home/philosophy"
import { AboutSection } from "@/components/home/about-section"
import { ServicesPreview } from "@/components/home/services-preview"
import { WhereWeServe } from "@/components/home/where-we-serve"
import { ProductsSection } from "@/components/home/products-section"
import { Testimonials } from "@/components/home/testimonials"
import { PoliciesSection } from "@/components/home/policies-section"
import { CTASection } from "@/components/home/cta-section"
import type { Metadata } from "next"
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

// Revalidate this page every 60 seconds
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
      <Philosophy />
      <AboutSection image={homePageImages?.aboutImage} />
      <ServicesPreview
        conciergeImage={homePageImages?.servicesConciergeImage}
        treatmentRoomImage={homePageImages?.servicesTreatmentRoomImage}
      />
      <WhereWeServe />
      
      <ProductsSection giftCard={giftCard} featuredProducts={featuredProducts} />
      <Testimonials />
      <PoliciesSection />
      <CTASection />
    </>
  )
}
