import { NextResponse } from "next/server"
import { getShippingMethods } from "@/lib/sanity.queries"

export async function GET() {
  const methods = await getShippingMethods()
  return NextResponse.json(methods)
}
