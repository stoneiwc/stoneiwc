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
  rating: number
  reviewCount: number
  inStock: boolean
  featured: boolean
}

function transformProduct(sanityProduct: SanityProduct): Product {
  return {
    id: sanityProduct._id,
    name: sanityProduct.name,
    slug: sanityProduct.slug.current,
    price: sanityProduct.price,
    originalPrice: sanityProduct.originalPrice,
    description: sanityProduct.description,
    shortDescription: sanityProduct.shortDescription,
    image: urlFor(sanityProduct.image).width(800).height(800).url(),
    category: sanityProduct.category.name,
    tags: sanityProduct.tags || [],
    rating: sanityProduct.rating,
    reviewCount: sanityProduct.reviewCount,
    inStock: sanityProduct.inStock,
    featured: sanityProduct.featured,
  }
}

const productProjection = `
  _id,
  name,
  slug,
  price,
  originalPrice,
  description,
  shortDescription,
  image,
  "category": category->{name},
  tags,
  rating,
  reviewCount,
  inStock,
  featured
`

export async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(name asc) {
    ${productProjection}
  }`
  
  const products = await client.fetch<SanityProduct[]>(query)
  return products.map(transformProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    ${productProjection}
  }`
  
  const product = await client.fetch<SanityProduct | null>(query, { slug })
  return product ? transformProduct(product) : null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && featured == true] | order(name asc) {
    ${productProjection}
  }`
  
  const products = await client.fetch<SanityProduct[]>(query)
  return products.map(transformProduct)
}

export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  const query = `*[_type == "product" && category->name == $categoryName] | order(name asc) {
    ${productProjection}
  }`
  
  const products = await client.fetch<SanityProduct[]>(query, { categoryName })
  return products.map(transformProduct)
}

export async function getAllCategories(): Promise<SanityCategory[]> {
  const query = `*[_type == "category"] | order(order asc, name asc) {
    _id,
    name,
    slug,
    description,
    order
  }`
  
  return client.fetch<SanityCategory[]>(query)
}

export async function getAllProductSlugs(): Promise<string[]> {
  const query = `*[_type == "product"].slug.current`
  return client.fetch<string[]>(query)
}
