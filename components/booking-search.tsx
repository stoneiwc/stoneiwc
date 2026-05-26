"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight } from "lucide-react"
import type { CalEventType } from "@/lib/cal-api"

type Props = {
  events: CalEventType[]
}

export function BookingSearch({ events }: Props) {
  const [query, setQuery] = useState("")
  const router = useRouter()

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

  function clear() {
    setQuery("")
    router.push("/book")
  }

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-sm border border-border bg-background py-2.5 pl-9 pr-8 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-sm bg-primary px-3 py-2.5 transition-colors hover:bg-primary/90 disabled:opacity-40"
          disabled={!trimmed}
        >
          <ArrowRight className="h-3.5 w-3.5 text-primary-foreground" />
        </button>
      </form>

      {/* Inline results dropdown */}
      {trimmed && (
        <div className="mt-2 overflow-hidden rounded-sm border border-border bg-card">
          {results.length > 0 ? (
            <div className="divide-y divide-border/50">
              {results.map((event) => (
                <Link
                  key={event.id}
                  href={`/book/${event.slug}`}
                  className="group flex items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="line-clamp-1 text-sm font-body text-foreground">
                    {event.title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-center text-sm font-body text-muted-foreground">
              No results found for &ldquo;{trimmed}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  )
}
