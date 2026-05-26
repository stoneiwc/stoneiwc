import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BOOKING_URL } from "@/lib/navigation"
import {
  Stethoscope,
  MapPin,
  Utensils,
  GraduationCap,
  Clock,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "General Services Information",
  description:
    "Everything you need to know about Stone IWC services -- how our concierge model works, what to expect, and how we approach holistic wellness.",
}

const serviceTypes = [
  {
    icon: Stethoscope,
    title: "Holistic Treatments",
    description:
      "Our core offering includes over 100 holistic modalities addressing chronic conditions at the root cause. From traditional fire cupping and lymphatic drainage to skin imperfection removal and inflammation reduction -- every treatment is performed by experienced practitioners with 50+ years of collective experience.",
    details: [
      "Treatments available at your location or our facility",
      "Each session begins with a wellness assessment",
      "Custom treatment plans based on your health goals",
      "Both Eastern and Western modalities available",
    ],
  },
  {
    icon: MapPin,
    title: "Concierge Model",
    description:
      "Stone IWC operates on a concierge model. We come to you -- corporate offices, churches, events, private homes, hotels, hospitals, hospice facilities, and anywhere else you need us. Our practitioners arrive with all equipment, supplies, and products needed for a complete experience.",
    details: [
      "Full portable treatment setup provided",
      "Available for individuals, groups, and organizations",
      "Flexible scheduling including evenings and weekends",
      "Setup and cleanup handled entirely by our team",
    ],
  },
  {
    icon: Utensils,
    title: "Culinary Wellness",
    description:
      "With 17+ trained chefs, our culinary wellness program is unlike anything else. We believe food is medicine. Our chefs come to your home or location to teach nutritional cooking, prepare healing meals, guide grocery trips, and clean out pantries. We teach the 3-day concept: one day of entrees, one day of smoothies and desserts, one day of variety.",
    details: [
      "Custom meal programs for your health condition",
      "In-home pantry cleanouts and grocery guidance",
      "Legume, organic, and vegetable-focused cooking",
      "Family and corporate nutritional workshops",
    ],
  },
  {
    icon: GraduationCap,
    title: "Education Programs",
    description:
      "Our advanced education center offers programs for both practitioners seeking certification and patients wanting to understand their health better. We teach Eastern and Western modalities, nutrition science, and holistic health literacy -- empowering you to take ownership of your wellness journey.",
    details: [
      "Practitioner certification programs (cupping, etc.)",
      "Patient health literacy workshops",
      "Corporate wellness education days",
      "Family health and nutrition classes",
    ],
  },
]

const faqs = [
  {
    question: "Are you doctors?",
    answer:
      "No. We are experienced holistic practitioners with over five decades of experience. We are not doctors and we are not a spa. We occupy the space in between -- addressing health conditions through holistic, root-cause modalities from both Eastern and Western traditions.",
  },
  {
    question: "What conditions do you help with?",
    answer:
      "We support a wide range of chronic conditions including diabetes, high blood pressure, kidney function, inflammation, lymphedema, chronic acne, chronic pain, digestive issues, weight management, skin imperfections (cherry angiomas, warts, pigmentation, pre-skin cancer), and much more.",
  },
  {
    question: "Do you come to my location?",
    answer:
      "Yes. Our entire model is built on concierge service. We come to corporate offices, churches, events, private homes, hotels, hospitals, hospice facilities -- anywhere you need us. We bring all equipment and supplies.",
  },
  {
    question: "What is The Source of Hope?",
    answer:
      "The Source of Hope is our foundation. All profits from Stone IWC go directly to sustaining this foundation, which extends holistic health access to underserved communities. When you book a service with us, you are also supporting a greater mission.",
  },
  {
    question: "How do I book a service?",
    answer:
      "You can schedule a consultation through our online booking system, call us at +1 972-473-2205, or email Info@stoneiwc.com. We will discuss your needs and create a custom plan for your individual or group session.",
  },
  {
    question: "What is the 3-day food concept?",
    answer:
      "Our culinary wellness program teaches a rotating 3-day meal concept. One day focuses on entrees and full meals. Another day is dedicated to smoothies, desserts, and lighter options. The third day offers variety. This rotation keeps nutrition engaging and ensures a balanced intake of healing foods.",
  },
]

export default function GeneralInfoPage() {
  return (
    <>
      <PageHeader
        title="General Services Information"
        subtitle="Everything you need to know about how Stone IWC works, what we offer, and what to expect."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              How We Work
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Four Pillars of Service
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              Our services fall into four interconnected categories -- each
              designed to address your health from a different angle, all
              delivered through our concierge model.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-12">
            {serviceTypes.map((type) => (
              <div
                key={type.title}
                className="rounded-sm border border-border bg-card p-8 lg:p-10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sans text-xl font-semibold text-foreground lg:text-2xl">
                      {type.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground font-body">
                      {type.description}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {type.details.map((detail) => (
                        <div
                          key={detail}
                          className="flex items-start gap-2"
                        >
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="text-sm font-body text-foreground">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Common Questions
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-3xl flex flex-col gap-8">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-sm border border-border bg-background p-6 lg:p-8"
              >
                <h3 className="font-sans text-lg font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-body text-muted-foreground">
                50+ Years Experience
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-body text-muted-foreground">
                100+ Services
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-body text-muted-foreground">
                Flexible Hours
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={BOOKING_URL}
              className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Schedule a Consultation
            </Link>
            <Link
              href="/services/treatments"
              className="inline-flex items-center gap-2 text-sm font-body font-bold text-primary transition-colors hover:text-primary/80"
            >
              <span>View All Treatments</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
