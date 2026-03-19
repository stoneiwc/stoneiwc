import Image from "next/image"
import Link from "next/link"
import { ArrowRight, UtensilsCrossed, Apple, ShoppingBasket, Salad } from "lucide-react"
import { urlFor } from "@/lib/sanity.image"
import type { SanityHomePageImages } from "@/lib/sanity.queries"

const programs = [
  {
    icon: UtensilsCrossed,
    title: "Chef-Prepared Healing Meals",
    description:
      "Our 17+ trained chefs prepare nutritional detox meals, smoothies, desserts, and entrees tailored to your health needs using the 3-day rotation concept.",
  },
  {
    icon: ShoppingBasket,
    title: "Grocery Guidance",
    description:
      "We take you to the grocery store and teach you what to buy, what to avoid, and how to read labels -- building lifelong healthy habits from the shelf up.",
  },
  {
    icon: Apple,
    title: "Pantry Cleanouts",
    description:
      "We come to your home, go through your pantry and refrigerator, and show you what supports your health and what needs to go. A fresh start from the inside.",
  },
  {
    icon: Salad,
    title: "Nutritional Programs",
    description:
      "Custom programs built around organic vegetables, fruits, legumes, and whole foods. We teach all kinds of legumes, smoothie prep, dessert alternatives, and full menus.",
  },
]

interface CulinaryWellnessProps {
  image?: SanityHomePageImages["culinaryImage"]
}

export function CulinaryWellness({ image }: CulinaryWellnessProps) {
  const imageSrc = image
    ? urlFor(image).width(800).height(1000).url()
    : "/images/culinary-wellness.jpg"
  const imageAlt = image?.alt ?? "Stone IWC culinary wellness program with fresh organic ingredients"
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden h-48 w-48 border-2 border-primary/20 rounded-sm lg:block" />
          </div>

          <div>
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Food is Medicine
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
              Culinary Wellness & Nutritional Programs
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              We believe true healing starts with what you put into your
              body. With a team of 17+ trained chefs, Stone IWC writes
              custom nutritional programs and teaches families, corporate
              teams, and individuals how to nourish themselves through
              organic, whole-food living.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              Our 3-day concept rotates between full entree menus, smoothie
              and dessert days, and teaching days where we guide you through
              preparation of vegetables, fruits, legumes, and organic
              ingredients. Everything is delivered to your home, your
              corporate office, or wherever you need us.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {programs.map((program) => (
                <div
                  key={program.title}
                  className="group flex flex-col gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <program.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-foreground">
                    {program.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground font-body">
                    {program.description}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/services"
              className="mt-10 inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Explore All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
