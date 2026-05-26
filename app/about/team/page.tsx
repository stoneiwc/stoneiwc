import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { getTeamMembers } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { BOOKING_URL } from "@/lib/navigation"

export const metadata: Metadata = {
  title: "Team Members",
  description: "Meet the dedicated professionals at Stone International Wellness Center.",
}

export const revalidate = 60

export default async function TeamPage() {
  const members = await getTeamMembers()

  return (
    <>
      <PageHeader
        title="Team Members"
        subtitle="Meet the skilled practitioners dedicated to your wellness journey."
      />

      {members.length > 0 ? (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="group flex flex-col rounded-sm border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {member.image?.asset ? (
                      <Image
                        src={urlFor(member.image).width(600).height(800).url()}
                        alt={member.image.alt ?? member.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/5">
                        <span className="font-sans text-5xl font-light text-primary/30">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-sans text-xl font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-1 font-body text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      {member.title}
                    </p>

                    {member.specialties && member.specialties.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {member.specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-sm bg-primary/10 px-2.5 py-1 font-body text-xs text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {member.bio && (
                      <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              Our team profiles are coming soon.
            </p>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Join Your Wellness Journey
          </p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-foreground text-balance">
            Ready to Meet the Team in Person?
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
            Schedule a consultation and let our practitioners guide you toward lasting holistic health.
          </p>
          <Link
            href={BOOKING_URL}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-10 py-3.5 font-body text-sm font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </>
  )
}
