"use client"

import Link from "next/link"
import { useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/lib/cart-context"
import SelfCheckoutSection from "@/components/checkout/SelfCheckoutSection"
import CheckoutDetailsSection from "@/components/checkout/CheckoutDetailsSection"

export interface AppliedGiftCard {
  code: string
  amount: number
  promotionCodeId: string
}

export default function CheckoutPage() {
	const {
		items,
		subtotal,
		appliedCoupon,
		discountAmount,
		totalPrice,
		totalItems,
	} = useCart()
	const [shippingMethod, setShippingMethod] = useState("")
	const [shippingCost, setShippingCost] = useState(0)
	const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null)

	const handleShippingMethodChange = useCallback((method: string, cost: number) => {
		setShippingMethod(method)
		setShippingCost(cost)
	}, [])

	const giftCardDiscount = appliedGiftCard ? Math.min(appliedGiftCard.amount, subtotal - discountAmount + shippingCost) : 0
	const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost - giftCardDiscount)

	if (items.length === 0) {
		return (
			<>
				<PageHeader
					title="Checkout"
					subtitle="Your cart is currently empty. Add items to continue."
				/>
				<section className="py-16">
					<div className="mx-auto max-w-3xl px-6 text-center">
						<p className="font-body text-muted-foreground">
							No items are available for checkout yet.
						</p>
						<Link
							href="/products"
							className="mt-6 inline-flex rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Browse Products
						</Link>
					</div>
				</section>
			</>
		)
	}

	return (
		<>
			<PageHeader
				title="Checkout"
				subtitle="Enter your contact details and review your order before completing payment."
			/>

			<section className="py-14 lg:py-20">
				<div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.2fr_1fr]">
					{/* Left Column: Checkout Form */}
					<SelfCheckoutSection
						items={items}
						subtotal={subtotal}
						appliedCoupon={appliedCoupon}
						discountAmount={discountAmount}
						totalPrice={finalTotal}
						onShippingMethodChange={handleShippingMethodChange}
						shippingCost={shippingCost}
						appliedGiftCard={appliedGiftCard}
						onGiftCardChange={setAppliedGiftCard}
					/>

					{/* Right Column: Order Summary */}
					<CheckoutDetailsSection
						items={items}
						subtotal={subtotal}
						appliedCoupon={appliedCoupon}
						discountAmount={discountAmount}
						shippingMethod={shippingMethod}
						shippingCost={shippingCost}
						totalPrice={finalTotal}
						appliedGiftCard={appliedGiftCard}
						giftCardDiscount={giftCardDiscount}
					/>
				</div>
			</section>
		</>
	)
}
