import { NextResponse, type NextRequest } from "next/server"
import { getCoupons } from "@/lib/sanity.queries"
import { rateLimit } from "@/lib/rate-limit"

// Lets the cart preview a coupon. Checkout re-prices everything server-side
// (lib/pricing.ts), so this only drives what the customer sees.
export async function POST(req: NextRequest) {
  const limited = await rateLimit("couponLookup", req, "Too many attempts. Please try again later.")
  if (limited) return limited

  let body: { code?: unknown; subtotal?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
  const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0

  if (!code) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 })
  }

  const coupons = await getCoupons()
  const coupon = coupons.find((c) => c.code === code)

  if (!coupon) {
    return NextResponse.json({ error: "Coupon code is not valid." }, { status: 404 })
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return NextResponse.json(
      { error: `This coupon requires a minimum subtotal of $${coupon.minSubtotal.toFixed(2)}.` },
      { status: 400 }
    )
  }

  return NextResponse.json({
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal ?? null,
  })
}
