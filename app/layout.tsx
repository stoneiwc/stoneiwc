import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Lato } from "next/font/google"

import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/lib/cart-context"

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

export const metadata: Metadata = {
  title: {
    default: "Stone International Wellness Center",
    template: "%s | Stone IWC",
  },
  description:
    "A concierge holistic wellness retreat devoted to restoring the body from the inside out. Personalized lymphatic care, non-surgical body contouring, restorative hand & foot care, holistic nourishment guidance, and refined semi-permanent aesthetics.",
}

export const viewport: Viewport = {
  themeColor: "#C5A44E",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
