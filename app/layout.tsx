import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Lato } from "next/font/google"

import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/lib/cart-context"
import { JsonLd } from "@/components/seo/json-ld"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
})

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://stoneiwc.com"

const DESCRIPTION =
  "A concierge holistic wellness retreat devoted to restoring the body from the inside out. Personalized lymphatic care, non-surgical body contouring, restorative hand & foot care, holistic nourishment guidance, and refined semi-permanent aesthetics."

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Stone International Wellness Center",
    template: "%s | Stone IWC",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Stone International Wellness Center",
    title: "Stone International Wellness Center",
    description: DESCRIPTION,
    url: BASE_URL,
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
  alternates: {
    canonical: BASE_URL,
  },
}

export const viewport: Viewport = {
  themeColor: "#C5A44E",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#organization`,
    name: "Stone International Wellness Center",
    url: BASE_URL,
    logo: `${BASE_URL}/stoneiwc-logo.png`,
    description: DESCRIPTION,
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Stone International Wellness Center",
        publisher: { "@id": `${BASE_URL}/#organization` },
      },
    ],
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <JsonLd data={organizationSchema} />
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
