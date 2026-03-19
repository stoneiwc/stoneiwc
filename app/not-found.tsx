import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Error 404
      </p>

      <h1 className="font-heading text-6xl md:text-8xl font-light text-primary mb-6">
        Lost in Wellness
      </h1>

      <div className="w-16 h-px bg-primary mx-auto mb-6" />

      <p className="font-body text-muted-foreground text-lg max-w-md mb-10">
        The page you&apos;re looking for has moved, or perhaps it never existed.
        Let us guide you back to your journey.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase px-8 py-3 hover:bg-accent transition-colors duration-300"
        >
          Return Home
        </Link>
        <Link
          href="/services"
          className="inline-block border border-primary text-primary font-body text-sm tracking-widest uppercase px-8 py-3 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          Our Services
        </Link>
      </div>
    </div>
  )
}
