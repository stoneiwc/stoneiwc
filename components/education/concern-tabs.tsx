"use client"

import { useId, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ConcernTabsProps {
  categories: string[]
  // One server-rendered panel per category, in the same order.
  panels: ReactNode[]
}

// Category switcher for the health concerns page. Every panel is rendered on
// the server and present in the HTML; this only toggles which is visible.
export function ConcernTabs({ categories, panels }: ConcernTabsProps) {
  const [active, setActive] = useState(0)
  const id = useId()

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
      <aside className="lg:w-72 lg:shrink-0">
        <p className="mb-5 font-body text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Categories
        </p>
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Health concern categories"
          className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1"
        >
          {categories.map((category, i) => (
            <button
              key={category}
              id={`${id}-tab-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls={`${id}-panel-${i}`}
              onClick={() => setActive(i)}
              className={cn(
                "w-full rounded-sm px-4 py-3 text-left font-body text-sm transition-all",
                active === i
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <span
                className={cn(
                  "mr-2 font-sans text-xs font-semibold",
                  active === i ? "text-primary-foreground/70" : "text-primary/40"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {category}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1">
        {panels.map((panel, i) => (
          <div
            key={categories[i]}
            id={`${id}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${i}`}
            hidden={active !== i}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}
