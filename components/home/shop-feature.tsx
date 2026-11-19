import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/products"
import { GIFT_CARD_SLUG } from "@/lib/constants"
import { GIFT_CARD_MIN } from "@/lib/gift-card-math"
import { formatPrice } from "@/lib/format"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { PageSection, SectionHeading } from "@/components/ui/section"

interface ShopFeatureProps {
  giftCard: Product | null
  featuredProducts: Product[]
}

// Gift cards plus a few featured products. Data comes from the home page.
export function ShopFeature({ giftCard, featuredProducts }: ShopFeatureProps) {
  const products = featuredProducts.filter((p) => p.slug !== GIFT_CARD_SLUG).slice(0, 4)

  return (
    <PageSection width="wide">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Shop" title="Products and gift cards">
          Products our practitioners use and recommend.
        </SectionHeading>
        <Button asChild variant="outline" className="self-start md:self-auto">
          <Link href="/products">Shop all products</Link>
        </Button>
      </div>

      {giftCard && (
        <div className="mt-10 grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-2">
          <div className="relative aspect-[4/3] bg-muted md:aspect-auto md:min-h-[320px]">
            <Image
              src={giftCard.image}
              alt={giftCard.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start justify-center gap-4 p-8 md:p-12">
            <p className="text-eyebrow">Gift cards</p>
            <h3 className="text-h2">{giftCard.name}</h3>
            <p className="font-body text-muted-foreground">
              From {formatPrice(GIFT_CARD_MIN)}, emailed to the recipient with a code to use in our shop.
            </p>
            <Button asChild>
              <Link href={`/products/${GIFT_CARD_SLUG}`}>Buy a gift card</Link>
            </Button>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  )
}
