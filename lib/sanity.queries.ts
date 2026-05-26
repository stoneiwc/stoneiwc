import { client } from './sanity.client'
import { Product } from './products'
import { urlFor } from './sanity.image'

interface SanityCategory {
  _id: string
  name: string
  slug: {
    current: string
  }
  description?: string
  order?: number
}

interface SanityProduct {
  _id: string
  name: string
  slug: {
    current: string
  }
  price: number
  isDiscount?: boolean
  discountedPrice?: number
  originalPrice?: number
  description: string
  shortDescription: string
  image: {
    asset: {
      _ref: string
      _type: string
    }
    alt?: string
  }
  category: {
    name: string
  }
  tags?: string[]
  inStock: boolean
  featured: boolean
}

function resolveProductPricing(sp: SanityProduct): {
  price: number
  originalPrice?: number
  isDiscount: boolean
} {
  // New format: editor toggled "Add Discount" and entered a valid discountedPrice
  if (sp.isDiscount === true && sp.discountedPrice != null && sp.discountedPrice < sp.price) {
    return {price: sp.discountedPrice, originalPrice: sp.price, isDiscount: true}
  }
  // Legacy format (pre-migration): `price` was the selling price, `originalPrice` the strikethrough
  if (sp.originalPrice != null && sp.originalPrice > sp.price) {
    return {price: sp.price, originalPrice: sp.originalPrice, isDiscount: true}
  }
  return {price: sp.price, originalPrice: undefined, isDiscount: false}
}

function transformProduct(sanityProduct: SanityProduct): Product {
  const pricing = resolveProductPricing(sanityProduct)
  return {
    id: sanityProduct._id,
    name: sanityProduct.name,
    slug: sanityProduct.slug.current,
    price: pricing.price,
    isDiscount: pricing.isDiscount,
    originalPrice: pricing.originalPrice,
    description: sanityProduct.description,
    shortDescription: sanityProduct.shortDescription,
    image: urlFor(sanityProduct.image).width(800).height(800).url(),
    category: sanityProduct.category.name,
    tags: sanityProduct.tags || [],
    inStock: sanityProduct.inStock,
    featured: sanityProduct.featured,
  }
}

const productProjection = `
  _id,
  name,
  slug,
  price,
  isDiscount,
  discountedPrice,
  originalPrice,
  description,
  shortDescription,
  image,
  "category": category->{name},
  tags,
  inStock,
  featured
`

