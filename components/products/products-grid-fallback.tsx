import type { Product } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"

// Server-rendered stand-in for <ProductsGrid> while it waits for the URL's
// filter parameters (useSearchParams). Without it, /products shipped no
// product cards in its HTML: nothing for crawlers, and images couldn't start
// loading until the JavaScript ran. Same grid and the same default order
// (featured first) as the unfiltered grid.
export function ProductsGridFallback({ products }: { products: Product[] }) {
  const featuredFirst = [...products].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
  )

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {featuredFirst.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
