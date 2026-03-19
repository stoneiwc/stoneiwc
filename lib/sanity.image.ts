import imageUrlBuilder from '@sanity/image-url'
import { client } from './sanity.client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

export function getImageUrl(source: any, width?: number, height?: number): string {
  let url = urlFor(source).auto('format').fit('max')
  
  if (width) {
    url = url.width(width)
  }
  
  if (height) {
    url = url.height(height)
  }
  
  return url.url()
}
