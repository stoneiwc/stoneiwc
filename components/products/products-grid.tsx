"use client"

import { useState, useMemo } from "react"
import { products, type Category } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"
import {
  ProductFilters,
  type SortOption,
} from "@/components/products/product-filters"

export function ProductsGrid() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category>("All")
  const [sort, setSort] = useState<SortOption>("featured")

  const filtered = useMemo(() => {
    let result = [...products]

    if (category !== "All") {
      result = result.filter((p) => p.category === category)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return result
  }, [search, category, sort])

  return (
    <div className="flex flex-col gap-10">
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-sans text-2xl font-semibold text-foreground">
            No products found
          </p>
          <p className="mt-2 text-sm font-body text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setCategory("All")
            }}
            className="mt-6 rounded-sm border border-primary px-6 py-2.5 text-sm font-body font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
