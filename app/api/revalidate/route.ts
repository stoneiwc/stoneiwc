import { createHash, timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

// Constant-time comparison. Hashing first gives both sides the same length,
// which timingSafeEqual requires.
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const digest = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(digest(provided), digest(expected))
}

// Map Sanity _type → cache tag(s) to revalidate
const TYPE_TAG_MAP: Record<string, string[]> = {
  product:                       ["product"],
  category:                      ["category"],
  heroSlide:                     ["heroSlide"],
  homePageImages:                ["homePageImages"],
  servicesPageImages:            ["servicesPageImages"],
  conciergeImages:               ["conciergeImages"],
  virtualConsultationsImages:    ["virtualConsultationsImages"],
  certificationImages:           ["certificationImages"],
  licenseeProgramImages:         ["licenseeProgramImages"],
  cuppingImages:                 ["cuppingImages"],
  pressItem:                     ["pressItem"],
  mediaItem:                     ["mediaItem"],
  qcShowFlyer:                   ["qcShowFlyer"],
  qcShowEpisode:                 ["qcShowEpisode"],
  ourStoryImages:                ["ourStoryImages"],
  teamMember:                    ["teamMember"],
  partner:                       ["partner"],
  coupon:                        ["coupon"],
  shippingMethod:                ["shippingMethod"],
}

export async function POST(req: NextRequest) {
  const expected = process.env.SANITY_WEBHOOK_SECRET
  if (!expected) {
    console.error("SANITY_WEBHOOK_SECRET is not set; refusing revalidation requests")
    return NextResponse.json({ message: "Not configured" }, { status: 500 })
  }

  if (!secretMatches(req.headers.get("x-webhook-secret"), expected)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  let body: { _type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }

  const type = body._type
  if (!type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 })
  }

  const tags = TYPE_TAG_MAP[type]
  if (!tags) {
    return NextResponse.json({ message: `Unknown type: ${type}` }, { status: 200 })
  }

  for (const tag of tags) revalidateTag(tag, "default")

  return NextResponse.json({ revalidated: true, tags })
}
