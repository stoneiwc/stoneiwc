import { Hero } from "@/components/home/hero"
import { Philosophy } from "@/components/home/philosophy"
import { AboutSection } from "@/components/home/about-section"
import { ServicesPreview } from "@/components/home/services-preview"
import { WhereWeServe } from "@/components/home/where-we-serve"
import { CulinaryWellness } from "@/components/home/culinary-wellness"
import { ProductsSection } from "@/components/home/products-section"
import { Testimonials } from "@/components/home/testimonials"
import { PoliciesSection } from "@/components/home/policies-section"
import { CTASection } from "@/components/home/cta-section"
import { getHeroSlides, getHomePageImages } from "@/lib/sanity.queries"

// Revalidate this page every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  const [heroSlides, homePageImages] = await Promise.all([
    getHeroSlides(),
    getHomePageImages(),
  ])

  return (
    <>
      <Hero slides={heroSlides} />
      <Philosophy />
      <AboutSection image={homePageImages?.aboutImage} />
      <ServicesPreview />
      <WhereWeServe />
      <CulinaryWellness image={homePageImages?.culinaryImage} />
      <ProductsSection />
      <Testimonials />
      <PoliciesSection />
      <CTASection />
    </>
  )
}
