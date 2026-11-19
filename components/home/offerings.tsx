import Link from "next/link"
import { LinkCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageSection, SectionHeading } from "@/components/ui/section"

// The most-booked service areas. Each opens the booking page filtered to that
// category (values from BOOKING_CATEGORIES in lib/cal-api.ts).
const OFFERINGS = [
  { title: "Cupping", text: "Fire, dry, and wet cupping, our signature service.", category: "cupping" },
  { title: "Massage & bodywork", text: "Massage and hands-on body treatments.", category: "massage-body" },
  { title: "Body contouring", text: "Non-surgical contouring and inch-loss wraps.", category: "body-transformation" },
  { title: "Face & skin", text: "Facials and skin treatments.", category: "face" },
  { title: "Skin spot removal", text: "Skin tags, cherry angiomas, and other common spots.", category: "skin-imperfection" },
  { title: "Hand & foot care", text: "Nail and foot care, from routine visits to problem nails.", category: "nail" },
]

export function Offerings() {
  return (
    <PageSection>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Services" title="What we offer">
          Book any of these online, or start with a consultation.
        </SectionHeading>
        <Button asChild variant="outline" className="self-start md:self-auto">
          <Link href="/services">See all services</Link>
        </Button>
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERINGS.map((item) => (
          <li key={item.category}>
            <LinkCard href={`/book?category=${item.category}`} title={item.title} cta="See options">
              {item.text}
            </LinkCard>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-body text-sm text-muted-foreground">
        Not sure where to start?{" "}
        <Link href="/book/consultation-in-person" className="font-bold text-primary-strong underline-offset-4 hover:underline">
          Book a consultation
        </Link>{" "}
        and we&apos;ll recommend treatments.
      </p>
    </PageSection>
  )
}
