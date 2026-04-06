"use client"

import type { CartItem, AppliedCoupon } from "@/lib/cart-context"

interface CheckoutDetailsSectionProps {
  items: CartItem[]
  subtotal: number
  appliedCoupon: AppliedCoupon | null
  discountAmount: number
  shippingMethod: string
  shippingCost: number
  totalPrice: number
}

export default function CheckoutDetailsSection({
  items,
  subtotal,
  appliedCoupon,
  discountAmount,
  shippingMethod,
  shippingCost,
  totalPrice,
}: CheckoutDetailsSectionProps) {
  return (
    <aside className="h-fit rounded-sm border border-border bg-card p-6">
      <h3 className="font-sans text-xl font-semibold tracking-wide text-foreground">
        Order Summary
      </h3>

      <div className="mt-6 space-y-3 border-b border-border pb-5">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-body font-semibold text-foreground truncate">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Qty: {quantity}
              </p>
            </div>
            <p className="shrink-0 font-body font-semibold text-foreground">
              ${(product.price * quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 text-sm font-body">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Items</span>
          <span className="text-foreground">{items.length}</span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Coupon ({appliedCoupon.code})</span>
            <span className="font-semibold text-primary">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {shippingMethod && (
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex flex-col">
              <span>Shipping</span>
              <span className="text-xs text-muted-foreground">{shippingMethod}</span>
            </div>
            <span className="font-semibold text-foreground">
              {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "FREE"}
            </span>
          </div>
        )}

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="font-sans text-lg font-semibold text-foreground">Total</span>
          <span className="font-sans text-lg font-semibold text-foreground">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </aside>
  )
}
