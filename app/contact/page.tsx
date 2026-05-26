import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { CONTACT_INFO, BOOKING_URL } from "@/lib/navigation"
import { ContactForm } from "@/components/contact/contact-form"

const DESCRIPTION = "Get in touch with Stone International Wellness Center in Plano, TX."

export const metadata: Metadata = {
  title: "Contact Us",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Us | Stone IWC", description: DESCRIPTION, url: "/contact", type: "website" },
  twitter: { card: "summary_large_image", title: "Contact Us | Stone IWC", description: DESCRIPTION },
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We would love to hear from you. Reach out to begin your wellness journey."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-sans text-3xl font-semibold text-foreground">Get in Touch</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body">
              Whether you have questions about our services or want to schedule a consultation, our team is here to help.
            </p>
            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-foreground">Email</h3>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="mt-1 text-sm font-body text-muted-foreground hover:text-primary transition-colors">
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-foreground">General Information</h3>
                  <a href={`tel:${CONTACT_INFO.phoneGeneral.replace(/\s/g, "")}`} className="mt-1 text-sm font-body text-muted-foreground hover:text-primary transition-colors">
                    {CONTACT_INFO.phoneGeneral}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-foreground">Concierge Services</h3>
                  <a href={`tel:${CONTACT_INFO.phoneConcierge.replace(/\s/g, "")}`} className="mt-1 text-sm font-body text-muted-foreground hover:text-primary transition-colors">
                    {CONTACT_INFO.phoneConcierge}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-foreground">Location</h3>
                  <p className="mt-1 text-sm font-body text-muted-foreground">
                    {CONTACT_INFO.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-foreground">Hours</h3>
                  <p className="mt-1 text-sm font-body text-muted-foreground">
                    By Appointment Only
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <Link
                href={BOOKING_URL}
                className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-card p-8 lg:p-10">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Send a Message</h2>
            <p className="mt-2 text-sm text-muted-foreground font-body">
              Fill out the form below and we will get back to you shortly.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
