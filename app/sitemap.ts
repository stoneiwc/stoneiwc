import type { MetadataRoute } from "next"
import { getAllProductSlugs, getAllArticleSlugs } from "@/lib/sanity.queries"

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com"

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
  { url: `${BASE_URL}/products`, priority: 0.9, changeFrequency: "daily" },
  { url: `${BASE_URL}/book`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE_URL}/education`, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE_URL}/services`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE_URL}/featured`, priority: 0.7, changeFrequency: "weekly" },
  { url: `${BASE_URL}/contact`, priority: 0.6, changeFrequency: "yearly" },
  { url: `${BASE_URL}/our-policies`, priority: 0.3, changeFrequency: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, articleSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllArticleSlugs(),
  ])

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/education/articles/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }))

  return [...STATIC_ROUTES, ...productRoutes, ...articleRoutes]
}
