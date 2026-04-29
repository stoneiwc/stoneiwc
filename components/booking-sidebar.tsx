"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { BOOKING_CATEGORIES } from "@/lib/cal-api"

const SECTIONS = [
  {
    label: "Head",
    values: ["hair", "face", "lash-extension", "micropigmentation", "skin-imperfection"],
  },
  {
    label: "Upper Body",
    values: ["acupuncture", "cupping", "massage-body", "chiropractic"],
  },
  {
    label: "Mid / Lower Body",
    values: ["body-transformation", "lipo-treatments", "waxing", "chronic-venous-insufficiency"],
  },
  {
    label: "Extremities",
    values: ["nail"],
  },
  {
    label: "General",
    values: ["wellness", "consultation", "concierge"],
  },
]

export function BookingSidebar() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") ?? "all"

  const categoryMap = Object.fromEntries(
    BOOKING_CATEGORIES.map((c) => [c.value, c.label])
  )

  // Open the section that contains the active category by default
  const defaultOpen = SECTIONS.reduce<Record<string, boolean>>((acc, s) => {
    acc[s.label] = s.values.includes(activeCategory)
    return acc
  }, {})

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(defaultOpen)

  function toggle(label: string) {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <nav className="space-y-2">
      {/* All Services */}
      <Link
        href="/book"
        className={`flex w-full items-center rounded-sm px-3 py-2.5 text-sm font-body font-bold tracking-wider transition-all ${
          activeCategory === "all"
            ? "bg-primary text-primary-foreground"
            : "border border-border text-foreground hover:border-primary hover:text-primary"
        }`}
      >
        All Services
      </Link>

      {/* Accordion sections */}
      <div className="space-y-1 pt-2">
        {SECTIONS.map((section) => {
          const isOpen = !!openSections[section.label]
          const hasActive = section.values.includes(activeCategory)

          return (
            <div key={section.label} className="overflow-hidden rounded-sm border border-border">
              {/* Section header / toggle */}
              <button
                type="button"
                onClick={() => toggle(section.label)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  hasActive
                    ? "bg-primary/5 text-primary"
                    : "bg-muted/40 text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xs font-body font-bold uppercase tracking-[0.18em]">
                  {section.label}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  } ${hasActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </button>

              {/* Collapsible items */}
              <div
                className={`transition-all duration-200 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="space-y-0.5 border-t border-border/50 p-1.5">
                  {section.values.map((val) => {
                    const label = categoryMap[val]
                    if (!label) return null
                    const isActive = activeCategory === val
                    return (
                      <Link
                        key={val}
                        href={`/book?category=${val}`}
                        className={`flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-body transition-all ${
                          isActive
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                            isActive ? "bg-primary" : "bg-border"
                          }`}
                        />
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

/** Mobile: horizontal scrollable chip strip */
export function BookingTabsMobile() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") ?? "all"

  const items = [
    { value: "all", label: "All Services" },
    ...BOOKING_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item) => {
        const isActive = item.value === activeCategory
        const href = item.value === "all" ? "/book" : `/book?category=${item.value}`
        return (
          <Link
            key={item.value}
            href={href}
            className={`inline-flex shrink-0 items-center rounded-sm px-4 py-2 text-xs font-body font-bold tracking-wider transition-all ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
