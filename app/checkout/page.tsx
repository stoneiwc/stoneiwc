import { CheckoutView } from "@/components/checkout/checkout-view"
import { getShippingMethods } from "@/lib/sanity.queries"

// Shipping methods are read live on the server (the same query checkout
// pricing uses), so the form renders with them instead of fetching an API
// after it loads.
export default async function CheckoutPage() {
	const shippingMethods = await getShippingMethods()
	return <CheckoutView shippingMethods={shippingMethods} />
}
