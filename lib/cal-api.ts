import { CAL_EVENTS_REVALIDATE_SECONDS, CAL_EVENTS_TAG } from "./sanity-tags"

export type CalEventType = {
  id: number
  title: string
  slug: string
  description: string | null
  lengthInMinutes: number
  price: number
  currency: string
}

export const BOOKING_CATEGORIES = [
  // Head
  { value: "hair",                         label: "Hair",                               slugPrefix: "hair-" },
  { value: "face",                         label: "Face",                               slugPrefix: "face-" },
  { value: "lash-extension",               label: "Lash Extension",                     slugPrefix: "lash-extension-" },
  { value: "micropigmentation",            label: "Micropigmentation Semi-Permanent",   slugPrefix: "micropigmentation-" },
  { value: "skin-imperfection",            label: "Skin Imperfection",                  slugPrefix: "skin-imperfection-" },
  // Upper Body
  { value: "acupuncture",                  label: "Acupuncture",                        slugPrefix: "acupuncture-" },
  { value: "cupping",                      label: "Cupping",                            slugPrefix: "cupping-" },
  { value: "massage-body",                 label: "Massage & Body Treatments",          slugPrefix: "massage-body-" },
  { value: "chiropractic",                 label: "Chiropractic",                       slugPrefix: "chiropractic-" },
  // Mid / Lower Body
  { value: "body-transformation",          label: "Body Transformation",                slugPrefix: "body-transformation-" },
  { value: "lipo-treatments",              label: "Lipo Treatments",                    slugPrefix: "lipo-treatments-" },
  { value: "waxing",                       label: "Waxing",                             slugPrefix: "waxing-" },
  { value: "chronic-venous-insufficiency", label: "Chronic Venous Insufficiency",       slugPrefix: "chronic-venous-insufficiency-" },
  // Extremities
  { value: "nail",                         label: "Nail",                               slugPrefix: "nail-" },
  // General
  { value: "wellness",                     label: "Wellness",                           slugPrefix: "wellness-" },
  { value: "consultation",                 label: "Consultation",                       slugPrefix: "consultation-" },
  { value: "concierge",                    label: "Concierge",                          slugPrefix: "concierge-" },
] as const

export type BookingCategory = typeof BOOKING_CATEGORIES[number]["value"]
export type CategoryOption = typeof BOOKING_CATEGORIES[number]

export function getCategoryFromSlug(slug: string): BookingCategory | null {
  const match = BOOKING_CATEGORIES.find((cat) => slug.startsWith(cat.slugPrefix))
  return match ? (match.value as BookingCategory) : null
}

// The bookable services, cached for CAL_EVENTS_REVALIDATE_SECONDS so the
// booking pages don't call Cal.com on every request.
//
// Throws when Cal.com fails rather than returning an empty list: an empty
// list would be rendered as "no services" or a 404, while an error during a
// background refresh leaves the last good page in place. (Next only caches
// 200 responses, so a failure never overwrites good data.)
export async function getEventTypes(username: string): Promise<CalEventType[]> {
  const res = await fetch(
    `https://api.cal.com/v2/event-types?username=${encodeURIComponent(username)}`,
    {
      headers: { "cal-api-version": "2024-06-14" },
      next: { revalidate: CAL_EVENTS_REVALIDATE_SECONDS, tags: [CAL_EVENTS_TAG] },
    }
  )
  if (!res.ok) {
    throw new Error(`Cal.com event types request failed: ${res.status}`)
  }

  const data = await res.json()
  if (!Array.isArray(data?.data)) {
    throw new Error("Cal.com event types response had no data array")
  }
  return data.data
}

export function filterEventsByCategory(
  events: CalEventType[],
  category: BookingCategory | "all"
): CalEventType[] {
  if (category === "all") return events

  const cat = BOOKING_CATEGORIES.find((c) => c.value === category)
  if (!cat) return events

  return events.filter((e) => e.slug.startsWith(cat.slugPrefix))
}

export function filterEventsBySearch(
  events: CalEventType[],
  query: string
): CalEventType[] {
  const q = query.trim().toLowerCase()
  if (!q) return events
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
  )
}
