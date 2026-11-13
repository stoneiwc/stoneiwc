import { CONCERN_CATEGORIES, CONCERNS } from "@/lib/concerns"
import { ConcernTabs } from "@/components/education/concern-tabs"

// Server component: every category's concerns are rendered into the HTML
// (searchable, and none of the copy ships as JavaScript). ConcernTabs only
// switches which panel is shown.
export function ConcernsExplorer() {
  const panels = CONCERN_CATEGORIES.map((category) => {
    const items = CONCERNS[category]
    return (
      <>
        <div className="mb-8 border-b border-border pb-6">
          <h2 className="font-sans text-2xl font-semibold tracking-wide text-foreground md:text-3xl">
            {category}
          </h2>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {items.length} concern{items.length !== 1 ? "s" : ""} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <h3 className="font-sans text-base font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </>
    )
  })

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ConcernTabs categories={CONCERN_CATEGORIES} panels={panels} />
      </div>
    </section>
  )
}
