import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllProductSlugs, getProductBySlug } from "@/lib/sanity.queries"
import { ProductDetail } from "@/components/products/product-detail"

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }

  return {
    title: product.name,
    description: product.shortDescription,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
