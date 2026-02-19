import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Media",
  description: "Media appearances and features of Stone International Wellness Center.",
}

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Visual stories and media features showcasing our wellness journey."
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
