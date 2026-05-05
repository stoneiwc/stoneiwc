"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, ArrowRight, SlidersHorizontal, ChevronDown } from "lucide-react"
import { BOOKING_CATEGORIES, type CalEventType } from "@/lib/cal-api"

const SECTIONS = [
  { label: "Head", values: ["hair", "face", "lash-extension", "micropigmentation", "skin-imperfection"] },
  { label: "Upper Body", values: ["acupuncture", "cupping", "massage-body", "chiropractic"] },
  { label: "Mid / Lower Body", values: ["body-transformation", "lipo-treatments", "waxing", "chronic-venous-insufficiency"] },
  { label: "Extremities", values: ["nail"] },
  { label: "General", values: ["wellness", "consultation", "concierge"] },
]

const categoryMap = Object.fromEntries(BOOKING_CATEGORIES.map((c) => [c.value, c.label]))

type Props = {
  events: CalEventType[]
}

export function BookingMobileBar({ events }: Props) {
  const [query, setQuery] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get("category") ?? "all"
  const activeCategoryLabel = activeCategory !== "all" ? categoryMap[activeCategory] : null
  const trimmed = query.trim()

  const results = trimmed.length > 0
    ? events.filter((e) =>
        e.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        e.description?.toLowerCase().includes(trimmed.toLowerCase())
      )
    : []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) return
    router.push(`/book?search=${encodeURIComponent(trimmed)}`)
  }

  function clearSearch() {
    setQuery("")
    router.push("/book")
  }

  function clearCategory() {
    router.push("/book")
  }

  function selectCategory(value: string) {
    router.push(value === "all" ? "/book" : `/book?category=${value}`)
    setSheetOpen(false)
  }

  function toggleSection(label: string) {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Search + Filter button row */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-sm border border-border bg-background py-3 pl-10 pr-9 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-sm border px-4 py-3 text-sm font-body font-bold transition-colors ${
              activeCategory !== "all"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </form>

        {/* Active category badge */}
        {activeCategoryLabel && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-muted-foreground">Filtered by:</span>
            <button
              onClick={clearCategory}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-body font-bold text-primary"
            >
              {activeCategoryLabel}
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Typeahead results */}
        {trimmed && (
          <div className="overflow-hidden rounded-sm border border-border bg-card">
            {results.length > 0 ? (
              <div className="divide-y divide-border/50">
                {results.map((event) => (
                  <Link
                    key={event.id}
                    href={`/book/${event.slug}`}
                    className="group flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="line-clamp-1 text-sm font-body text-foreground">
                      {event.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-center text-sm font-body text-muted-foreground">
                No results found for &ldquo;{trimmed}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSheetOpen(false)}
          />

          {/* Sheet panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background shadow-xl">
            {/* Drag handle */}
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <h2 className="font-sans text-lg font-semibold text-foreground">
                Filter by Category
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable category list */}
            <div className="max-h-[65vh] space-y-2 overflow-y-auto p-4">
              <button
                onClick={() => selectCategory("all")}
                className={`flex w-full items-center rounded-sm px-4 py-3 text-sm font-body font-bold tracking-wider transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                All Services
              </button>

              <div className="space-y-1 pt-1">
                {SECTIONS.map((section) => {
                  const isOpen = !!openSections[section.label]
                  const hasActive = section.values.includes(activeCategory)

                  return (
                    <div key={section.label} className="overflow-hidden rounded-sm border border-border">
                      <button
                        onClick={() => toggleSection(section.label)}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                          hasActive ? "bg-primary/5 text-primary" : "bg-muted/40 text-foreground"
                        }`}
                      >
                        <span className="text-xs font-body font-bold uppercase tracking-[0.18em]">
                          {section.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${hasActive ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </button>

                      <div
                        className={`transition-all duration-200 ease-in-out ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <div className="space-y-0.5 border-t border-border/50 p-2">
                          {section.values.map((val) => {
                            const label = categoryMap[val]
                            if (!label) return null
                            const isActive = activeCategory === val
                            return (
                              <button
                                key={val}
                                onClick={() => selectCategory(val)}
                                className={`flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm font-body transition-all ${
                                  isActive
                                    ? "bg-primary/10 font-semibold text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    isActive ? "bg-primary" : "bg-border"
                                  }`}
                                />
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
