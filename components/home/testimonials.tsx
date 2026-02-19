"use client"

import { useState, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    text: "QC took very good care of me during my first experience with cupping therapy. She briefly explained what cupping felt like and set expectations clearly before we got started. It helped alleviate any concerns I had. I felt much better after cupping and she also discussed with me areas of concern that I need to improve my health in. I also interacted with other members of her team and they were just as patient and caring with me. I would gladly recommend anyone interact with Stone International Wellness Center for themselves!",
    name: "Roger M. Le",
    rating: 5,
  },
  {
    text: "After years of dealing with chronic fatigue and digestive issues, Stone IWC was the first place that actually looked at the root cause instead of just prescribing something to mask the symptoms. The team is incredibly thorough -- they took time to understand my full health history and created a treatment plan that has genuinely changed my quality of life.",
    name: "Sarah K.",
    rating: 5,
  },
  {
    text: "Stone International Wellness Center is not your typical wellness center. Their concierge model means I always feel supported, not just during visits but between them too. They helped me understand what was happening inside my body and gave me a real path forward. This is what healthcare should feel like.",
    name: "James T.",
    rating: 5,
  },
  {
    text: "I was skeptical at first -- I had been to so many doctors for my chronic inflammation with no real answers. The team at Stone IWC took a completely different approach, focusing on internal healing and addressing things I had never even considered. My condition has improved more in a few months here than in years elsewhere.",
    name: "Maria G.",
    rating: 5,
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [next])

  const review = testimonials[current]

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,rgba(255,255,255,0.3),transparent),radial-gradient(1px_1px_at_40%_70%,rgba(255,255,255,0.2),transparent),radial-gradient(1px_1px_at_60%_20%,rgba(255,255,255,0.25),transparent),radial-gradient(1px_1px_at_80%_50%,rgba(255,255,255,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,60,120,0.3),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <h2 className="text-center font-sans text-3xl font-bold tracking-wide text-white md:text-4xl lg:text-5xl">
          Real Patient Experience
        </h2>

        <div className="mt-16 min-h-[280px] flex flex-col items-center justify-center">
          <p
            key={`text-${current}`}
            className="text-center text-base italic leading-relaxed text-white/80 font-body md:text-lg lg:text-xl lg:leading-relaxed animate-in fade-in duration-500 max-w-4xl"
          >
            {`"${review.text}"`}
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            <p
              key={`name-${current}`}
              className="font-sans text-lg font-semibold text-white animate-in fade-in duration-500 delay-150"
            >
              {review.name}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-primary text-primary"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-primary hover:text-primary"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  index === current
                    ? "w-6 bg-primary"
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-primary hover:text-primary"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