export async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(name asc) {
    ${productProjection}
  }`
  const products = await client.fetch<SanityProduct[]>(query, {}, { next: { tags: ["product"] } })
  return products.map(transformProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    ${productProjection}
  }`
  const product = await client.fetch<SanityProduct | null>(query, { slug }, { next: { tags: ["product"] } })
  return product ? transformProduct(product) : null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && featured == true] | order(name asc) {
    ${productProjection}
  }`
  const products = await client.fetch<SanityProduct[]>(query, {}, { next: { tags: ["product"] } })
  return products.map(transformProduct)
}

export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  const query = `*[_type == "product" && category->name == $categoryName] | order(name asc) {
    ${productProjection}
  }`
  const products = await client.fetch<SanityProduct[]>(query, { categoryName }, { next: { tags: ["product"] } })
  return products.map(transformProduct)
}

export async function getAllCategories(): Promise<SanityCategory[]> {
  const query = `*[_type == "category"] | order(orderRank asc) {
    _id,
    name,
    slug,
    description,
    order
  }`
  return client.fetch<SanityCategory[]>(query, {}, { next: { tags: ["category"] } })
}

export async function getAllProductSlugs(): Promise<string[]> {
  const query = `*[_type == "product"].slug.current`
  return client.fetch<string[]>(query, {}, { next: { tags: ["product"] } })
}

export interface SanityHeroSlide {
  subtitle: string
  title: string
  description: string
  image: { asset: { _ref: string; _type: string }; alt?: string }
}

export async function getHeroSlides(): Promise<SanityHeroSlide[]> {
  const query = `*[_type == "heroSlide"] | order(orderRank asc) {
    subtitle,
    title,
    description,
    image
  }`
  return client.fetch<SanityHeroSlide[]>(query)
}

type SanityImageField = { asset: { _ref: string; _type: string }; alt?: string }

export interface SanityHomePageImages {
  aboutImage?: SanityImageField
  culinaryImage?: SanityImageField
  servicesConciergeImage?: SanityImageField
  servicesTreatmentRoomImage?: SanityImageField
}

export async function getHomePageImages(): Promise<SanityHomePageImages | null> {
  const query = `*[_type == "homePageImages" && _id == "homePageImages"][0] {
    aboutImage,
    culinaryImage,
    servicesConciergeImage,
    servicesTreatmentRoomImage
  }`
  return client.fetch<SanityHomePageImages | null>(query, {}, { next: { tags: ["homePageImages"] } })
}

// ─── About Page ──────────────────────────────────────────────────────────────

export interface SanityAboutPageImages {
  heroImage?: SanityImageField
}

export async function getAboutPageImages(): Promise<SanityAboutPageImages | null> {
  const query = `*[_type == "aboutPageImages" && _id == "aboutPageImages"][0] {
    heroImage
  }`
  return client.fetch<SanityAboutPageImages | null>(query, {}, { next: { tags: ["aboutPageImages"] } })
}

// ─── Services Page ───────────────────────────────────────────────────────────

export interface SanityServicesPageImages {
  treatmentsImage?: SanityImageField
  conciergeImage?: SanityImageField
  culinaryImage?: SanityImageField
}

export async function getServicesPageImages(): Promise<SanityServicesPageImages | null> {
  const query = `*[_type == "servicesPageImages" && _id == "servicesPageImages"][0] {
    treatmentsImage,
    conciergeImage,
    culinaryImage
  }`
  return client.fetch<SanityServicesPageImages | null>(query)
}

export interface SanityConciergeImages {
  mainImage?: SanityImageField
}

export async function getConciergeImages(): Promise<SanityConciergeImages | null> {
  const query = `*[_type == "conciergeImages" && _id == "conciergeImages"][0] {
    mainImage
  }`
  return client.fetch<SanityConciergeImages | null>(query)
}

export interface SanityVirtualConsultationsImages {
  mainImage?: SanityImageField
}

export async function getVirtualConsultationsImages(): Promise<SanityVirtualConsultationsImages | null> {
  const query = `*[_type == "virtualConsultationsImages" && _id == "virtualConsultationsImages"][0] {
    mainImage
  }`
  return client.fetch<SanityVirtualConsultationsImages | null>(query)
}

// ─── Education Page ──────────────────────────────────────────────────────────

export interface SanityEducationPageImages {
  heroImage?: SanityImageField
}

export async function getEducationPageImages(): Promise<SanityEducationPageImages | null> {
  const query = `*[_type == "educationPageImages" && _id == "educationPageImages"][0] {
    heroImage
  }`
  return client.fetch<SanityEducationPageImages | null>(query, {}, { next: { tags: ["educationPageImages"] } })
}

// ─── Featured On Page ────────────────────────────────────────────────────────

export interface SanityFeaturedPageImages {
  heroImage?: SanityImageField
}

export async function getFeaturedPageImages(): Promise<SanityFeaturedPageImages | null> {
  const query = `*[_type == "featuredPageImages" && _id == "featuredPageImages"][0] {
    heroImage
  }`
  return client.fetch<SanityFeaturedPageImages | null>(query, {}, { next: { tags: ["featuredPageImages"] } })
}

// ─── Education ───────────────────────────────────────────────────────────────

export async function getCertificationImages(): Promise<{mainImage?: SanityImageField} | null> {
  return client.fetch(`*[_type == "certificationImages" && _id == "certificationImages"][0]{mainImage}`, {}, { next: { tags: ["certificationImages"] } })
}

export async function getLicenseeProgramImages(): Promise<{mainImage?: SanityImageField} | null> {
  return client.fetch(`*[_type == "licenseeProgramImages" && _id == "licenseeProgramImages"][0]{mainImage}`, {}, { next: { tags: ["licenseeProgramImages"] } })
}

export async function getCuppingImages(): Promise<{mainImage?: SanityImageField} | null> {
  return client.fetch(`*[_type == "cuppingImages" && _id == "cuppingImages"][0]{mainImage}`, {}, { next: { tags: ["cuppingImages"] } })
}

export interface SanityArticle {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  coverImage?: SanityImageField
  excerpt: string
  tags?: string[]
}

export interface SanityArticleFull extends SanityArticle {
  body: any[]
}

export async function getArticles(): Promise<SanityArticle[]> {
  return client.fetch(`*[_type == "article"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, coverImage, excerpt, tags
  }`, {}, { next: { tags: ["article"] } })
}

export async function getArticleBySlug(slug: string): Promise<SanityArticleFull | null> {
  return client.fetch(`*[_type == "article" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, coverImage, excerpt, tags, body
  }`, { slug }, { next: { tags: ["article"] } })
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return client.fetch(`*[_type == "article"].slug.current`, {}, { next: { tags: ["article"] } })
}

// ─── Press Items ─────────────────────────────────────────────────────────────

export interface SanityPressItem {
  _id: string
  title: string
  description: string
  image: { asset: { _ref: string; _type: string }; alt?: string }
  link: string
}

export async function getPressItems(): Promise<SanityPressItem[]> {
  const query = `*[_type == "pressItem"] | order(orderRank asc) {
    _id,
    title,
    description,
    image,
    link
  }`
  return client.fetch<SanityPressItem[]>(query, {}, { next: { tags: ["pressItem"] } })
}

// ─── Award Items ─────────────────────────────────────────────────────────────

export interface SanityAwardItem {
  _id: string
  title: string
  description: string
  image: { asset: { _ref: string; _type: string }; alt?: string }
}

export async function getAwardItems(): Promise<SanityAwardItem[]> {
  const query = `*[_type == "awardItem"] | order(orderRank asc) {
    _id,
    title,
    description,
    image
  }`
  return client.fetch<SanityAwardItem[]>(query, {}, { next: { tags: ["awardItem"] } })
}

// ─── Media Items ─────────────────────────────────────────────────────────────

export interface SanityMediaItem {
  _id: string
  title: string
  description: string
  youtubeUrl: string
}

export async function getMediaItems(): Promise<SanityMediaItem[]> {
  const query = `*[_type == "mediaItem"] | order(orderRank asc) {
    _id,
    title,
    description,
    youtubeUrl
  }`
  return client.fetch<SanityMediaItem[]>(query, {}, { next: { tags: ["mediaItem"] } })
}

// ─── QC Show ─────────────────────────────────────────────────────────────────

export interface SanityQcShowFlyer {
  image?: { asset: { _ref: string; _type: string }; alt?: string }
}

export async function getQcShowFlyer(): Promise<SanityQcShowFlyer | null> {
  return client.fetch(`*[_type == "qcShowFlyer" && _id == "qcShowFlyer"][0]{ image }`, {}, { next: { tags: ["qcShowFlyer"] } })
}

export interface SanityQcShowEpisode {
  _id: string
  _createdAt: string
  youtubeUrl: string
}

export async function getQcShowEpisodes(): Promise<SanityQcShowEpisode[]> {
  return client.fetch(`*[_type == "qcShowEpisode"] | order(_createdAt asc) {
    _id,
    _createdAt,
    youtubeUrl
  }`, {}, { next: { tags: ["qcShowEpisode"] } })
}

// ─── Our Story ──────────────────────────────────────────────────────────────

export interface SanityOurStoryImages {
  mainImage?: SanityImageField
}

export async function getOurStoryImages(): Promise<SanityOurStoryImages | null> {
  const query = `*[_type == "ourStoryImages" && _id == "ourStoryImages"][0] {
    mainImage
  }`
  return client.fetch<SanityOurStoryImages | null>(query, {}, { next: { tags: ["ourStoryImages"] } })
}

// ─── Team Members ────────────────────────────────────────────────────────────

export interface SanityTeamMember {
  _id: string
  name: string
  title: string
  bio?: string
  image?: SanityImageField
  specialties?: string[]
}

export async function getTeamMembers(): Promise<SanityTeamMember[]> {
  const query = `*[_type == "teamMember"] | order(orderRank asc) {
    _id,
    name,
    title,
    bio,
    image,
    specialties
  }`
  return client.fetch<SanityTeamMember[]>(query, {}, { next: { tags: ["teamMember"] } })
}

// ─── Partners & Affiliates ───────────────────────────────────────────────────

export interface SanityPartner {
  _id: string
  name: string
  description?: string
  logo?: SanityImageField
  websiteUrl?: string
}

export async function getPartners(): Promise<SanityPartner[]> {
  const query = `*[_type == "partner"] | order(orderRank asc) {
    _id,
    name,
    description,
    logo,
    websiteUrl
  }`
  return client.fetch<SanityPartner[]>(query, {}, { next: { tags: ["partner"] } })
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export interface SanityCoupon {
  code: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minSubtotal?: number
  isActive: boolean
}

export async function getCoupons(): Promise<SanityCoupon[]> {
  return client.fetch(
    `*[_type == "coupon" && isActive == true] {
      code,
      description,
      type,
      value,
      minSubtotal,
      isActive
    }`,
    {},
    { next: { tags: ["coupon"] } }
  )
}

// ─── Shipping Methods ─────────────────────────────────────────────────────────

export interface SanityShippingMethod {
  id: string
  name: string
  description: string
  cost: number
}

export async function getShippingMethods(): Promise<SanityShippingMethod[]> {
  return client.fetch(
    `*[_type == "shippingMethod" && isActive == true] | order(order asc) {
      "id": id.current,
      name,
      description,
      cost
    }`,
    {},
    { next: { tags: ["shippingMethod"] } }
  )
}
