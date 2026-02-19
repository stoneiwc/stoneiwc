import {
  Building2,
  Church,
  PartyPopper,
  Home,
  Hotel,
  HeartPulse,
  Hospital,
  GlassWater,
} from "lucide-react"
import { BOOKING_URL } from "@/lib/navigation"

const locations = [
  {
    icon: Building2,
    title: "Corporate Offices",
    description: "Employee wellness programs, team health days, nutritional workshops, and holistic treatments at your workplace.",
  },
  {
    icon: Church,
    title: "Churches",
    description: "Wellness ministry events, congregation health days, community healing sessions, and nutritional education.",
  },
  {
    icon: PartyPopper,
    title: "Events",
    description: "Girls' night out, bridal parties, retreats, private gatherings -- wellness experiences tailored to your group.",
  },
  {
    icon: Home,
    title: "Private Homes",
    description: "In-home treatments, pantry cleanouts, cooking lessons, and personalized care in the comfort of your own space.",
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "In-suite treatments for travelers, conference attendees, and guests seeking professional holistic care.",
  },
  {
    icon: Hospital,
    title: "Hospitals",
    description: "Bedside holistic support for patients seeking complementary care alongside their existing treatment.",
  },
  {
    icon: HeartPulse,
    title: "Hospice",
    description: "Compassionate holistic treatments that provide comfort, relief, and dignity to hospice patients and families.",
  },
  {
    icon: GlassWater,
    title: "Anywhere You Need Us",
    description: "No location is too unique. If you need holistic care, we will find a way to bring it to you.",
  },
]

export function WhereWeServe() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,hsl(var(--primary)/0.05),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Concierge Model
          </p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
            We Come to Wherever You Are
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
            We operate as a concierge service, traveling to patients' homes,
            hospice, hospitals, or wherever care is needed. When an
            in-person location is required, we see patients at The Source
            of Hope facility in Plano, TX.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((loc) => (
            <div
              key={loc.title}
              className="group flex flex-col rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
                <loc.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-semibold text-foreground">
                {loc.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-body">
                {loc.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Book a Concierge Visit
          </a>
        </div>
      </div>
    </section>
  )
}
