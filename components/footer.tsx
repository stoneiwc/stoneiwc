import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"
import { CONTACT_INFO, SOCIAL_LINKS, BOOKING_URL } from "@/lib/navigation"
import { SocialIcons } from "@/components/social-icons"

const footerLinks = [
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "Team Members", href: "/about/team" },
      { label: "Partners & Affiliates", href: "/about/partners" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Professional Treatments", href: "/services/treatments" },
      { label: "Concierge", href: "/services/concierge" },
      { label: "Patient Forms", href: "/services/forms" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Products", href: "/products" },
      { label: "Education", href: "/education" },
      { label: "Featured On", href: "/featured" },
      { label: "Contact Us", href: "/contact" },
      { label: "Our Policies", href: "/our-policies" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Stone International Wellness Center"
                width={180}
                height={60}
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-background/70 font-body">
              A concierge holistic wellness retreat devoted to restoring the
              body from the inside out. Personalized lymphatic care,
              non-surgical body contouring, restorative hand and foot care,
              holistic nourishment guidance, and refined semi-permanent
              aesthetics. Proceeds from every service fund The Source of
              Hope foundation.
            </p>
            <div className="flex flex-col gap-3 text-sm font-body">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 text-primary" />
                {CONTACT_INFO.email}
              </a>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                {CONTACT_INFO.phone}
              </a>
              <div className="flex items-start gap-3 text-background/70">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                {CONTACT_INFO.address}
              </div>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-sans text-lg font-semibold tracking-wide text-primary mb-4">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-body text-background/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-8 border-t border-background/10 pt-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <SocialIcons />
          </div>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-primary px-8 py-2.5 text-sm font-body font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Book an Appointment
          </a>

          <p className="text-xs font-body text-background/50">
            &copy; {new Date().getFullYear()} Stone International Wellness
            Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
