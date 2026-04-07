import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
const BOOKING_URL = "/book?category=professional-treatment"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Professional Treatments",
  description:
    "Over 100 holistic treatments addressing chronic conditions, skin imperfections, internal health, and more.",
}

const treatmentCategories = [
  {
    category: "Chronic Condition Support",
    description:
      "Root-cause holistic modalities for ongoing health conditions, supporting the body's internal healing processes.",
    treatments: [
      "Diabetes Wellness Support",
      "High Blood Pressure Program",
      "Kidney Function Support",
      "Inflammation Reduction Therapy",
      "Lymphedema Management",
      "Chronic Pain Support",
      "Autoimmune Wellness Protocol",
      "Digestive Health Program",
      "Respiratory Wellness",
      "Chronic Fatigue Support",
    ],
  },
  {
    category: "Traditional & Fire Cupping",
    description:
      "Our signature modality -- traditional fire cupping refined over five decades to address a wide range of conditions.",
    treatments: [
      "Traditional Fire Cupping",
      "Wet Cupping (Hijama)",
      "Dry Cupping Therapy",
      "Facial Cupping",
      "Moving Cupping",
      "Flash Cupping",
      "Cupping for Back Pain",
      "Cupping for Respiratory Support",
      "Cupping for Inflammation",
      "Cupping for Detoxification",
    ],
  },
  {
    category: "Lymphatic & Drainage",
    description:
      "Specialized techniques to support the lymphatic system, reduce swelling, and promote internal detoxification.",
    treatments: [
      "Manual Lymphatic Drainage",
      "Lymphatic Massage",
      "Post-Surgical Lymphatic Care",
      "Lymphedema Wrapping",
      "Detox Lymphatic Protocol",
      "Lymphatic Facial Drainage",
    ],
  },
  {
    category: "Skin Imperfection Removal",
    description:
      "Holistic approaches to addressing skin concerns from the inside out and on the surface.",
    treatments: [
      "Cherry Angioma Removal",
      "Skin Tag Removal",
      "Wart Removal",
      "Pigmentation Correction",
      "Pre-Skin Cancer Spot Removal",
      "Milia Removal",
      "Ingrown Hair Treatment",
      "Chronic Acne Treatment",
      "Scar Tissue Therapy",
      "Age Spot Treatment",
    ],
  },
  {
    category: "Weight & Body Programs",
    description:
      "Comprehensive holistic programs combining treatments, nutrition, and lifestyle guidance.",
    treatments: [
      "Weight Loss Program",
      "Body Contouring Support",
      "Metabolic Wellness Protocol",
      "Nutritional Detox Program",
      "Inch Loss Wrapping",
      "Cellulite Reduction Therapy",
    ],
  },
  {
    category: "Culinary Wellness & Nutrition",
    description:
      "Food is medicine. Our 17+ trained chefs deliver hands-on nutritional programs to your home or location.",
    treatments: [
      "Custom Meal Program Design",
      "3-Day Concept Meal Plans",
      "Nutritional Detox Cooking",
      "Grocery Store Guidance",
      "Pantry Cleanout & Assessment",
      "Healing Smoothie Programs",
      "Dessert & Wellness Menu",
      "Legume & Organic Cooking Classes",
      "Family Nutrition Education",
      "Corporate Nutrition Workshops",
    ],
  },
  {
    category: "Holistic Bodywork",
    description:
      "Hands-on modalities addressing musculoskeletal, circulatory, and energetic imbalances.",
    treatments: [
      "Deep Tissue Bodywork",
      "Reflexology",
      "Gua Sha Therapy",
      "Moxibustion",
      "Acupressure",
      "Hot Stone Therapy",
      "Herbal Compress Therapy",
      "Craniosacral Technique",
      "Myofascial Release",
      "Trigger Point Therapy",
    ],
  },
  {
    category: "Education & Practitioner Training",
    description:
      "Our advanced education center teaches Eastern and Western modalities to practitioners, families, and individuals.",
    treatments: [
      "Cupping Certification Programs",
      "Holistic Health Workshops",
      "Eastern Medicine Fundamentals",
      "Western Wellness Integration",
      "Nutrition Science Education",
      "Family Health Literacy",
      "Corporate Wellness Training",
      "Practitioner Continuing Education",
    ],
  },
]

export default function TreatmentsPage() {
  return (
    <>
      <PageHeader
        title="Professional Treatments"
        subtitle="Over 100 holistic services addressing chronic conditions, skin health, internal wellness, nutrition, and more."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Our Modalities
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground md:text-4xl text-balance">
              Holistic Care From the Inside Out
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground font-body lg:text-lg">
              We honor both Eastern and Western medicine -- each for its
              intended purpose. Our treatments address the root cause of
              health conditions, not just the symptoms. All services are
              available at your location through our concierge model.
            </p>
          </div>

          <div className="mt-20 flex flex-col gap-16">
            {treatmentCategories.map((cat, i) => (
              <div
                key={cat.category}
                className="rounded-sm border border-border bg-card p-8 lg:p-10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-body font-bold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-sans text-2xl font-semibold text-foreground">
                      {cat.category}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground font-body">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.treatments.map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-3 rounded-sm border border-border bg-background px-4 py-3"
                    >
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm font-body text-foreground">
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-sm border border-primary/20 bg-primary/5 p-8 text-center lg:p-12">
            <p className="font-sans text-xl font-semibold text-foreground lg:text-2xl text-balance">
              {"Don't see what you're looking for?"}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground font-body">
              We offer many more specialized modalities and can create custom
              treatment protocols for your specific needs. Contact us to
              discuss your health goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={BOOKING_URL}
                className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-body font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                Schedule a Consultation
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-3 text-sm font-body font-bold tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
