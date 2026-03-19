"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SortOption = "featured" | "price-asc" | "price-desc"

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  resultCount: number
  categories: string[]
}

export function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  resultCount,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-sm border border-input bg-background pl-10 pr-10 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort by:</span>
          </div>
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[160px] h-11 rounded-sm font-body text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-body font-bold tracking-wider transition-all",
              category === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-sm font-body text-muted-foreground">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </span>
      </div>
    </div>
  )
}
