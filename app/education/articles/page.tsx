import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { getArticles } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { CalendarDays, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Articles",
  description: "Wellness articles and insights from Stone International Wellness Center.",
}

export const revalidate = 60

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <>
      <PageHeader
        title="Articles"
        subtitle="Insights, research, and perspectives on holistic wellness."
      />

      {articles.length > 0 ? (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/education/articles/${article.slug.current}`}
                  className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {article.coverImage ? (
                      <Image
                        src={urlFor(article.coverImage).width(800).height(450).url()}
                        alt={article.coverImage.alt ?? article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/5">
                        <span className="font-sans text-4xl font-light text-primary/20">
                          Stone IWC
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    {article.tags && article.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-sm bg-primary/10 px-2.5 py-0.5 font-body text-xs text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-sans text-xl font-semibold text-foreground transition-colors group-hover:text-primary leading-snug">
                      {article.title}
                    </h2>

                    <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(article.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <span className="flex items-center gap-1 font-body text-xs font-bold text-primary transition-colors group-hover:text-primary/70">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              Articles coming soon.
            </p>
          </div>
        </section>
      )}
    </>
  )
}
