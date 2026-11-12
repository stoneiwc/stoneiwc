import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Our Policies",
  description:
    "Review Stone International Wellness Center policies before scheduling your appointment.",
}

const policies = [
  {
    title: "Appointment Policy",
    content:
      "All appointments must be booked in advance through our online booking system or by contacting our front desk. Walk-ins are not accepted.",
  },
  {
    title: "Cancellation Policy",
    content:
      "Please give at least 24 hours notice to cancel or reschedule. Appointments cancelled at least 24 hours in advance are refunded in full. Late cancellations and no-shows are not refunded. We understand that emergencies happen and will work with you on a case-by-case basis.",
  },
  {
    title: "Late Arrival Policy",
    content:
      "If you arrive late for your appointment, your session may be shortened to accommodate the next client. We recommend arriving 10-15 minutes early to complete any necessary paperwork and to fully relax before your treatment.",
  },
  {
    title: "Payment Policy",
    content:
      "Payment is due at the time of booking and is taken by card through our online booking system. Gift certificates can be used for purchases in our online store.",
  },
  {
    title: "Health & Safety",
    content:
      "For your safety, please inform our practitioners of any health conditions, allergies, or medications before your treatment. Certain conditions may require a physician's clearance before we can proceed with specific therapies.",
  },
  {
    title: "Refund Policy",
    content:
      "Appointments cancelled at least 24 hours in advance are refunded in full (see Cancellation Policy). Services already rendered are non-refundable. Product returns are accepted within 14 days of purchase in original, unopened condition.",
  },
]

export default function OurPoliciesPage() {
  return (
    <>
      <PageHeader
        title="Our Policies"
        subtitle="Please review our policies before scheduling an appointment with Stone International Wellness Center."
      />
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col gap-12">
            {policies.map((policy, index) => (
              <div
                key={policy.title}
                className="flex gap-6"
              >
                <div className="hidden sm:flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-sm font-sans font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-sans text-xl font-semibold text-foreground lg:text-2xl">
                    {policy.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground font-body">
                    {policy.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
