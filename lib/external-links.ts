// Links that come from Sanity (press articles, videos, partner websites).
// Studio validates most of them, but validation only runs in Studio, so the
// site checks again before using one as an href: anything that isn't http(s),
// such as a javascript: URL, is dropped rather than rendered.
export function httpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"])

// The video ID from a youtube.com/watch?v=, youtu.be/ or /shorts/ link.
export function youtubeId(value: string | null | undefined): string | null {
  const href = httpUrl(value)
  if (!href) return null
  const url = new URL(href)
  let id: string | null = null
  if (url.hostname === "youtu.be") id = url.pathname.slice(1).split("/")[0]
  else if (YOUTUBE_HOSTS.has(url.hostname)) {
    id = url.pathname.startsWith("/shorts/")
      ? url.pathname.split("/")[2]
      : url.searchParams.get("v")
  }
  return id && /^[\w-]{6,20}$/.test(id) ? id : null
}

export function youtubeThumbnail(value: string | null | undefined): string | null {
  const id = youtubeId(value)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
