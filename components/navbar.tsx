"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, Phone, Mail, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { navigation, BOOKING_URL, CONTACT_INFO } from "@/lib/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { CartSheet } from "@/components/cart-sheet"
import { useCart } from "@/lib/cart-context"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems, setOpen: setCartOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <div className="hidden lg:block bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs tracking-wide font-body">
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="h-3 w-3" />
              {CONTACT_INFO.email}
            </a>
            <a
              href={`tel:${CONTACT_INFO.phoneGeneral.replace(/\s/g, "")}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="h-3 w-3" />
              General Info: {CONTACT_INFO.phoneGeneral}
            </a>
            <a
              href={`tel:${CONTACT_INFO.phoneConcierge.replace(/\s/g, "")}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="h-3 w-3" />
              Concierge Services: {CONTACT_INFO.phoneConcierge}
            </a>
          </div>
          <p className="text-background/70">{CONTACT_INFO.address}</p>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm"
            : "bg-background"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo.png"
              alt="Stone International Wellness Center"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <NavItemDesktop
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-foreground transition-colors hover:text-primary"
              aria-label={`Open cart with ${totalItems} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-body font-bold text-primary-foreground min-w-[18px] h-[18px]">
                  {totalItems}
                </span>
              )}
            </button>
            <Link
              href={BOOKING_URL}
              className="hidden sm:inline-flex items-center justify-center rounded-sm bg-primary px-6 py-2.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartSheet />
    </>
  )
}

function NavItemDesktop({
  item,
  pathname,
}: {
  item: (typeof navigation)[0]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const isActive =
    pathname === item.href ||
    item.children?.some((child) => pathname === child.href)

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "px-3 py-2 text-sm font-body font-bold tracking-wide transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-body font-bold tracking-wide transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </Link>

      <div
        className={cn(
          "absolute left-0 top-full pt-2 transition-all duration-200",
          open
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-1"
        )}
      >
        <div className="min-w-[220px] rounded-sm border border-border bg-background p-2 shadow-xl">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block rounded-sm px-4 py-2.5 text-sm font-body tracking-wide transition-colors hover:bg-muted hover:text-primary",
                pathname === child.href
                  ? "text-primary bg-muted"
                  : "text-foreground"
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
