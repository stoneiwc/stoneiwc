/** @type {import('next').NextConfig} */

// Only this project's Sanity images go through the image optimizer. Without a
// path, any Sanity project's images could be resized on this site's quota.
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityImagePath = sanityProjectId ? `/images/${sanityProjectId}/**` : "/images/**"

const isDev = process.env.NODE_ENV === "development"

// Content-Security-Policy: the origins each feature needs.
//   Stripe (Elements, 3-D Secure, Link): js/api/hooks.stripe.com
//   Google Analytics (gtag):             *.googletagmanager.com, *.google-analytics.com
//   Cal.com booking embed:               app.cal.com (script + iframe), cal.com
//   Podcast player:                      open.spotify.com (iframe)
//   Images:                              cdn.sanity.io, img.youtube.com
//   Vercel Analytics / Speed Insights load from this origin (/_vercel/...).
// 'unsafe-inline' scripts: Next.js inlines its bootstrap scripts, and nonces
// would force every page to render dynamically (no ISR). Dev also needs
// 'unsafe-eval' and the HMR websocket.
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev && "'unsafe-eval'",
    "https://js.stripe.com https://*.js.stripe.com",
    "https://*.googletagmanager.com",
    "https://app.cal.com",
    isDev && "https://va.vercel-scripts.com",
  ].filter(Boolean).join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://img.youtube.com https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://api.stripe.com https://*.stripe.com",
    "https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
    "https://app.cal.com https://api.cal.com",
    isDev && "ws: https://va.vercel-scripts.com",
  ].filter(Boolean).join(" "),
  "frame-src https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://app.cal.com https://cal.com https://open.spotify.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ")

// Applied to every response. HSTS is already sent by Vercel for the domain.
const securityHeaders = [
  // REPORT-ONLY for now: browsers log violations in the console but block
  // nothing. Once checkout (incl. 3-D Secure), booking, the podcast page and
  // analytics run with no "[Report Only] Refused to…" messages, rename the key
  // to "Content-Security-Policy" to enforce it.
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
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
      // Pages merged into others in the 2026 redesign. Old URLs are still in
      // search indexes, bookmarks and printed material, so each goes to the
      // section of the page that replaced it.
      { source: "/services/treatments", destination: "/services", permanent: true },
      { source: "/services/virtual-consultations", destination: "/services#video", permanent: true },
      { source: "/education", destination: "/faq", permanent: true },
      { source: "/education/general", destination: "/faq", permanent: true },
      { source: "/education/articles/:slug*", destination: "/faq", permanent: true },
      { source: "/education/certifications", destination: "/training#certifications", permanent: true },
      { source: "/education/licensee", destination: "/training#licensing", permanent: true },
      { source: "/our-policies", destination: "/faq#policies", permanent: true },
      { source: "/about/our-story", destination: "/about", permanent: true },
      { source: "/featured", destination: "/media", permanent: true },
      { source: "/featured/press", destination: "/media#press", permanent: true },
      { source: "/featured/media", destination: "/media#video", permanent: true },
      { source: "/featured/qc-show", destination: "/media#qc-show", permanent: true },
      { source: "/featured/podcast", destination: "/media#podcast", permanent: true },
      { source: "/featured/:path*", destination: "/media", permanent: true },
    ]
  },
}

export default nextConfig
