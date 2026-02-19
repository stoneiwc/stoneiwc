import Link from "next/link"

export function PoliciesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          Stone International Wellness Center Policies
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
          Stone International Wellness Center requires all patients to
          review and understand our policies before scheduling a consultation
          or treatment. Please familiarize yourself with our guidelines
          to ensure a smooth and effective care experience.
        </p>
        <Link
          href="/our-policies"
          className="mt-8 inline-flex items-center justify-center rounded-sm border-2 border-foreground px-10 py-3.5 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:bg-foreground hover:text-background"
        >
          OUR POLICIES
        </Link>
      </div>
    </section>
  )
}
