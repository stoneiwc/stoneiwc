"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { navigation, BOOKING_URL, type NavItem } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

// Both are drawers that start closed, so their code loads after the page.
const MobileNav = dynamic(() => import("@/components/mobile-nav").then((m) => m.MobileNav), { ssr: false })
const CartSheet = dynamic(() => import("@/components/cart-sheet").then((m) => m.CartSheet), { ssr: false })

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems, setOpen: setCartOpen } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8">
          <Link href="/" className="shrink-0" aria-label="Stone International Wellness Center, home">
            <Image
              src="/images/logo.png"
              alt=""
              width={300}
              height={146}
              className="h-11 w-auto md:h-14"
              preload
            />
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {navigation.map((item) => (
              <li key={item.label}>
                <DesktopNavItem item={item} pathname={pathname} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
              aria-label={totalItems > 0 ? `Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}` : "Open cart"}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-body text-[11px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </button>
            <Button asChild className="hidden sm:inline-flex">
              <Link href={BOOKING_URL}>Book now</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted xl:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartSheet />
    </>
  )
}

function DesktopNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on navigation, Escape, or a click outside.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  const linkClass = (active: boolean) =>
    cn(
      "flex h-11 items-center gap-1 rounded-md px-3 font-body text-sm font-bold transition-colors hover:text-primary-strong",
      active ? "text-primary-strong" : "text-foreground",
    )

  if (!item.children) {
    return (
      <Link href={item.href} className={linkClass(pathname === item.href)} aria-current={pathname === item.href ? "page" : undefined}>
        {item.label}
      </Link>
    )
  }

  const active = item.children.some((child) => pathname === child.href.split("#")[0])
  const menuId = `menu-${item.label.toLowerCase()}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={linkClass(active)}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <ul
          id={menuId}
          className="absolute left-0 top-full mt-2 min-w-[240px] rounded-lg border border-border bg-popover p-2 shadow-lg"
        >
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                // Section links (/training#licensing) don't change the path,
                // so close the menu on click rather than on navigation.
                onClick={() => setOpen(false)}
                aria-current={pathname === child.href ? "page" : undefined}
                className={cn(
                  "block rounded-md px-4 py-2.5 font-body text-sm transition-colors hover:bg-muted",
                  pathname === child.href ? "font-bold text-primary-strong" : "text-foreground",
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
