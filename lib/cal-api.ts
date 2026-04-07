export type CalEventType = {
  id: number
  title: string
  slug: string
  description: string | null
  length: number // minutes
  price: number
  currency: string
}

export type BookingCategory =
  | "professional-treatment"
  | "concierge"
  | "virtual-consultation"

export type CategoryOption = {
  value: BookingCategory | "all"
  label: string
  slugPrefix: string
}

export const BOOKING_CATEGORIES: CategoryOption[] = [
  {
    value: "professional-treatment",
    label: "Professional Treatment",
    slugPrefix: "professional-treatment-",
  },
  {
    value: "concierge",
    label: "Concierge Services",
    slugPrefix: "concierge-",
  },
  {
    value: "virtual-consultation",
    label: "Virtual Consultations",
    slugPrefix: "virtual-consultation-",
  },
]

export function getCategoryFromSlug(slug: string): BookingCategory | null {
  const match = BOOKING_CATEGORIES.find((cat) =>
    slug.startsWith(cat.slugPrefix)
  )
  return match ? (match.value as BookingCategory) : null
}

export async function getEventTypes(username: string): Promise<CalEventType[]> {
  try {
    const res = await fetch(
      `https://api.cal.com/v2/event-types?username=${username}`,
      {
        headers: { "cal-api-version": "2024-06-14" },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data?.data?.eventTypeGroups?.[0]?.eventTypes ?? []
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

  return events.filter((e) => e.slug.startsWith(cat.slugPrefix))
}
