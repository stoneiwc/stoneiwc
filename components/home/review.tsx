import { PageSection } from "@/components/ui/section"

// Verified client reviews only. Add more here as they're confirmed (with the
// client's permission and where the review was posted).
export function Review() {
  return (
    <PageSection tone="card" width="prose">
      <figure className="flex flex-col items-center gap-6 text-center">
        <p className="text-eyebrow">From a client</p>
        <blockquote className="font-sans text-2xl leading-snug text-foreground md:text-3xl">
          &ldquo;QC took very good care of me during my first experience with cupping therapy. She
          briefly explained what cupping felt like and set expectations clearly before we got
          started. It helped alleviate any concerns I had.&rdquo;
        </blockquote>
        <figcaption className="font-body text-sm font-bold text-muted-foreground">Roger M. Le</figcaption>
      </figure>
    </PageSection>
  )
}
