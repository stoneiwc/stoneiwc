import type { Metadata } from "next"
import Image from "next/image"
import type { ReactNode } from "react"
import { ArrowUpRight, Play } from "lucide-react"
import { pageMetadata } from "@/lib/seo"
import { PageHeader } from "@/components/page-header"
import { PageSection, SectionHeading } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { getMediaItems, getPressItems, getQcShowEpisodes, getQcShowFlyer } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { httpUrl, youtubeThumbnail } from "@/lib/external-links"

export const metadata: Metadata = pageMetadata({
  title: "Media",
  description:
    "Press coverage, videos, the StoneIWC Podcast and The QC Show from Stone International Wellness Center.",
  path: "/media",
})

export const revalidate = 60

const SPOTIFY_SHOW_ID = "4o2EoOQx3dyY6BAFrorBql"
const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`

const SECTIONS = [
  { id: "press", label: "Press" },
  { id: "video", label: "Video" },
  { id: "qc-show", label: "The QC Show" },
  { id: "podcast", label: "Podcast" },
]

const gridClass = "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"

// A card that opens an outside page (an article or a video) in a new tab.
function ExternalCard({
  href,
  media,
  title,
  children,
  cta,
}: {
  href: string
  media: ReactNode
  title: string
  children?: ReactNode
  cta: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary-strong/40"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">{media}</div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="text-h3">{title}</h3>
        {children && <p className="font-body text-sm leading-relaxed text-muted-foreground">{children}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-2 font-body text-sm font-bold text-primary-strong">
          {cta}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
      </div>
    </a>
  )
}

function VideoThumb({ url, alt }: { url: string; alt: string }) {
  const thumbnail = youtubeThumbnail(url)
  return (
    <>
      {thumbnail && (
        <Image src={thumbnail} alt={alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
      )}
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
        </span>
      </span>
    </>
  )
}

export default async function MediaPage() {
  const [press, videos, flyer, episodes] = await Promise.all([
    getPressItems(),
    getMediaItems(),
    getQcShowFlyer(),
    getQcShowEpisodes(),
  ])

  // Only items with a valid http(s) link are shown.
  const pressItems = press.flatMap((item) => {
    const href = httpUrl(item.link)
    return href ? [{ ...item, href }] : []
  })
  const videoItems = videos.flatMap((item) => {
    const href = httpUrl(item.youtubeUrl)
    return href ? [{ ...item, href }] : []
  })
  const episodeItems = episodes.flatMap((item) => {
    const href = httpUrl(item.youtubeUrl)
    return href ? [{ ...item, href }] : []
  })

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Media"
        subtitle="Press coverage, videos, The QC Show and the StoneIWC Podcast."
      >
        <nav aria-label="Media sections" className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <Button key={s.id} asChild variant="outline" size="sm">
              <a href={`#${s.id}`}>{s.label}</a>
            </Button>
          ))}
        </nav>
      </PageHeader>

      <PageSection id="press" width="wide">
        <SectionHeading title="In the press" />
        {pressItems.length === 0 ? (
          <div className="mt-10"><EmptyState title="No press items yet" /></div>
        ) : (
          <ul className={gridClass}>
            {pressItems.map((item) => (
              <li key={item._id}>
                <ExternalCard
                  href={item.href}
                  title={item.title}
                  cta="Read the article"
                  media={
                    item.image?.asset && (
                      <Image
                        src={urlFor(item.image).width(800).height(450).url()}
                        alt={item.image.alt ?? ""}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )
                  }
                >
                  {item.description}
                </ExternalCard>
              </li>
            ))}
          </ul>
        )}
      </PageSection>

      <PageSection id="video" width="wide" tone="card">
        <SectionHeading title="Video" />
        {videoItems.length === 0 ? (
          <div className="mt-10"><EmptyState title="No videos yet" /></div>
        ) : (
          <ul className={gridClass}>
            {videoItems.map((item) => (
              <li key={item._id}>
                <ExternalCard href={item.href} title={item.title} cta="Watch on YouTube" media={<VideoThumb url={item.href} alt="" />}>
                  {item.description}
                </ExternalCard>
              </li>
            ))}
          </ul>
        )}
      </PageSection>

      <PageSection id="qc-show" width="wide">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
          {flyer?.image?.asset && (
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-border md:mx-0">
              <Image
                src={urlFor(flyer.image).width(640).url()}
                alt={flyer.image.alt ?? "The QC Show flyer"}
                width={640}
                height={853}
                sizes="(max-width: 768px) 80vw, 20rem"
                className="h-auto w-full"
              />
            </div>
          )}
          <div className="flex flex-col gap-5">
            <SectionHeading eyebrow="Radio and TV" title="The QC Show" />
            <p className="text-lead">
              For more than 30 years, The QC Show has shared conversations on holistic health,
              wellness, entrepreneurship and community issues on Radio Saigon Dallas KBDT 1160AM.
            </p>
            <p className="font-body leading-relaxed text-muted-foreground">
              Our founder, Quynh Chau Stone, hosts the show in Vietnamese every week and also
              appears on American television.
            </p>
            <dl className="grid gap-3 font-body text-sm sm:grid-cols-3">
              <div>
                <dt className="font-bold text-foreground">On air</dt>
                <dd className="text-muted-foreground">Saturdays, 10 AM, KBDT 1160AM</dd>
              </div>
              <div>
                <dt className="font-bold text-foreground">By phone</dt>
                <dd>
                  <a href="tel:+12144905108" className="text-muted-foreground hover:text-primary-strong">
                    214-490-5108
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-bold text-foreground">Languages</dt>
                <dd className="text-muted-foreground">English and Vietnamese</dd>
              </div>
            </dl>
          </div>
        </div>

        {episodeItems.length > 0 && (
          <>
            <h3 className="text-h3 mt-14">Episodes</h3>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {episodeItems.map((episode, i) => (
                <li key={episode._id}>
                  <ExternalCard
                    href={episode.href}
                    title={`Episode ${i + 1}`}
                    cta="Watch on YouTube"
                    media={<VideoThumb url={episode.href} alt="" />}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </PageSection>

      <PageSection id="podcast" width="prose" tone="card">
        <SectionHeading title="The StoneIWC Podcast">
          Hosted by QC Stone. New episodes on Spotify most Thursdays.
        </SectionHeading>
        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <iframe
            title="The StoneIWC Podcast on Spotify"
            src={`https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>
        <Button asChild variant="outline" className="mt-6">
          <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noopener noreferrer">
            Open on Spotify
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Button>
      </PageSection>
    </>
  )
}
