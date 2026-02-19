import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Articles",
  description: "Wellness articles and insights from Stone International Wellness Center.",
}

export default function ArticlesPage() {
  return (
    <>
      <PageHeader
        title="Articles"
        subtitle="Insights, research, and perspectives on holistic wellness."
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
