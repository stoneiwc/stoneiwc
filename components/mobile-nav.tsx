"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown, Phone, Mail, MapPin } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { navigation, BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0 [&>button]:top-6">
        <SheetHeader className="p-6 pb-4 border-b border-border pr-14">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Link href="/" onClick={onClose} className="inline-block">
            <Image
              src="/images/logo.png"
              alt="Stone International Wellness Center"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
        </SheetHeader>

        <div className="flex flex-col py-4">
          {navigation.map((item) => (
            <MobileNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              onClose={onClose}
            />
          ))}
        </div>

        <div className="px-6 pb-4">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-sm bg-primary py-3.5 text-center text-sm font-body font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={onClose}
          >
            Book Now
          </a>
        </div>

        <div className="border-t border-border px-6 py-6">
          <div className="flex flex-col gap-4 text-sm font-body text-muted-foreground">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              {CONTACT_INFO.email}
            </a>
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              {CONTACT_INFO.phone}
            </a>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              {CONTACT_INFO.address}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavItem({
  item,
  pathname,
  onClose,
}: {
  item: (typeof navigation)[0]
  pathname: string
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isActive =
    pathname === item.href ||
    item.children?.some((child) => pathname === child.href)

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "px-6 py-3.5 text-base font-body font-bold tracking-wide transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between px-6 py-3.5 text-base font-body font-bold tracking-wide transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="bg-muted/50 py-2">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className={cn(
                "block px-10 py-2.5 text-sm font-body tracking-wide transition-colors hover:text-primary",
                pathname === child.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
