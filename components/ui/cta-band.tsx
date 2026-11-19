import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { BOOKING_URL } from '@/lib/navigation'

interface CtaBandProps {
  title: string
  /** One sentence. */
  children?: ReactNode
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
}

// The closing call to action used at the bottom of pages. Defaults to booking.
export function CtaBand({
  title,
  children,
  primary = { label: 'Book an appointment', href: BOOKING_URL },
  secondary,
}: CtaBandProps) {
  return (
    <section className="bg-foreground py-16 text-background md:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 text-center md:px-8">
        <h2 className="text-h2">{title}</h2>
        {children && <p className="text-lead text-background/75">{children}</p>}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button asChild size="lg" variant="inverse">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
