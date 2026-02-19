import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Team Members",
  description: "Meet the dedicated professionals at Stone International Wellness Center.",
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team Members"
        subtitle="Meet the skilled practitioners dedicated to your wellness journey."
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
