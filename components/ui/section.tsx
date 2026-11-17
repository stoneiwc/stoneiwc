import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Layout primitives every page is built from (modelled on thesourceofhope.org's
// PageSection / SectionHeading), so spacing, widths and headings read the same
// everywhere.

const WIDTHS = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  prose: 'max-w-3xl',
} as const

const TONES = {
  plain: '',
  card: 'bg-card',
  dark: 'bg-foreground text-background',
} as const

interface PageSectionProps {
  children: ReactNode
  /** Content width: default (cards and grids), wide (product listings), prose (reading). */
  width?: keyof typeof WIDTHS
  /** Background: plain page, a soft card tone, or dark. */
  tone?: keyof typeof TONES
  /** Vertical rhythm: compact for tight stacks (checkout, detail pages). */
  spacing?: 'default' | 'compact'
  id?: string
  className?: string
  innerClassName?: string
}

export function PageSection({
  children,
  width = 'default',
  tone = 'plain',
  spacing = 'default',
  id,
  className,
  innerClassName,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        spacing === 'compact' ? 'py-12 md:py-16' : 'py-16 md:py-24',
        TONES[tone],
        'scroll-mt-24',
        className,
      )}
    >
      <div className={cn('mx-auto px-5 md:px-8', WIDTHS[width], innerClassName)}>
        {children}
      </div>
    </section>
  )
}

interface SectionHeadingProps {
  /** Short label above the title. */
  eyebrow?: string
  title: ReactNode
  /** One supporting sentence. Keep it short. */
  children?: ReactNode
  align?: 'left' | 'center'
  /** Heading level; sections under a page's h1 are h2. */
  as?: 'h1' | 'h2' | 'h3'
  /** On a dark section. */
  inverted?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'left',
  as: Tag = 'h2',
  inverted = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className={cn('text-eyebrow', inverted && 'text-primary')}>{eyebrow}</p>
      )}
      <Tag className={cn(Tag === 'h1' ? 'text-h1' : Tag === 'h3' ? 'text-h3' : 'text-h2')}>
        {title}
      </Tag>
      {children && (
        <p className={cn('text-lead', inverted && 'text-background/75')}>{children}</p>
      )}
    </div>
  )
}
