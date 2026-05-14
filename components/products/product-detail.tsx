"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"
import { GiftCardPurchase, GIFT_CARD_SLUG } from "@/components/products/gift-card-purchase"

export function ProductDetail({ product }: { product: Product }) {
  const isGiftCard = product.slug === GIFT_CARD_SLUG
  const isOnSale = Boolean(product.isDiscount && product.originalPrice && product.originalPrice > product.price)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm font-body font-bold tracking-wider text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {isOnSale && product.originalPrice && (
            <Badge className="absolute left-4 top-4 rounded-sm bg-destructive text-destructive-foreground font-body">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              % Off
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-body font-bold uppercase tracking-[0.3em] text-primary">
            {product.category}
          </p>

          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
            {product.name}
          </h1>


          {!isGiftCard && (
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-sans text-3xl font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {isOnSale && product.originalPrice && (
                <span className="text-lg font-body text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {isGiftCard && (
            <p className="mt-6 font-sans text-2xl font-semibold text-foreground">
              From $25
            </p>
          )}

          <div className="mt-6 h-px bg-border" />

          <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
            {product.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-sm font-body text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            {isGiftCard ? (
              <GiftCardPurchase />
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-sm border border-input">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-12 w-14 items-center justify-center border-x border-input text-sm font-body font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={added}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-80"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart &mdash; ${(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
