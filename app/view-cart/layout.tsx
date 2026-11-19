import type { Metadata } from "next"

// /view-cart is a client component, which can't export metadata.
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
}

export default function ViewCartLayout({ children }: { children: React.ReactNode }) {
  return children
}
