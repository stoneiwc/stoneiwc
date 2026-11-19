import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { CtaBand } from "@/components/ui/cta-band"
import { BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"

export const metadata: Metadata = pageMetadata({
  title: "Questions and policies",
  description:
    "How booking, payment and cancellation work at Stone International Wellness Center, answers to common questions, and our policies.",
  path: "/faq",
})

const linkClass = "font-bold text-primary-strong underline-offset-4 hover:underline"

const STEPS = [
  {
    title: "Book online",
    text: "Choose a service and a time. You pay by card when you book.",
  },
  {
    title: "Arrive a little early",
    text: "Come 10–15 minutes before your appointment to fill in your forms. For concierge visits, we come to you.",
  },
  {
    title: "Start with an assessment",
    text: "Your practitioner asks about your health and goals before your treatment begins.",
  },
]

const FAQS: { question: string; answer: ReactNode }[] = [
  {
    question: "Are you doctors?",
    answer: (
      <>
        No. We&apos;re holistic practitioners: not doctors, and not a spa. Our services don&apos;t
        replace medical diagnosis or treatment, so keep seeing your physician about any medical
        condition.
      </>
    ),
  },
  {
    question: "What can you help with?",
    answer: (
      <>
        See our{" "}
        <Link href="/services#areas" className={linkClass}>service areas</Link> and{" "}
        <Link href="/education/concerns" className={linkClass}>health concerns</Link>. If
        you&apos;re not sure what you need,{" "}
        <Link href="/book/consultation-in-person" className={linkClass}>book a consultation</Link>.
      </>
    ),
  },
  {
    question: "How much does it cost, and how do I pay?",
    answer: (
      <>
        Each service shows its price when you{" "}
        <Link href={BOOKING_URL} className={linkClass}>book</Link>. You pay by card when you book
        online. Gift cards can be used in our online shop.
      </>
    ),
  },
  {
    question: "Can I cancel or reschedule?",
    answer: (
      <>
        Yes. Cancel or reschedule at least 24 hours ahead for a full refund. See the{" "}
        <a href="#policies" className={linkClass}>cancellation policy</a> below.
      </>
    ),
  },
  {
    question: "Do you come to me?",
    answer: (
      <>
        For many services, yes: homes, offices, churches, hotels, hospitals, hospice and events. We
        bring the equipment and supplies. Call {CONTACT_INFO.phoneConcierge} or see{" "}
        <Link href="/services/concierge" className={linkClass}>concierge visits</Link>.
      </>
    ),
  },
  {
    question: "Can I see you online?",
    answer: (
      <>
        Yes, for consultations.{" "}
        <Link href="/services#video" className={linkClass}>Video consultations</Link> cover
        planning, nutrition and follow-ups; hands-on treatments need an in-person visit.
      </>
    ),
  },
  {
    question: "How else can I book?",
    answer: (
      <>
        Call {CONTACT_INFO.phoneGeneral} or email{" "}
        <a href={`mailto:${CONTACT_INFO.email}`} className={linkClass}>{CONTACT_INFO.email}</a>.
      </>
    ),
  },
  {
    question: "What is The Source of Hope?",
    answer: (
      <>
        Our nonprofit foundation. All proceeds from Stone IWC support it. Learn more at{" "}
        <a href="https://thesourceofhope.org" target="_blank" rel="noopener noreferrer" className={linkClass}>
          thesourceofhope.org
        </a>
        .
      </>
    ),
  },
]

const POLICIES = [
  {
    title: "Appointments",
    text: "All appointments are booked in advance, online or by phone. We don't take walk-ins.",
  },
  {
    title: "Cancellation",
    text: "Give at least 24 hours' notice to cancel or reschedule. Appointments cancelled at least 24 hours ahead are refunded in full. Late cancellations and no-shows are not refunded. If you have an emergency, contact us and we'll work with you case by case.",
  },
  {
    title: "Late arrival",
    text: "If you arrive late, your session may be shortened so the next client can start on time. Please arrive 10–15 minutes early.",
  },
  {
    title: "Payment",
    text: "Payment is due when you book and is taken by card through our online booking. Gift cards can be used for purchases in our online shop.",
  },
  {
    title: "Health and safety",
    text: "Tell your practitioner about any health conditions, allergies or medications before your treatment. Some conditions need a physician's clearance before certain treatments.",
  },
  {
    title: "Refunds and returns",
    text: "Appointments cancelled at least 24 hours ahead are refunded in full. Services already given are non-refundable. Products can be returned within 14 days of purchase, unopened and in their original condition.",
  },
]

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Before your visit"
        title="Questions and policies"
        subtitle="How booking works, answers to common questions, and our policies."
      />

      <PageSection>
        <SectionHeading title="How it works" />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 md:p-8">
              <span className="font-sans text-3xl font-semibold text-primary-strong" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="text-h3">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection tone="card" width="prose" id="questions">
        <SectionHeading title="Common questions" />
        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-body font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-primary-strong transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 font-body leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </PageSection>

      <PageSection width="prose" id="policies">
        <SectionHeading title="Our policies">
          Please read these before you book.
        </SectionHeading>
        <dl className="mt-10 flex flex-col gap-8">
          {POLICIES.map((policy) => (
            <div key={policy.title}>
              <dt className="text-h3">{policy.title}</dt>
              <dd className="mt-2 font-body leading-relaxed text-muted-foreground">{policy.text}</dd>
            </div>
          ))}
        </dl>
      </PageSection>

      <CtaBand title="Ready to book?" secondary={{ label: "Contact us", href: "/contact" }}>
        Book online, or call {CONTACT_INFO.phoneGeneral} and we&apos;ll help you choose.
      </CtaBand>
    </>
  )
}
