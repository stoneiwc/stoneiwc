import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Concerns",
  description: "Learn about common wellness concerns and how we address them.",
}

export default function ConcernsPage() {
  return (
    <>
      <PageHeader
        title="Concerns"
        subtitle="Understanding common wellness concerns and holistic approaches to healing."
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
