import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllProductSlugs, getProductBySlug } from "@/lib/sanity.queries"
import { ProductDetail } from "@/components/products/product-detail"
import { JsonLd } from "@/components/seo/json-ld"

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

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com"
  const canonicalUrl = `${baseUrl}/products/${slug}`

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: canonicalUrl,
      type: "website",
      ...(product.image && {
        images: [{ url: product.image, alt: product.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      ...(product.image && { images: [product.image] }),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com"

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${baseUrl}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Stone IWC",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/products/${product.slug}`,
    },
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <ProductDetail product={product} />
    </>
  )
}
