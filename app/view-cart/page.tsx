"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Tag, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/lib/cart-context"

export default function ViewCartPage() {
	const {
		items,
		removeItem,
		updateQuantity,
		clearCart,
		totalItems,
		subtotal,
		appliedCoupon,
		applyCoupon,
		removeCoupon,
		discountAmount,
		totalPrice,
	} = useCart()

	const [couponInput, setCouponInput] = useState("")
	const [couponMessage, setCouponMessage] = useState<string | null>(null)
	const [couponError, setCouponError] = useState<string | null>(null)
	const [couponLoading, setCouponLoading] = useState(false)

	useEffect(() => {
		if (!appliedCoupon) {
			setCouponMessage(null)
			return
		}
		setCouponMessage(`${appliedCoupon.code} applied. Cart total: $${totalPrice.toFixed(2)}`)
	}, [appliedCoupon, totalPrice])

	const handleApplyCoupon = async () => {
		const code = couponInput.trim()
		if (!code) {
			setCouponError("Enter a coupon code.")
			setCouponMessage(null)
			return
		}

		setCouponLoading(true)
		setCouponError(null)

		const res = await fetch("/api/validate-coupon", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code, subtotal }),
		})
		const data = await res.json()

		setCouponLoading(false)

		if (!res.ok) {
			setCouponError(data.error)
			setCouponMessage(null)
			return
		}

		applyCoupon(data)
		setCouponError(null)
		setCouponInput("")
	}

	return (
		<>
			<PageHeader
				title="View Cart"
				subtitle="Review your items, apply a coupon, and continue when you are ready to checkout."
			/>

			<section className="py-14 lg:py-20">
				<div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.6fr_1fr]">
					<div>
						<div className="mb-6 flex items-center justify-between">
							<h2 className="font-sans text-2xl font-semibold tracking-wide text-foreground">
								Cart Items ({totalItems})
							</h2>
							{items.length > 0 && (
								<button
									onClick={clearCart}
									className="text-sm font-body font-semibold text-muted-foreground transition-colors hover:text-destructive"
								>
									Clear Cart
								</button>
							)}
						</div>

						{items.length === 0 ? (
							<div className="rounded-sm border border-border bg-card px-8 py-12 text-center">
								<p className="font-sans text-xl font-semibold text-foreground">
									Your cart is empty
								</p>
								<p className="mt-3 text-sm font-body text-muted-foreground">
									Add products to your cart to continue.
								</p>
								<Link
									href="/products"
									className="mt-6 inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
								>
									Browse Products
								</Link>
							</div>
						) : (
							<div className="flex flex-col gap-4">
								{items.map(({ product, quantity }) => (
									<div
										key={product.id}
										className="grid grid-cols-[6.5rem_1fr] gap-4 rounded-sm border border-border bg-card p-4 sm:grid-cols-[8.5rem_1fr]"
									>
										<Link
											href={`/products/${product.slug}`}
											className="relative block h-[6.5rem] w-[6.5rem] overflow-hidden rounded-sm bg-secondary sm:h-[8.5rem] sm:w-[8.5rem]"
										>
											<Image
												src={product.image}
												alt={product.name}
												fill
												sizes="(max-width: 640px) 104px, 136px"
												className="object-cover"
											/>
										</Link>

										<div className="flex min-w-0 flex-col justify-between gap-4">
											<div className="flex items-start justify-between gap-4">
												<div className="min-w-0">
													<Link
														href={`/products/${product.slug}`}
														className="line-clamp-2 font-sans text-lg font-semibold leading-tight text-foreground transition-colors hover:text-primary"
													>
														{product.name}
													</Link>
													<p className="mt-1 text-sm font-body text-muted-foreground">
														{product.category}
													</p>
												</div>
												<button
													onClick={() => removeItem(product.id)}
													className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
													aria-label={`Remove ${product.name}`}
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>

											<div className="flex items-end justify-between">
												<div className="flex items-center rounded-sm border border-input">
													<button
														onClick={() => updateQuantity(product.id, quantity - 1)}
														className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
														aria-label={`Decrease quantity of ${product.name}`}
													>
														<Minus className="h-3 w-3" />
													</button>
													<span className="flex h-9 min-w-10 items-center justify-center border-x border-input px-2 text-sm font-body font-bold">
														{quantity}
													</span>
													<button
														onClick={() => updateQuantity(product.id, quantity + 1)}
														className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
														aria-label={`Increase quantity of ${product.name}`}
													>
														<Plus className="h-3 w-3" />
													</button>
												</div>

												<p className="font-sans text-lg font-semibold text-foreground">
													${(product.price * quantity).toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<aside className="h-fit rounded-sm border border-border bg-card p-6">
						<h3 className="font-sans text-xl font-semibold tracking-wide text-foreground">
							Order Summary
						</h3>

						<div className="mt-6 space-y-3 text-sm font-body">
							<div className="flex items-center justify-between text-muted-foreground">
								<span>Subtotal</span>
								<span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
							</div>
							{appliedCoupon && (
								<div className="flex items-center justify-between text-muted-foreground">
									<span>Discount ({appliedCoupon.code})</span>
									<span className="font-semibold text-primary">-${discountAmount.toFixed(2)}</span>
								</div>
							)}
							<div className="h-px bg-border" />
							<div className="flex items-center justify-between pt-1">
								<span className="font-sans text-lg font-semibold text-foreground">Total</span>
								<span className="font-sans text-lg font-semibold text-foreground">${totalPrice.toFixed(2)}</span>
							</div>
						</div>

						<div className="mt-8 rounded-sm border border-border bg-background p-4">
							<label
								htmlFor="coupon"
								className="mb-2 flex items-center gap-2 text-xs font-body font-bold uppercase tracking-[0.18em] text-muted-foreground"
							>
								<Tag className="h-3.5 w-3.5" />
								Coupon Code
							</label>
							<div className="flex gap-2">
								<input
									id="coupon"
									value={couponInput}
									onChange={(e) => setCouponInput(e.target.value)}
									placeholder="Enter code"
									className="w-full rounded-sm border border-input bg-card px-3 py-2 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
								/>
								<button
									onClick={handleApplyCoupon}
									disabled={couponLoading}
									className="rounded-sm bg-primary px-4 py-2 text-sm font-body font-bold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
								>
									{couponLoading ? "..." : "Apply"}
								</button>
							</div>

							{appliedCoupon && (
								<div className="mt-3 flex items-center justify-between rounded-sm border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-body">
									<p className="text-foreground">
										<span className="font-bold">{appliedCoupon.code}</span> active
									</p>
									<button
										onClick={removeCoupon}
										className="font-semibold text-primary transition-colors hover:text-primary/80"
									>
										Remove
									</button>
								</div>
							)}

							{couponError && (
								<p className="mt-2 text-xs font-body text-destructive">{couponError}</p>
							)}
							{couponMessage && !couponError && (
								<p className="mt-2 text-xs font-body text-primary">{couponMessage}</p>
							)}

						</div>

						<Link
							href={items.length === 0 ? "/view-cart" : "/checkout"}
							aria-disabled={items.length === 0}
							className={`mt-8 inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-body font-bold tracking-wider transition-colors ${
								items.length === 0
									? "cursor-not-allowed bg-muted text-muted-foreground"
									: "bg-primary text-primary-foreground hover:bg-primary/90"
							}`}
							onClick={(event) => {
								if (items.length === 0) {
									event.preventDefault()
								}
							}}
						>
							Go To Checkout
						</Link>
					</aside>
				</div>
			</section>
		</>
	)
}
