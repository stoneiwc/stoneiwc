export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  description: string
  shortDescription: string
  image: string
  category: string
  tags: string[]
  rating: number
  reviewCount: number
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

export const products: Product[] = [
  {
    id: "1",
    name: "Therapeutic Herbal Massage Oil",
    slug: "therapeutic-herbal-massage-oil",
    price: 48,
    originalPrice: 58,
    description:
      "A restorative blend of jojoba, argan, and essential oils designed to soothe tired muscles and nourish the skin. Formulated by our practitioners using traditional techniques passed down through generations. This massage oil absorbs quickly without leaving a greasy residue, making it perfect for both professional and at-home use. Infused with lavender, eucalyptus, and chamomile for a calming, therapeutic experience.",
    shortDescription:
      "Restorative blend of jojoba, argan, and essential oils for muscle relief.",
    image: "/images/products/herbal-oil.jpg",
    category: "Oils & Serums",
    tags: ["bestseller", "organic"],
    rating: 4.9,
    reviewCount: 127,
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Professional Cupping Set",
    slug: "professional-cupping-set",
    price: 89,
    description:
      "Medical-grade silicone and glass cupping set used by our practitioners. Includes 12 cups in varying sizes for targeted therapy across different body areas. Comes with a detailed instruction guide and carrying case. Each cup is precision-crafted for optimal suction and comfort during cupping therapy sessions.",
    shortDescription:
      "Medical-grade 12-piece cupping set with carrying case and guide.",
    image: "/images/products/cupping-set.jpg",
    category: "Tools & Accessories",
    tags: ["professional"],
    rating: 4.8,
    reviewCount: 84,
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Rejuvenating Face Serum",
    slug: "rejuvenating-face-serum",
    price: 72,
    originalPrice: 85,
    description:
      "Advanced facial serum combining hyaluronic acid with botanical extracts for deep hydration and visible rejuvenation. This lightweight formula penetrates quickly to deliver concentrated nourishment where your skin needs it most. Features vitamin C, retinol, and green tea extract for a complete anti-aging solution.",
    shortDescription:
      "Botanical face serum with hyaluronic acid for deep hydration.",
    image: "/images/products/face-serum.jpg",
    category: "Oils & Serums",
    tags: ["bestseller", "anti-aging"],
    rating: 4.7,
    reviewCount: 203,
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Nourishing Body Cream",
    slug: "nourishing-body-cream",
    price: 42,
    description:
      "Rich yet lightweight body cream infused with shea butter, lavender, and vitamin E. Designed to deeply moisturize and restore skin elasticity after treatments. The non-greasy formula absorbs instantly, leaving skin silky smooth with a subtle calming fragrance.",
    shortDescription:
      "Shea butter and lavender body cream for post-treatment care.",
    image: "/images/products/body-cream.jpg",
    category: "Body Care",
    tags: ["organic", "post-treatment"],
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    featured: false,
  },
  {
    id: "5",
    name: "Aromatherapy Essential Oil Kit",
    slug: "aromatherapy-essential-oil-kit",
    price: 120,
    originalPrice: 145,
    description:
      "Curated collection of 8 pure essential oils in a handcrafted wooden box. Includes lavender, eucalyptus, peppermint, tea tree, frankincense, lemon, rosemary, and ylang-ylang. Each oil is 100% pure, therapeutic grade, and sourced from sustainable farms. Perfect for aromatherapy, massage, or creating your own wellness blends.",
    shortDescription:
      "8 pure therapeutic-grade essential oils in a handcrafted wooden box.",
    image: "/images/products/essential-kit.jpg",
    category: "Kits & Sets",
    tags: ["gift", "organic"],
    rating: 4.9,
    reviewCount: 91,
    inStock: true,
    featured: true,
  },
  {
    id: "6",
    name: "Holistic Healing Tea Blend",
    slug: "holistic-healing-tea-blend",
    price: 28,
    description:
      "Handcrafted loose-leaf tea blend combining chamomile, ginger, turmeric, and ashwagandha. Designed to support relaxation and natural detoxification. Sourced from organic farms and blended in small batches for maximum freshness and potency. Enjoy hot or cold for a calming daily ritual.",
    shortDescription:
      "Organic loose-leaf wellness tea with chamomile and turmeric.",
    image: "/images/products/tea-blend.jpg",
    category: "Teas & Supplements",
    tags: ["organic", "detox"],
    rating: 4.5,
    reviewCount: 178,
    inStock: true,
    featured: false,
  },
  {
    id: "7",
    name: "Jade Gua Sha Facial Tool",
    slug: "jade-gua-sha-facial-tool",
    price: 38,
    description:
      "Authentic jade gua sha tool hand-carved for optimal facial contours. Promotes lymphatic drainage, reduces puffiness, and enhances product absorption when used as part of your skincare routine. Comes with a silk pouch and detailed usage guide with techniques recommended by our practitioners.",
    shortDescription:
      "Hand-carved jade gua sha for facial contouring and lymphatic drainage.",
    image: "/images/products/gua-sha.jpg",
    category: "Tools & Accessories",
    tags: ["bestseller"],
    rating: 4.8,
    reviewCount: 215,
    inStock: true,
    featured: false,
  },
  {
    id: "8",
    name: "Mineral Bath Salt Collection",
    slug: "mineral-bath-salt-collection",
    price: 35,
    originalPrice: 42,
    description:
      "Premium Himalayan and Dead Sea salt blend infused with rose petals, essential oils, and minerals. Transforms your bath into a therapeutic spa experience. Relieves muscle tension, softens skin, and promotes deep relaxation. Packaged in a reusable glass jar.",
    shortDescription:
      "Himalayan and Dead Sea salt blend with rose petals for therapeutic baths.",
    image: "/images/products/bath-salts.jpg",
    category: "Body Care",
    tags: ["relaxation", "organic"],
    rating: 4.7,
    reviewCount: 142,
    inStock: true,
    featured: false,
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: Category): Product[] {
  if (category === "All") return products
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}
