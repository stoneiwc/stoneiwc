import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Stoneiwc Podcast",
  description: "Listen to the Stoneiwc Podcast for wellness insights and conversations.",
}

const SPOTIFY_SHOW_ID = "4o2EoOQx3dyY6BAFrorBql"
const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`

export default function PodcastPage() {
  return (
    <>
      <PageHeader
        title="Stoneiwc Podcast"
        subtitle="Deep conversations on wellness, healing, and the art of living well."
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        {/* Description */}
        <div className="mb-10 text-center">
          <p className="text-lg leading-relaxed text-foreground font-body">
            Listen in on the <span className="font-semibold">StoneIWC Podcast</span> hosted by QC Stone.
          </p>
          <p className="mt-2 text-base text-muted-foreground font-body">
            Episodes on Spotify every Thursday or so!
          </p>
        </div>

        {/* Spotify Embed */}
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <iframe
            src={`https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator&theme=0`}
            width="100%"
            height="452"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={SPOTIFY_SHOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.404a.75.75 0 0 1-1.032.249c-2.827-1.727-6.39-2.118-10.584-1.161a.75.75 0 0 1-.334-1.463c4.588-1.048 8.523-.597 11.7 1.343a.75.75 0 0 1 .25 1.032zm1.47-3.27a.937.937 0 0 1-1.288.308c-3.236-1.99-8.167-2.567-11.993-1.404a.938.938 0 0 1-.577-1.787c4.374-1.41 9.81-.728 13.55 1.596.44.27.578.847.308 1.287zm.126-3.405c-3.88-2.304-10.28-2.516-13.985-1.391a1.124 1.124 0 1 1-.653-2.151c4.248-1.29 11.307-1.041 15.768 1.609a1.124 1.124 0 1 1-1.13 1.933z" />
            </svg>
            Open on Spotify
          </a>
        </div>
      </section>
    </>
  )
}
