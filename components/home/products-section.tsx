import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getFeaturedProducts } from "@/lib/sanity.queries"
import { ProductCard } from "@/components/products/product-card"

export async function ProductsSection() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <div className="mt-24">
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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
