import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  children?: ReactNode
  /** A button or link. */
  action?: ReactNode
}

// "Nothing here yet" / "no results" message, used the same way on every page.
export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <p className="text-h3">{title}</p>
      {children && <p className="max-w-md font-body text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
