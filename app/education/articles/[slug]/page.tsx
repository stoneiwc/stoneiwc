import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/sanity.queries"
import { urlFor } from "@/lib/sanity.image"
import { CalendarDays, ArrowLeft } from "lucide-react"

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <Link
        href="/education/articles"
        className="mb-10 inline-flex items-center gap-2 font-body text-sm font-bold tracking-wider text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-primary/10 px-3 py-1 font-body text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-sans text-3xl font-semibold leading-tight tracking-wide text-foreground md:text-4xl lg:text-5xl text-balance">
        {article.title}
      </h1>

      <div className="mt-4 flex items-center gap-2 font-body text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        {new Date(article.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      <div className="mx-auto my-8 h-px bg-border" />

      {article.coverImage?.asset && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-sm">
          <Image
            src={urlFor(article.coverImage).width(1200).height(675).url()}
            alt={article.coverImage.alt ?? article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <p className="mb-8 font-body text-lg leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>

      {article.body && (
        <div className="prose prose-stone w-full max-w-none overflow-hidden font-body text-foreground
          prose-headings:font-sans prose-headings:font-semibold prose-headings:text-foreground
          prose-p:leading-relaxed prose-p:text-muted-foreground
          prose-strong:text-foreground
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-sm prose-pre:overflow-x-auto
        ">
          <PortableText value={article.body} />
        </div>
      )}

      <div className="mt-16 border-t border-border pt-10 text-center">
        <Link
          href="/education/articles"
          className="inline-flex items-center gap-2 rounded-sm border border-primary px-8 py-3 font-body text-sm font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All Articles
        </Link>
      </div>
    </article>
  )
}
