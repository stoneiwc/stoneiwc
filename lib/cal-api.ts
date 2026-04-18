export type CalEventType = {
  id: number
  title: string
  slug: string
  description: string | null
  lengthInMinutes: number
  price: number
  currency: string
}

// Ordered head-to-toe for the sidebar filter
export const BOOKING_CATEGORIES = [
  // Head
  { value: "hair",                        label: "Hair",                                 slugPrefix: "hair-" },
  { value: "face",                        label: "Face",                                 slugPrefix: "face-" },
  { value: "lash-extension",              label: "Lash Extension",                       slugPrefix: "lash-extension-" },
  { value: "permanent-makeup",            label: "Permanent Makeup",                     slugPrefix: "permanent-makeup-" },
  { value: "semi-permanent-makeup",       label: "Semi-Permanent Makeup",                slugPrefix: "semi-permanent-makeup-" },
  { value: "skin-imperfection",           label: "Skin Imperfection",                    slugPrefix: "skin-imperfection-" },
  // Upper Body
  { value: "acupuncture",                 label: "Acupuncture",                          slugPrefix: "acupuncture-" },
  { value: "cupping",                     label: "Cupping",                              slugPrefix: "cupping-" },
  { value: "massage-body",                label: "Massage & Body Treatments",            slugPrefix: "massage-body-" },
  { value: "chiropractic",                label: "Chiropractic",                         slugPrefix: "chiropractic-" },
  // Mid / Lower Body
  { value: "body-transformation",         label: "Body Transformation",                  slugPrefix: "body-transformation-" },
  { value: "lipo-treatments",             label: "Lipo Treatments",                      slugPrefix: "lipo-treatments-" },
  { value: "waxing",                      label: "Waxing",                               slugPrefix: "waxing-" },
  { value: "chronic-venous-insufficiency",label: "Chronic Venous Insufficiency",         slugPrefix: "chronic-venous-insufficiency-" },
  // Extremities
  { value: "nail",                        label: "Nail",                                 slugPrefix: "nail-" },
  // General / Virtual
  { value: "wellness",                    label: "Wellness",                             slugPrefix: "wellness-" },
  { value: "consultation",                label: "Consultation",                         slugPrefix: "consultation-" },
  { value: "virtual-consultation",        label: "Virtual Consultation",                 slugPrefix: "virtual-consultation-" },
  { value: "concierge",                   label: "Concierge",                            slugPrefix: "concierge-" },
] as const

export type BookingCategory = typeof BOOKING_CATEGORIES[number]["value"]

export type CategoryOption = typeof BOOKING_CATEGORIES[number]

export function getCategoryFromSlug(slug: string): BookingCategory | null {
  const match = BOOKING_CATEGORIES.find(
    (cat) => slug === cat.value || slug.startsWith(cat.slugPrefix)
  )
  return match ? (match.value as BookingCategory) : null
}

export async function getEventTypes(username: string): Promise<CalEventType[]> {
  try {
    const res = await fetch(
      `https://api.cal.com/v2/event-types?username=${username}`,
      {
        headers: { "cal-api-version": "2024-06-14" },
        cache: "no-store",
      }
    )

    if (!res.ok) return []

    const data = await res.json()
    return Array.isArray(data?.data) ? data.data : []
  } catch {
    return []
  }
}

export function filterEventsByCategory(
  events: CalEventType[],
  category: BookingCategory | "all"
): CalEventType[] {
  if (category === "all") return events

  const cat = BOOKING_CATEGORIES.find((c) => c.value === category)
  if (!cat) return events

  return events.filter(
    (e) => e.slug === cat.value || e.slug.startsWith(cat.slugPrefix)
  )
}
