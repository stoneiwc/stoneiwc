import { createHash, timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { CAL_EVENTS_REVALIDATE_TYPE, CAL_EVENTS_TAG, isContentType } from "@/lib/sanity-tags"

// Constant-time comparison. Hashing first gives both sides the same length,
// which timingSafeEqual requires.
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const digest = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(digest(provided), digest(expected))
}

// Each content type is its own cache tag (lib/sanity-tags.ts). Coupons,
// shipping methods, orders and gift cards are read live, so publishing them
// needs no revalidation.
function tagFor(type: string): string | null {
  if (type === CAL_EVENTS_REVALIDATE_TYPE) return CAL_EVENTS_TAG
  return isContentType(type) ? type : null
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

  let body: { _type?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }

  const type = body?._type
  if (typeof type !== "string" || !type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 })
  }

  const tag = tagFor(type)
  if (!tag) {
    // 200 so Sanity doesn't retry publishes of types no page caches.
    return NextResponse.json({ revalidated: false, message: `Nothing cached for type: ${type}` })
  }

  revalidateTag(tag, "default")
  return NextResponse.json({ revalidated: true, tags: [tag] })
}
