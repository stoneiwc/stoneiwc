"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"
import { GIFT_CARD_SLUG } from "@/components/products/gift-card-purchase"

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQuantity } = useCart()
  const isGiftCard = product.slug === GIFT_CARD_SLUG
  const cartItem = items.find(item => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0
  const isOnSale = Boolean(product.isDiscount && product.originalPrice && product.originalPrice > product.price)
  const isOutOfStock = !product.inStock

  return (
    <div className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isOutOfStock ? (
          <Badge className="absolute left-3 top-3 rounded-sm bg-muted text-muted-foreground font-body text-xs">
            Out of Stock
          </Badge>
        ) : isOnSale ? (
          <Badge className="absolute left-3 top-3 rounded-sm bg-destructive text-destructive-foreground font-body text-xs">
            Sale
          </Badge>
        ) : product.tags.includes("bestseller") ? (
          <Badge className="absolute left-3 top-3 rounded-sm bg-primary text-primary-foreground font-body text-xs">
            Bestseller
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {product.category}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 font-sans text-lg font-semibold text-foreground transition-colors group-hover:text-primary leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body line-clamp-2">
          {product.shortDescription}
        </p>


        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-xl font-semibold text-foreground">
              {isGiftCard ? 'From $25' : `$${product.price}`}
            </span>
            {!isGiftCard && isOnSale && (
              <span className="text-sm font-body text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {isGiftCard ? (
            <Link
              href={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Buy
            </Link>
          ) : isOutOfStock ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-sm bg-muted px-4 py-2 text-xs font-body font-bold tracking-wider text-muted-foreground"
              aria-label={`${product.name} is out of stock`}
            >
              Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center rounded-sm border border-input bg-background">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  updateQuantity(product.id, quantity - 1)
                }}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-9 w-10 items-center justify-center border-x border-input text-xs font-body font-bold">
                {quantity}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  updateQuantity(product.id, quantity + 1)
                }}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault()
                addItem(product)
              }}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
