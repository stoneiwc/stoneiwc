interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative bg-foreground py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,hsl(var(--primary)/0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,hsl(var(--accent)/0.10),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="mx-auto mb-6 h-px w-16 bg-primary/50" />
        <h1 className="font-sans text-4xl font-semibold tracking-wide text-background md:text-5xl lg:text-6xl text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-background/70 font-body lg:text-lg">
            {subtitle}
          </p>
        )}
        <div className="mx-auto mt-8 h-px w-16 bg-primary/50" />
      </div>
    </section>
  )
}
