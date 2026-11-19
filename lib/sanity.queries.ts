import { cache } from 'react'
import type { QueryParams } from '@sanity/client'
import { readClient as client } from './sanity.client'
import { Product } from './products'
import { urlFor } from './sanity.image'
import { CONTENT_REVALIDATE_SECONDS, type ContentType } from './sanity-tags'

// Page content: cached in Next's Data Cache and tagged with the document
// types it reads, so a Sanity publish can refresh it through /api/revalidate.
function contentFetch<T>(query: string, params: QueryParams, types: ContentType[]): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: types },
  })
}

// Checkout data: always read live, so a deactivated coupon or a changed
// shipping price takes effect on the very next order.
function liveFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  return client.fetch<T>(query, params, { cache: 'no-store' })
}

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
  description?: string
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

// Fields a product card needs. List views leave out the full description,
// which would otherwise be serialized into the page for every card.
const productCardProjection = `
  _id,
  name,
  slug,
  price,
  isDiscount,
  discountedPrice,
  originalPrice,
  shortDescription,
  image,
  "category": category->{name},
  tags,
  inStock,
  featured
`

const productDetailProjection = `
  ${productCardProjection},
  description
`

// Products embed their category's name, so a category rename refreshes them too.
const PRODUCT_TAGS: ContentType[] = ['product', 'category']

export async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(name asc) {
    ${productCardProjection}
  }`
  const products = await contentFetch<SanityProduct[]>(query, {}, PRODUCT_TAGS)
  return products.map(transformProduct)
}

// cache(): generateMetadata and the page both ask for the product; this makes
// it one query per request.
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    ${productDetailProjection}
  }`
  const product = await contentFetch<SanityProduct | null>(query, { slug }, PRODUCT_TAGS)
  return product ? transformProduct(product) : null
})

export async function getFeaturedProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && featured == true] | order(name asc) {
    ${productCardProjection}
  }`
  const products = await contentFetch<SanityProduct[]>(query, {}, PRODUCT_TAGS)
  return products.map(transformProduct)
}

export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  const query = `*[_type == "product" && category->name == $categoryName] | order(name asc) {
    ${productCardProjection}
  }`
  const products = await contentFetch<SanityProduct[]>(query, { categoryName }, PRODUCT_TAGS)
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
  return contentFetch<SanityCategory[]>(query, {}, ['category'])
}

export async function getAllProductSlugs(): Promise<string[]> {
  const query = `*[_type == "product"].slug.current`
  return contentFetch<string[]>(query, {}, ['product'])
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
  return contentFetch<SanityHeroSlide[]>(query, {}, ['heroSlide'])
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
  return contentFetch<SanityHomePageImages | null>(query, {}, ['homePageImages'])
}

// ─── About Page ──────────────────────────────────────────────────────────────

export interface SanityAboutPageImages {
  heroImage?: SanityImageField
}

export async function getAboutPageImages(): Promise<SanityAboutPageImages | null> {
  const query = `*[_type == "aboutPageImages" && _id == "aboutPageImages"][0] {
    heroImage
  }`
  return contentFetch<SanityAboutPageImages | null>(query, {}, ['aboutPageImages'])
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
  return contentFetch<SanityServicesPageImages | null>(query, {}, ['servicesPageImages'])
}

export interface SanityConciergeImages {
  mainImage?: SanityImageField
}

export async function getConciergeImages(): Promise<SanityConciergeImages | null> {
  const query = `*[_type == "conciergeImages" && _id == "conciergeImages"][0] {
    mainImage
  }`
  return contentFetch<SanityConciergeImages | null>(query, {}, ['conciergeImages'])
}

export interface SanityVirtualConsultationsImages {
  mainImage?: SanityImageField
}

export async function getVirtualConsultationsImages(): Promise<SanityVirtualConsultationsImages | null> {
  const query = `*[_type == "virtualConsultationsImages" && _id == "virtualConsultationsImages"][0] {
    mainImage
  }`
  return contentFetch<SanityVirtualConsultationsImages | null>(query, {}, ['virtualConsultationsImages'])
}

// ─── Education Page ──────────────────────────────────────────────────────────

// ─── Featured On Page ────────────────────────────────────────────────────────

// ─── Education ───────────────────────────────────────────────────────────────

export async function getCertificationImages(): Promise<{mainImage?: SanityImageField} | null> {
  return contentFetch(`*[_type == "certificationImages" && _id == "certificationImages"][0]{mainImage}`, {}, ['certificationImages'])
}

export async function getLicenseeProgramImages(): Promise<{mainImage?: SanityImageField} | null> {
  return contentFetch(`*[_type == "licenseeProgramImages" && _id == "licenseeProgramImages"][0]{mainImage}`, {}, ['licenseeProgramImages'])
}

export async function getCuppingImages(): Promise<{mainImage?: SanityImageField} | null> {
  return contentFetch(`*[_type == "cuppingImages" && _id == "cuppingImages"][0]{mainImage}`, {}, ['cuppingImages'])
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
  return contentFetch<SanityPressItem[]>(query, {}, ['pressItem'])
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
  return contentFetch<SanityMediaItem[]>(query, {}, ['mediaItem'])
}

// ─── QC Show ─────────────────────────────────────────────────────────────────

export interface SanityQcShowFlyer {
  image?: { asset: { _ref: string; _type: string }; alt?: string }
}

export async function getQcShowFlyer(): Promise<SanityQcShowFlyer | null> {
  return contentFetch(`*[_type == "qcShowFlyer" && _id == "qcShowFlyer"][0]{ image }`, {}, ['qcShowFlyer'])
}

export interface SanityQcShowEpisode {
  _id: string
  _createdAt: string
  youtubeUrl: string
}

export async function getQcShowEpisodes(): Promise<SanityQcShowEpisode[]> {
  return contentFetch(`*[_type == "qcShowEpisode"] | order(_createdAt asc) {
    _id,
    _createdAt,
    youtubeUrl
  }`, {}, ['qcShowEpisode'])
}

// ─── Our Story ──────────────────────────────────────────────────────────────

export interface SanityOurStoryImages {
  mainImage?: SanityImageField
}

export async function getOurStoryImages(): Promise<SanityOurStoryImages | null> {
  const query = `*[_type == "ourStoryImages" && _id == "ourStoryImages"][0] {
    mainImage
  }`
  return contentFetch<SanityOurStoryImages | null>(query, {}, ['ourStoryImages'])
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
  return contentFetch<SanityTeamMember[]>(query, {}, ['teamMember'])
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
  return contentFetch<SanityPartner[]>(query, {}, ['partner'])
}

// ─── Coupons (checkout: always live) ─────────────────────────────────────────

export interface SanityCoupon {
  code: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minSubtotal?: number
  isActive: boolean
}

export async function getCoupons(): Promise<SanityCoupon[]> {
  return liveFetch(
    `*[_type == "coupon" && isActive == true] {
      code,
      description,
      type,
      value,
      minSubtotal,
      isActive
    }`,
  )
}

// ─── Shipping Methods (checkout: always live) ────────────────────────────────

export interface SanityShippingMethod {
  id: string
  name: string
  description: string
  cost: number
}

export async function getShippingMethods(): Promise<SanityShippingMethod[]> {
  return liveFetch(
    `*[_type == "shippingMethod" && isActive == true] | order(order asc) {
      "id": id.current,
      name,
      description,
      cost
    }`,
  )
}
