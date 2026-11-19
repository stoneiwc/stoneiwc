// Cache tags for page content.
//
// Each Sanity document type that pages display is also the cache tag for the
// queries that read it. When Sanity publishes a document, its webhook POSTs
// { _type } to /api/revalidate, which revalidates that tag. Keeping the list
// here lets TypeScript check that every query's tags are ones the webhook
// knows about.
export const CONTENT_TYPES = [
  'product',
  'category',
  'heroSlide',
  'homePageImages',
  'aboutPageImages',
  'servicesPageImages',
  'conciergeImages',
  'virtualConsultationsImages',
  'educationPageImages',
  'featuredPageImages',
  'certificationImages',
  'licenseeProgramImages',
  'cuppingImages',
  'pressItem',
  'mediaItem',
  'qcShowFlyer',
  'qcShowEpisode',
  'ourStoryImages',
  'teamMember',
  'partner',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as readonly string[]).includes(value)
}

// How long cached page content may be served before Next re-reads Sanity.
// Matches the pages' `export const revalidate = 60`. Once the Sanity webhook
// is wired up (project-documentation/sanity-cms.md), raise both to 3600 and
// let publishes refresh content on demand.
export const CONTENT_REVALIDATE_SECONDS = 60

// Cal.com event types for the booking pages. Not a Sanity type: POST
// { "_type": "calEvents" } to /api/revalidate (with the webhook secret) to
// refresh booking pages straight after editing services in Cal.com.
export const CAL_EVENTS_TAG = 'cal-events'
export const CAL_EVENTS_REVALIDATE_TYPE = 'calEvents'
export const CAL_EVENTS_REVALIDATE_SECONDS = 300
