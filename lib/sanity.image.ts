import { createImageUrlBuilder } from '@sanity/image-url'

// Builds image URLs from the public project details alone. Client components
// (e.g. the home hero) import this, so it must not pull in the Sanity client
// and its server-side token.
const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
})

type ImageSource = Parameters<typeof builder.image>[0]

export function urlFor(source: ImageSource) {
  return builder.image(source)
}

export function getImageUrl(source: ImageSource, width?: number, height?: number): string {
  let url = urlFor(source).auto('format').fit('max')

  if (width) {
    url = url.width(width)
  }

  if (height) {
    url = url.height(height)
  }

  return url.url()
}
