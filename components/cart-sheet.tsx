"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { BOOKING_URL } from "@/lib/navigation"

export function CartSheet() {
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-lg [&>button]:top-7"
      >
        <SheetHeader className="border-b border-border px-6 py-5 pr-14">
          <SheetTitle className="flex items-center gap-3 font-sans text-xl font-semibold tracking-wide">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            <span className="ml-auto text-sm font-body font-normal text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-sans text-lg font-semibold text-foreground">
              Your cart is empty
            </p>
            <p className="text-center text-sm font-body text-muted-foreground">
              Explore our curated wellness products to begin your journey.
            </p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-sm border border-border bg-card p-3 transition-colors"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-secondary"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-sans text-sm font-semibold text-foreground transition-colors hover:text-primary leading-snug line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs font-body text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex items-center rounded-sm border border-input">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center border-x border-input text-xs font-body font-bold">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-sm font-sans font-semibold text-foreground">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="border-t border-border p-6">
              <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Left side - Price summary */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {totalPrice >= 75 ? (
                        <span className="font-semibold text-primary">Free</span>
                      ) : (
                        "At checkout"
                      )}
                    </span>
                  </div>
                  {totalPrice < 75 && (
                    <div className="rounded-sm bg-secondary px-3 py-2 mt-2">
                      <p className="text-xs font-body text-muted-foreground">
                        Add ${(75 - totalPrice).toFixed(2)} more for free shipping
                      </p>
                    </div>
                  )}
                  <div className="h-px bg-border my-3" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-sans text-lg font-bold text-foreground">
                      Total
                    </span>
                    <span className="font-sans text-lg font-bold text-foreground">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex flex-col gap-3 lg:min-w-[280px]">
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-body font-bold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    onClick={clearCart}
                    className="w-full rounded-md border border-border px-6 py-3 text-sm font-body font-semibold tracking-wide text-muted-foreground transition-all hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
