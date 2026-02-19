import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ProductsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Practitioner-Grade Products
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
              Support Your Healing at Home
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              Continue your treatment protocol between visits with
              practitioner-selected products. Every item in our collection
              is chosen for its therapeutic efficacy and alignment with
              root-cause healing principles.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-2xl font-semibold text-primary">
                  100%
                </span>
                <span className="text-sm font-body text-muted-foreground">
                  Therapeutic Grade
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-2xl font-semibold text-primary">
                  Curated
                </span>
                <span className="text-sm font-body text-muted-foreground">
                  By Our Practitioners
                </span>
              </div>
            </div>
            <Link
              href="/products"
              className="mt-10 inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square overflow-hidden rounded-sm">
              <Image
                src="/images/products-display.jpg"
                alt="Stone IWC premium wellness products collection"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-40 w-40 border-2 border-primary/20 rounded-sm lg:block" />
          </div>
        </div>
      </div>
    </section>
  )
}
