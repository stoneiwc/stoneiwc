import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { getQcShowFlyer, getQcShowEpisodes } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"

export const metadata: Metadata = {
  title: "The QC Show",
  description: "Watch The QC Show featuring Stone International Wellness Center.",
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

export default async function QCShowPage() {
  const [flyer, episodes] = await Promise.all([
    getQcShowFlyer(),
    getQcShowEpisodes(),
  ])

  return (
    <>
      <PageHeader
        title="The QC Show"
        subtitle="Engaging discussions and features on holistic living."
      />

      {/* Hero: Flyer + Description */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Flyer */}
          {flyer?.image?.asset && (
            <div className="w-full max-w-sm shrink-0 lg:w-80">
              <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
                <Image
                  src={urlFor(flyer.image).width(480).url()}
                  alt={flyer.image.alt ?? "The QC Show Flyer"}
                  width={480}
                  height={640}
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col justify-center">
            <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
              The QC Show
            </h2>
            <div className="mt-1 h-1 w-16 bg-primary" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
              For more than 30 years, the QC Show has been a trusted voice in the community on Radio Saigon Dallas KBDT 1160AM. Through these platforms, we have shared resources and conversations on holistic health, wellness, entrepreneurship, and community issues — along the way inspiring individuals and families to live better.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body">
              Our founder, Quynh Chau Stone, continues to lead the QC Show in Vietnamese every week, while also appearing on American television. We encourage our viewers and listeners to tune in and follow our missions to serve your community.
            </p>
            <div className="mt-6 space-y-1 text-sm text-muted-foreground font-body">
              <p>📻 Tune in every Saturday at 10 AM on Radio Saigon Dallas KBDT 1160AM</p>
              <p>📞 Listen by phone: 214-490-5108</p>
              <p>🌐 Available in both English &amp; Vietnamese</p>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes */}
      {episodes.length > 0 && (
        <section className="bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 font-sans text-2xl font-bold text-foreground">
              Episodes
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {episodes.map((episode, index) => {
                const thumbnail = getYoutubeThumbnail(episode.youtubeUrl)
                const episodeNumber = index + 1
                return (
                  <a
                    key={episode._id}
                    href={episode.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={`Episode ${episodeNumber}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          No thumbnail
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                          <svg className="h-5 w-5 translate-x-0.5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {episodeNumber}
                      </span>
                      <span className="font-sans text-sm font-semibold text-foreground">
                        Episode {episodeNumber}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
