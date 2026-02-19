import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "All Patient Forms",
  description: "Access and download all patient forms for Stone International Wellness Center.",
}

export default function FormsPage() {
  return (
    <>
      <PageHeader
        title="All Patient Forms"
        subtitle="Prepare for your visit with our convenient online forms."
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
