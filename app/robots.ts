import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // No trailing slashes: "/checkout/" doesn't match "/checkout" itself.
        disallow: ["/api/", "/checkout", "/view-cart"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
