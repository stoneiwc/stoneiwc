"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HeroSlide {
  image: string
  subtitle: string
  title: string
  description: string
}

const INTERVAL_MS = 6000
// Start loading the second slide's image once the page has settled, so it's
// ready for the first transition without competing with the first image.
const WARM_NEXT_AFTER_MS = 2500

interface HeroCarouselProps {
  slides: HeroSlide[]
  slogan: string
  // Server-rendered buttons under the slide text.
  actions: ReactNode
}

// The rotating part of the home hero. The slides (with their image URLs), the
// slogan and the buttons are prepared on the server by components/home/hero.tsx.
export function HeroCarousel({ slides, slogan, actions }: HeroCarouselProps) {
  const count = slides.length
  const [current, setCurrent] = useState(0)
  // Slides whose background image may load. Only the first at page load (it's
  // the largest paint); others are added just before they're shown.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [hovered, setHovered] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)

  const show = useCallback(
    (index: number) => {
      const target = (index + count) % count
      setCurrent(target)
      setLoaded((prev) => new Set([...prev, target, (target + 1) % count]))
    },
    [count],
  )

  useEffect(() => {
    if (count < 2) return
    const timer = setTimeout(() => setLoaded((prev) => new Set([...prev, 1])), WARM_NEXT_AFTER_MS)
    return () => clearTimeout(timer)
  }, [count])

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // Autoplay: one timer per slide, so manual navigation restarts the
  // countdown. Paused while hovered or focused, while the tab is hidden, and
  // off entirely for people who ask for reduced motion.
  useEffect(() => {
    if (count < 2 || hovered || tabHidden) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setTimeout(() => show(current + 1), INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [current, count, hovered, tabHidden, show])

  const slide = slides[current]

  return (
    <section
      className="relative flex min-h-[560px] items-end overflow-hidden bg-foreground md:h-[78vh] md:max-h-[820px] md:items-center"
      aria-roledescription="carousel"
      aria-label="Introduction"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {slides.map((item, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100" : "opacity-0"
          )}
        >
          {loaded.has(index) && (
            <Image
              src={item.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              preload={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}
        </div>
      ))}
      {/* Darkens the side the text sits on, so the photo stays visible. */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/20 md:bg-gradient-to-r md:from-foreground/85 md:via-foreground/50 md:to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-28 md:px-8 md:py-0">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-primary">{slogan}</p>

          {/* Every slide's text sits invisibly in the same grid cell as the
              visible one, so this block is always as tall as the longest slide
              and the buttons below don't jump when the slide changes. */}
          <div className="mt-5 grid">
            {slides.map((item, index) => (
              <div key={index} aria-hidden="true" className="invisible [grid-area:1/1]">
                <p className="text-display">{item.title}</p>
                <p className="mt-5 font-body text-base leading-relaxed md:text-lg">{item.description}</p>
              </div>
            ))}
            <div key={current} className="[grid-area:1/1]" aria-live="polite">
              <h1 className="text-display text-background animate-in fade-in slide-in-from-bottom-2 duration-700">
                {slide.title}
              </h1>
              <p className="mt-5 font-body text-base leading-relaxed text-background/85 md:text-lg animate-in fade-in duration-700">
                {slide.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-6 right-5 z-10 flex items-center gap-1 md:right-8">
          <button
            type="button"
            onClick={() => show(current - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-background/80 transition-colors hover:bg-background/10 hover:text-background"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => show(index)}
              className="group flex h-11 w-7 items-center justify-center"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  index === current ? "w-5 bg-primary" : "w-1.5 bg-background/50 group-hover:bg-background/80"
                )}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => show(current + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-background/80 transition-colors hover:bg-background/10 hover:text-background"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
