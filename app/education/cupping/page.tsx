import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import { Flame, Droplets, Wind, CircleDot, MoveRight, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Cupping Therapy",
  description:
    "Learn about traditional fire cupping -- our signature modality refined over five decades. Types, benefits, and what to expect.",
}

const cuppingTypes = [
  {
    icon: Flame,
    title: "Traditional Fire Cupping",
    description:
      "Our signature modality. A flame is used to create suction inside glass cups, which are then placed on the body. The heat draws blood flow to the area, promoting healing, reducing inflammation, and releasing tension. This ancient Eastern technique has been refined by our practitioners over five decades.",
  },
  {
    icon: Droplets,
    title: "Wet Cupping (Hijama)",
    description:
      "A therapeutic technique combining suction with controlled skin incisions to draw out stagnant blood and toxins. Used for centuries in traditional medicine, wet cupping is particularly effective for chronic pain, inflammation, and detoxification support.",
  },
  {
    icon: CircleDot,
    title: "Dry Cupping",
    description:
      "Cups are placed on the skin using suction without any incisions. Dry cupping is an excellent entry point for those new to cupping therapy. It helps with muscle tension, circulation, and relaxation while being gentle enough for most patients.",
  },
  {
    icon: MoveRight,
    title: "Moving Cupping",
    description:
      "Oil is applied to the skin and cups are moved along the body in a gliding motion. This combines the benefits of cupping with those of massage, covering larger areas and providing relief for widespread tension and pain.",
  },
  {
    icon: Zap,
    title: "Flash Cupping",
    description:
      "Cups are rapidly applied and removed in quick succession across an area. Flash cupping is used to stimulate energy flow and address conditions that require lighter, more dynamic treatment. It is particularly useful for sensitive areas.",
  },
  {
    icon: Wind,
    title: "Facial Cupping",
    description:
      "Smaller specialized cups are used on the face to improve circulation, reduce puffiness, promote lymphatic drainage, and support skin health. Facial cupping is a gentle, non-invasive approach to improving skin tone and addressing concerns like acne scarring.",
  },
]

const benefits = [
  "Pain relief and muscle tension reduction",
  "Improved blood circulation and oxygen delivery",
  "Inflammation reduction throughout the body",
  "Lymphatic drainage and detoxification support",
  "Respiratory health and congestion relief",
  "Digestive function improvement",
  "Stress and anxiety relief",
  "Immune system stimulation",
  "Skin health and complexion improvement",
  "Chronic condition support (blood pressure, kidney, etc.)",
]

const expectations = [
  {
    step: "01",
    title: "Initial Assessment",
    description:
      "Your practitioner will discuss your health history, current concerns, and goals. This helps us determine the most appropriate type of cupping and treatment plan for you.",
  },
  {
    step: "02",
    title: "Preparation",
    description:
      "The treatment area is cleaned and prepared. Your practitioner will explain every step before proceeding, ensuring you are comfortable and informed throughout.",
  },
  {
    step: "03",
    title: "Treatment",
    description:
      "Cups are applied using the method most suited to your needs. Sessions typically last 20-40 minutes depending on the type of cupping and areas being treated. You may feel warmth and gentle suction.",
  },
  {
    step: "04",
    title: "Aftercare",
    description:
      "Your practitioner will provide specific aftercare instructions. Cup marks are normal and typically fade within 3-10 days. Hydration and rest are encouraged after treatment.",
  },
]

export default function CuppingPage() {
  return (
    <>
      <PageHeader
        title="Cupping Therapy"
        subtitle="Our signature modality -- refined over five decades of practice, combining ancient Eastern wisdom with modern holistic understanding."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Our Signature Modality
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                The Ancient Art of Fire Cupping
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Cupping therapy is one of the oldest healing modalities in
                human history, with roots in Eastern medicine stretching back
                thousands of years. At Stone IWC, traditional fire cupping
                is our signature service -- the foundation upon which our
                entire practice was built.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Our practitioners have refined this art over five decades,
                combining the ancient technique with a modern understanding
                of anatomy, physiology, and root-cause healing. We use
                cupping not just for pain relief, but as a comprehensive
                tool for addressing chronic conditions from the inside out.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
                Cupping is available at your location through our concierge
                service or at our facility in Plano, TX.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/fire-cupping.jpg"
                alt="Traditional fire cupping therapy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Types of Cupping
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Cupping Modalities We Offer
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {cuppingTypes.map((type) => (
              <div
                key={type.title}
                className="flex flex-col rounded-sm border border-border bg-background p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <type.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                  {type.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Why Cupping
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                Benefits of Cupping Therapy
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body">
                Cupping therapy addresses the body from the inside out --
                promoting circulation, reducing inflammation, and supporting
                the body's natural ability to heal.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm font-body text-foreground">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Your Visit
              </p>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
                What to Expect
              </h2>
              <div className="mt-8 flex flex-col gap-6">
                {expectations.map((exp) => (
                  <div
                    key={exp.step}
                    className="flex gap-4 rounded-sm border border-border bg-card p-6"
                  >
                    <span className="shrink-0 font-sans text-2xl font-semibold text-primary/30">
                      {exp.step}
                    </span>
                    <div>
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        {exp.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-body">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-wide text-background md:text-4xl text-balance">
            Experience Cupping Therapy
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 font-body">
            Whether at your home, office, or our facility -- our
            practitioners bring five decades of cupping expertise directly to
            you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Book a Cupping Session
            </a>
            <Link
              href="/services/treatments"
              className="inline-flex items-center justify-center rounded-sm border border-background/30 px-10 py-3.5 text-sm font-body font-bold tracking-wider text-background transition-all hover:border-primary hover:text-primary"
            >
              View All Treatments
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
