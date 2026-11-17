import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// One card style. Flat at rest; only cards that are links react to hover.

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-background p-6 md:p-8', className)}>
      {children}
    </div>
  )
}

interface LinkCardProps {
  href: string
  title: string
  children?: ReactNode
  /** Small label above the title. */
  eyebrow?: string
  /** Text for the arrow link at the bottom. */
  cta?: string
  /** Optional media (e.g. a next/image) shown above the text. */
  media?: ReactNode
  className?: string
}

// The whole card is the link, so it's one tab stop with one accessible name.
export function LinkCard({ href, title, children, eyebrow, cta = 'Learn more', media, className }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary-strong/40',
        className,
      )}
    >
      {media && <div className="relative aspect-[4/3] overflow-hidden bg-muted">{media}</div>}
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h3 className="text-h3">{title}</h3>
        {children && <div className="font-body text-sm leading-relaxed text-muted-foreground">{children}</div>}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 font-body text-sm font-bold text-primary-strong">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
