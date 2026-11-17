import Link from "next/link"
import Image from "next/image"
import { navigation, CONTACT_INFO, BOOKING_URL } from "@/lib/navigation"
import { SocialIcons } from "@/components/social-icons"
import { Button } from "@/components/ui/button"

const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`

// Link columns come from the main menu, so the footer never links to a page
// the menu doesn't have. Groups only (Shop and Contact are in "More").
const linkGroups = navigation.filter((item) => item.children)
const moreLinks = [
  { label: "Shop", href: "/products" },
  { label: "Book an appointment", href: BOOKING_URL },
  { label: "Contact", href: "/contact" },
  { label: "Our policies", href: "/our-policies" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label="Stone International Wellness Center, home" className="self-start">
              <Image
                src="/images/logo.png"
                alt=""
                width={300}
                height={146}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="max-w-sm font-body text-sm leading-relaxed text-background/75">
              Holistic wellness practitioners in Plano, Texas. All proceeds support
              The Source of Hope, our nonprofit foundation.
            </p>
            <address className="flex flex-col gap-2 font-body text-sm not-italic text-background/75">
              <span>{CONTACT_INFO.address}</span>
              <a href={telHref(CONTACT_INFO.phoneGeneral)} className="hover:text-primary">
                {CONTACT_INFO.phoneGeneral} (general)
              </a>
              <a href={telHref(CONTACT_INFO.phoneConcierge)} className="hover:text-primary">
                {CONTACT_INFO.phoneConcierge} (concierge)
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary">
                {CONTACT_INFO.email}
              </a>
            </address>
            <Button asChild variant="inverse" className="self-start">
              <Link href={BOOKING_URL}>Book an appointment</Link>
            </Button>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
            {[...linkGroups, { label: "More", children: moreLinks }].map((group) => (
              <div key={group.label}>
                <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-1">
                  {group.children?.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-9 items-center font-body text-sm text-background/75 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-background/15 pt-8">
          <p className="max-w-3xl font-body text-xs leading-relaxed text-background/60">
            Our services do not replace medical diagnosis or treatment. Talk to your physician
            about any medical condition.
          </p>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="-ml-3 flex flex-wrap items-center">
              <SocialIcons />
            </div>
            <p className="font-body text-xs text-background/60">
              &copy; {new Date().getFullYear()} Stone International Wellness Center
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
