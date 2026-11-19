import type { Metadata } from "next"

// The checkout pages are client components, which can't export metadata.
// This layout gives them a title and keeps them (and /checkout/success)
// out of search results.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
