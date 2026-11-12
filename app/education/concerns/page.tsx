import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { ConcernsExplorer } from "@/components/education/concerns-explorer"

export const metadata: Metadata = {
  title: "Health Concerns",
  description:
    "Explore the health concerns we address at Stone International Wellness Center. From muscle and joint health to mental wellness and internal health.",
}

export default function ConcernsPage() {
  return (
    <>
      <PageHeader
        title="Health Concerns"
        subtitle="Discover how our holistic treatments address a wide range of health concerns -- from the inside out."
      />
      <ConcernsExplorer />

      <section className="bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Not Sure Where to Start?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Book a consultation and we will talk through your concerns and recommend the right treatments.
          </p>
          <Link
            href="/book/consultation-in-person"
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </>
  )
}
