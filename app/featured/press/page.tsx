import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Press",
  description: "Press coverage and news about Stone International Wellness Center.",
}

export default function PressPage() {
  return (
    <>
      <PageHeader
        title="Press"
        subtitle="Latest news and press coverage about Stone IWC."
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
