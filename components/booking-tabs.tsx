"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BOOKING_CATEGORIES } from "@/lib/cal-api"

export function BookingTabs() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") ?? "all"

  const tabs = [
    { value: "all", label: "All Services" },
    ...BOOKING_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === activeCategory
        const href =
          tab.value === "all" ? "/book" : `/book?category=${tab.value}`

        return (
          <Link
            key={tab.value}
            href={href}
            className={`inline-flex items-center rounded-sm px-5 py-2.5 text-sm font-body font-bold tracking-wider transition-all ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
