import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Stoneiwc Podcast",
  description: "Listen to the Stoneiwc Podcast for wellness insights and conversations.",
}

export default function PodcastPage() {
  return (
    <>
      <PageHeader
        title="Stoneiwc Podcast"
        subtitle="Deep conversations on wellness, healing, and the art of living well."
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
