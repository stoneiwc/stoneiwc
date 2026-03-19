import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { getPartners } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Partners & Affiliates",
  description: "Our trusted partners and affiliate network at Stone International Wellness Center.",
}

export const revalidate = 60

export default async function PartnersPage() {
  const partners = await getPartners()

  return (
    <>
      <PageHeader
        title="Partners & Affiliates"
        subtitle="Collaborations that elevate the standard of holistic care."
      />

      {partners.length > 0 ? (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner._id}
                  className="group flex flex-col rounded-sm border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  {partner.logo ? (
                    <div className="relative mb-6 h-16 w-full">
                      <Image
                        src={urlFor(partner.logo).width(400).height(128).url()}
                        alt={partner.logo.alt ?? partner.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain object-left"
                      />
                    </div>
                  ) : (
                    <div className="mb-6 flex h-16 items-center">
                      <div className="h-px w-10 bg-primary/40 mr-3" />
                      <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
                        Partner
                      </span>
                    </div>
                  )}

                  <h3 className="font-sans text-xl font-semibold text-foreground">
                    {partner.name}
                  </h3>

                  {partner.description && (
                    <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-muted-foreground">
                      {partner.description}
                    </p>
                  )}

                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-bold tracking-wider text-primary transition-colors hover:text-primary/70"
                    >
                      Visit Website
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              Our partner profiles are coming soon.
            </p>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Collaborate With Us
          </p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground text-balance">
            Interested in a Partnership?
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
            We collaborate with organizations that share our commitment to holistic health
            and community wellness. Reach out to explore how we can work together.
          </p>
          <a
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 font-body text-sm font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </>
  )
}
