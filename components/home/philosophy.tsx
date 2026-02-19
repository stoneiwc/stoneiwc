import {
  Droplets,
  Sparkles,
  Hand,
  Salad,
  Eye,
  MapPin,
} from "lucide-react"

const pillars = [
  {
    icon: Droplets,
    title: "Personalized Lymphatic Care",
    description:
      "Lymphatic drainage, lymphedema support, and detox protocols tailored to each patient -- reducing inflammation and restoring flow from the inside out.",
  },
  {
    icon: Sparkles,
    title: "Non-Surgical Body Contouring",
    description:
      "Non-invasive body sculpting and contouring techniques that reshape and restore without surgery -- holistic alternatives refined over decades of practice.",
  },
  {
    icon: Hand,
    title: "Restorative Hand & Foot Care",
    description:
      "Specialized hand and foot treatments addressing ingrown conditions, chronic discomfort, and deep restoration -- therapeutic care that goes far beyond cosmetic.",
  },
  {
    icon: Salad,
    title: "Holistic Nourishment Guidance",
    description:
      "17+ trained chefs, custom nutritional programs, pantry cleanouts, grocery guidance, and private cooking classes -- because true healing starts with what you consume.",
  },
  {
    icon: Eye,
    title: "Refined Semi-Permanent Aesthetics",
    description:
      "Non-invasive aesthetic procedures including pigmentation correction, cherry angioma removal, wart removal, and pre-skin cancer treatments -- precision care without surgery.",
  },
  {
    icon: MapPin,
    title: "Concierge Model",
    description:
      "We travel to your home, office, hotel, church, event, hospital, or hospice. When an in-person facility is needed, we see patients at The Source of Hope location.",
  },
]

export function Philosophy() {
  return (
    <section className="relative py-24 lg:py-32 bg-card overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
            What We Do
          </p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
            A Concierge Holistic Wellness Retreat
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
            Stone International Wellness Center is devoted to restoring the
            body from the inside out. We are not a spa. We are not a hospital.
            We are experienced holistic practitioners you can hire -- with
            over five decades of expertise and 100+ services delivered
            directly to wherever you are.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group flex flex-col items-center rounded-sm border border-border bg-background p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-all group-hover:bg-primary/15 group-hover:scale-105">
                <pillar.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
