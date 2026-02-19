import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "The QC Show",
  description: "Watch The QC Show featuring Stone International Wellness Center.",
}

export default function QCShowPage() {
  return (
    <>
      <PageHeader
        title="The QC Show"
        subtitle="Engaging discussions and features on holistic living."
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
