import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

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
  article:                       ["article"],
  pressItem:                     ["pressItem"],
  mediaItem:                     ["mediaItem"],
  awardItem:                     ["awardItem"],
  qcShowFlyer:                   ["qcShowFlyer"],
  qcShowEpisode:                 ["qcShowEpisode"],
  ourStoryImages:                ["ourStoryImages"],
  teamMember:                    ["teamMember"],
  partner:                       ["partner"],
  coupon:                        ["coupon"],
  shippingMethod:                ["shippingMethod"],
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret")

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
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
