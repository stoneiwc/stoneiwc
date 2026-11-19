import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** The page's single <h1>. */
  title: string
  /** One sentence under the title. */
  subtitle?: string
  /** Short label above the title (e.g. the section the page belongs to). */
  eyebrow?: string
  /** Buttons or links under the subtitle. */
  children?: ReactNode
  /** Smaller header for detail pages (a product, a booking). */
  compact?: boolean
}

// The banner at the top of every page except the homepage. Light and
// left-aligned, so the page's own content carries the colour.
export function PageHeader({ title, subtitle, eyebrow, children, compact = false }: PageHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-card', compact ? 'py-10 md:py-12' : 'py-14 md:py-20')}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 md:px-8">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h1 className={cn(compact ? 'text-h2' : 'text-h1', 'max-w-3xl')}>{title}</h1>
        {subtitle && <p className="text-lead max-w-2xl">{subtitle}</p>}
        {children && <div className="mt-2 flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  )
}
