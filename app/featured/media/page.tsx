import type { Metadata } from "next"
import Image from "next/image"
import { getAwardItems, getMediaItems } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Media",
  description: "Video media coverage and appearances featuring Stone International Wellness Center.",
}

export const revalidate = 60

function getYoutubeThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1)
    } else if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      videoId = parsed.searchParams.get("v")
    }

    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  } catch {
    return null
  }
}

export default async function MediaPage() {
  const [mediaItems, awardItems] = await Promise.all([getMediaItems(), getAwardItems()])

  return (
    <>
      <PageHeader
        title="Our Media"
        subtitle="Watch our video features, interviews, and appearances."
      />

      {/* Cards Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {mediaItems.length === 0 ? (
          <p className="text-center text-muted-foreground font-body">
            No media items yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item) => {
              const thumbnail = getYoutubeThumbnail(item.youtubeUrl)
              return (
                <div
                  key={item._id}
                  className="flex flex-col overflow-hidden rounded border border-border bg-white shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                        No thumbnail
                      </div>
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
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        Watch Now →
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Awards — hidden until at least one award is published in Studio */}
      {awardItems.length > 0 && (
        <section id="awards" className="mx-auto max-w-7xl border-t border-border px-6 py-16">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Awards &amp; Recognition
            </h2>
            <p className="mt-3 text-muted-foreground font-body">
              Honors and accolades received by StoneIWC.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {awardItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col overflow-hidden rounded border border-border bg-white shadow-sm"
              >
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

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-sans text-base font-bold leading-snug text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
