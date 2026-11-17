"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Phone, Mail, MapPin } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navigation, BOOKING_URL, CONTACT_INFO, type NavItem } from "@/lib/navigation"

const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
          <SheetTitle className="text-left font-sans text-2xl">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col py-2">
            {navigation.map((item) => (
              <li key={item.label}>
                <MobileNavItem item={item} pathname={pathname} onClose={onClose} />
              </li>
            ))}
          </ul>

          <div className="px-6 pb-6 pt-2">
            <Button asChild size="lg" className="w-full">
              <Link href={BOOKING_URL} onClick={onClose}>Book now</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4 border-t border-border px-6 py-6 font-body text-sm text-muted-foreground">
            <a href={telHref(CONTACT_INFO.phoneGeneral)} className="flex items-center gap-3 hover:text-primary-strong">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT_INFO.phoneGeneral} (general)
            </a>
            <a href={telHref(CONTACT_INFO.phoneConcierge)} className="flex items-center gap-3 hover:text-primary-strong">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT_INFO.phoneConcierge} (concierge)
            </a>
            <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-3 hover:text-primary-strong">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT_INFO.email}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT_INFO.address}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavItem({ item, pathname, onClose }: { item: NavItem; pathname: string; onClose: () => void }) {
  const active = item.children ? item.children.some((c) => c.href === pathname) : item.href === pathname
  const [expanded, setExpanded] = useState(active)
  const rowClass = cn(
    "flex min-h-12 w-full items-center justify-between px-6 font-body text-base font-bold transition-colors hover:text-primary-strong",
    active ? "text-primary-strong" : "text-foreground",
  )

  if (!item.children) {
    return (
      <Link href={item.href} onClick={onClose} className={rowClass} aria-current={active ? "page" : undefined}>
        {item.label}
      </Link>
    )
  }

  const listId = `mobile-menu-${item.label.toLowerCase()}`
  return (
    <>
      <button type="button" className={rowClass} aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((v) => !v)}>
        {item.label}
        <ChevronDown className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
      </button>
      {expanded && (
        <ul id={listId} className="bg-muted/60 py-1">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onClose}
                aria-current={pathname === child.href ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center px-10 font-body text-sm transition-colors hover:text-primary-strong",
                  pathname === child.href ? "font-bold text-primary-strong" : "text-muted-foreground",
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
