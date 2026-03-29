import type { Metadata } from "next"
import Image from "next/image"
import { getPressItems } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Press",
  description: "Press coverage and news about Stone International Wellness Center.",
}

export const revalidate = 60

export default async function PressPage() {
  const pressItems = await getPressItems()

  return (
    <>
      <PageHeader
        title="In the Press"
        subtitle="See where StoneIWC has been featured and mentioned."
      />

      {/* Cards Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {pressItems.length === 0 ? (
          <p className="text-center text-muted-foreground font-body">
            No press items yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pressItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col overflow-hidden rounded border border-border bg-white shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {item.image?.asset && (
                    <Image
                      src={urlFor(item.image).width(600).height(450).url()}
                      alt={item.image.alt ?? item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-sans text-base font-bold leading-snug text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                    {item.description}
                  </p>
                  <div className="mt-5">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
