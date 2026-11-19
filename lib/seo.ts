import type { Metadata } from 'next'

export const SITE_NAME = 'Stone International Wellness Center'

// The root layout's title template appends this to page titles.
const TITLE_SUFFIX = ' | Stone IWC'

// Metadata for a page at `path`: its own canonical URL and Open Graph/Twitter
// tags. Each page must set these itself. Next merges metadata one key deep,
// so a page that doesn't set `alternates` or `openGraph` inherits the root
// layout's, which would point every page's canonical and og:url at the
// homepage and give every share the homepage title.
//
// `path` is relative; the root layout's metadataBase makes it absolute.
export function pageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string
  description: string
  path: string
  images?: Array<{ url: string; alt?: string }>
}): Metadata {
  const socialTitle = `${title}${TITLE_SUFFIX}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      title: socialTitle,
      description,
      url: path,
      ...(images && { images }),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      ...(images && { images: images.map((image) => image.url) }),
    },
  }
}
