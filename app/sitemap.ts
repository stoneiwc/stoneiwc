import type { MetadataRoute } from "next"
import { getAllProductSlugs } from "@/lib/sanity.queries"
import { getEventTypes } from "@/lib/cal-api"
import { navigation } from "@/lib/navigation"

// Rebuilt hourly so new products and services appear without a deploy.
// Publishing a product also refreshes it through the "product" cache tag.
export const revalidate = 3600

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

// Every page in the nav dropdowns, so a page added to the menu is in the
// sitemap too.
const SUBPAGE_ROUTES: MetadataRoute.Sitemap = navigation.flatMap((item) =>
  (item.children ?? []).map((child) => ({
    url: `${BASE_URL}${child.href}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, events] = await Promise.all([
    getAllProductSlugs(),
    // Leave booking pages out rather than fail the sitemap if Cal.com is down.
    getEventTypes(process.env.NEXT_PUBLIC_CAL_USERNAME!).catch(() => []),
  ])

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }))

  const bookingRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/book/${event.slug}`,
    priority: 0.7,
    changeFrequency: "weekly",
  }))

  return [...STATIC_ROUTES, ...SUBPAGE_ROUTES, ...productRoutes, ...bookingRoutes]
}
