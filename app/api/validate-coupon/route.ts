import { NextResponse, type NextRequest } from "next/server"
import { getCoupons } from "@/lib/sanity.queries"

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()

  if (!code) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 })
  }

  const coupons = await getCoupons()
  const coupon = coupons.find((c) => c.code === code.trim().toUpperCase())

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
  })
}
