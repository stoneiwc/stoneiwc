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
      className="relative h-[90vh] min-h-[600px] overflow-hidden"
      aria-roledescription="carousel"
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
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
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
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative z-20 flex h-full items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-sans text-lg font-medium tracking-widest text-primary sm:text-xl md:text-2xl">
            {slogan}
          </p>
          <div className="mx-auto mb-6 h-px w-24 bg-primary/60" />

          {/* Every slide's text sits invisibly in the same grid cell as the
              visible one, so this block is always as tall as the longest slide
              and the buttons below don't jump when the slide changes. */}
          <div className="grid">
            {slides.map((item, index) => (
              <div key={index} aria-hidden="true" className="invisible [grid-area:1/1]">
                <p className="font-body text-xs font-bold uppercase tracking-[0.3em]">{item.subtitle}</p>
                <p className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-wide md:text-5xl lg:text-6xl text-balance">
                  {item.title}
                </p>
                <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed font-body lg:text-lg">
                  {item.description}
                </p>
              </div>
            ))}
            <div key={current} className="[grid-area:1/1]" aria-live="polite">
              <p className="font-body text-xs font-bold uppercase tracking-[0.3em] text-background/60 animate-in fade-in duration-700">
                {slide.subtitle}
              </p>
              <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-wide text-background md:text-5xl lg:text-6xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
                {slide.title}
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-background/80 font-body lg:text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {slide.description}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {actions}
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => show(current - 1)}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-background/20 bg-foreground/30 text-background backdrop-blur-sm transition-all hover:bg-primary hover:border-primary hover:text-primary-foreground md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => show(current + 1)}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-background/20 bg-foreground/30 text-background backdrop-blur-sm transition-all hover:bg-primary hover:border-primary hover:text-primary-foreground md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => show(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  index === current
                    ? "w-8 bg-primary"
                    : "w-2 bg-background/40 hover:bg-background/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
