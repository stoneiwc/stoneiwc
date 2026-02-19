import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Partners & Affiliates",
  description: "Our trusted partners and affiliate network at Stone International Wellness Center.",
}

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        title="Partners & Affiliates"
        subtitle="Collaborations that elevate the standard of holistic care."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-muted-foreground font-body">
            Content coming soon.
          </p>
        </div>
      </section>
    </>
  )
}
