import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products/products-grid"

export const metadata: Metadata = {
  title: "Products",
  description:
    "Premium wellness products curated by Stone International Wellness Center practitioners.",
}

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Our Products"
        subtitle="Premium wellness essentials hand-selected by our practitioners to complement your healing journey."
      />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <ProductsGrid />
      </section>
    </>
  )
}
