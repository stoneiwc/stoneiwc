import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Gift } from "lucide-react"
import { getFeaturedProducts, getProductBySlug } from "@/lib/sanity.queries"
import { ProductCard } from "@/components/products/product-card"
import { GIFT_CARD_SLUG } from "@/lib/constants"

export async function ProductsSection() {
  const [giftCard, featuredProducts] = await Promise.all([
    getProductBySlug(GIFT_CARD_SLUG),
    getFeaturedProducts(),
  ])

  const featuredWithoutGiftCard = featuredProducts.filter(
    (p) => p.slug !== GIFT_CARD_SLUG
  )

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">

        {/* Gift Card Promo */}
        {giftCard && (
          <div className="grid grid-cols-1 items-center gap-12 overflow-hidden rounded-sm border border-border bg-card lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={giftCard.image}
                alt={giftCard.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="px-8 py-12 lg:px-12 lg:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-6 font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Give the Gift of Wellness
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                {giftCard.name}
              </h2>
              <p className="mt-4 font-sans text-2xl font-semibold text-foreground">
                From $25
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body">
                {giftCard.shortDescription}
              </p>
              <Link
                href={`/products/${GIFT_CARD_SLUG}`}
                className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Buy Gift Certificate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Featured Products Grid */}
        {featuredWithoutGiftCard.length > 0 && (
          <div className={giftCard ? "mt-24" : ""}>
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-sans text-2xl font-semibold tracking-wide text-foreground md:text-3xl">
                Featured Products
              </h3>
              <Link
                href="/products"
                className="text-sm font-body font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-2 uppercase tracking-wider"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredWithoutGiftCard.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
