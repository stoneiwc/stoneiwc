import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_INFO } from "@/lib/navigation";
import { SITE_NAME } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com";

const DESCRIPTION =
  "A concierge holistic wellness retreat devoted to restoring the body from the inside out. Personalized lymphatic care, non-surgical body contouring, restorative hand & foot care, holistic nourishment guidance, and refined semi-permanent aesthetics.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Stone International Wellness Center",
    template: "%s | Stone IWC",
  },
  description: DESCRIPTION,
  // No url or canonical here: pages inherit any key they don't set, so a
  // root canonical made every page claim to be the homepage. Pages set their
  // own through pageMetadata() (lib/seo.ts).
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stone International Wellness Center",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#C5A44E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // @graph sits at the top level: nested inside the LocalBusiness, Google
  // read it as a property of the business rather than a second entity.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/images/logo.png`,
        image: `${BASE_URL}/images/logo.png`,
        description: DESCRIPTION,
        email: CONTACT_INFO.email,
        telephone: CONTACT_INFO.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "1108 W Parker Rd Ste 102",
          addressLocality: "Plano",
          addressRegion: "TX",
          postalCode: "75075",
          addressCountry: "US",
        },
        sameAs: [
          "https://www.facebook.com/stoneiwc/",
          "https://x.com/stoneiwc_",
          "https://www.instagram.com/stoneiwc_/",
          "https://www.tiktok.com/@stoneiwc",
          "https://www.youtube.com/@stoneiwc",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${BASE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <JsonLd data={organizationSchema} />
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        {/* One Google tag: G-… is a GA4 measurement ID, not a GTM container. */}
        <GoogleAnalytics gaId="G-K90NGHL09B" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
