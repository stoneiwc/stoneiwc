/** @type {import('next').NextConfig} */

// Only this project's Sanity images go through the image optimizer. Without a
// path, any Sanity project's images could be resized on this site's quota.
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityImagePath = sanityProjectId ? `/images/${sanityProjectId}/**` : "/images/**"

// Applied to every response. HSTS is already sent by Vercel for the domain.
// A Content-Security-Policy isn't set yet: Stripe, Cal.com, Google Analytics
// and Next's inline scripts need a tested policy (see the security report).
const securityHeaders = [
  // Don't let browsers guess content types (stops e.g. an upload being run as script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only this site may frame its pages (clickjacking). Cal.com and Stripe
  // iframes inside our pages are unaffected.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send only the origin to other sites, never full URLs with query strings.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Turn off browser features the site never uses. `payment` stays allowed
  // for Stripe's Apple Pay / Google Pay.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
]

const nextConfig = {
  // Don't advertise the framework (X-Powered-By: Next.js).
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: sanityImagePath },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      // The Articles section was removed; its pages are still in search indexes.
      { source: "/education/articles/:slug*", destination: "/education", permanent: true },
    ]
  },
}

export default nextConfig
