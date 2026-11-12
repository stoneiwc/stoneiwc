type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  // Escape "<" so CMS text containing "</script>" can't end the tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
