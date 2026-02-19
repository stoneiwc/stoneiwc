"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BOOKING_URL } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const SLOGAN = "Your Modern Holistic Path to Health & Wellness"

const slides = [
  {
    image: "/images/hero-wellness.jpg",
    subtitle: "Concierge Holistic Wellness Retreat",
    title: "Restoring the Body from the Inside Out",
    description:
      "Personalized lymphatic care, non-surgical body contouring, restorative hand and foot care, holistic nourishment guidance, and refined semi-permanent aesthetics -- delivered wherever you are.",
  },
  {
    image: "/images/hero-cupping.jpg",
    subtitle: "Eastern & Western Medicine United",
    title: "Holistic Precision. Five Decades Deep.",
    description:
      "We honor both Eastern and Western medicine -- each for its intended purpose. Over 100 services refined across 50+ years of hands-on experience, treating chronic conditions at the root.",
  },
  {
    image: "/images/hero-holistic.jpg",
    subtitle: "Holistic Nourishment Guidance",
    title: "Private Chefs. Nutritional Programs. Culinary Wellness.",
    description:
      "17+ trained chefs deliver private cooking classes, nutritional detox programs, pantry transformations, and healing meal preparation -- at your home, office, or event.",
  },
]

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 800)
    },
    [isTransitioning]
  )

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative z-20 flex h-full items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-sans text-lg font-medium tracking-widest text-primary sm:text-xl md:text-2xl">
            {SLOGAN}
          </p>
          <div className="mx-auto mb-6 h-px w-24 bg-primary/60" />
          <p
            className={cn(
              "font-body text-xs font-bold uppercase tracking-[0.3em] text-background/60 transition-all duration-700 delay-200",
              current >= 0
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            {slides[current].subtitle}
          </p>
          <h1
            key={`title-${current}`}
            className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-wide text-background md:text-5xl lg:text-6xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            {slides[current].title}
          </h1>
          <p
            key={`desc-${current}`}
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-background/80 font-body lg:text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
          >
            {slides[current].description}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              Schedule a Consultation
            </a>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
            >
              Our Approach
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-background/20 bg-foreground/30 text-background backdrop-blur-sm transition-all hover:bg-primary hover:border-primary hover:text-primary-foreground md:left-8"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-background/20 bg-foreground/30 text-background backdrop-blur-sm transition-all hover:bg-primary hover:border-primary hover:text-primary-foreground md:right-8"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              index === current
                ? "w-8 bg-primary"
                : "w-2 bg-background/40 hover:bg-background/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
