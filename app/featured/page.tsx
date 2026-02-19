import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Featured On",
  description: "Stone International Wellness Center in the press, media, and podcasts.",
}

export default function FeaturedPage() {
  return (
    <>
      <PageHeader
        title="Featured On"
        subtitle="Our presence across press, media, and thought leadership platforms."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-muted-foreground font-body">
            Content coming soon. Explore our press coverage, media appearances, and podcasts.
          </p>
        </div>
      </section>
    </>
  )
}
