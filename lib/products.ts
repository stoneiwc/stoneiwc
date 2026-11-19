export interface Product {
  id: string
  name: string
  slug: string
  price: number
  isDiscount?: boolean
  originalPrice?: number
  description?: string
  shortDescription: string
  image: string
  /** Alt text from Sanity; falls back to the product name where it's empty. */
  imageAlt?: string
  category: string
  tags: string[]
  inStock: boolean
  featured: boolean
}

export const categories = [
  "All",
  "Oils & Serums",
  "Body Care",
  "Tools & Accessories",
  "Teas & Supplements",
  "Kits & Sets",
] as const

export type Category = (typeof categories)[number]
