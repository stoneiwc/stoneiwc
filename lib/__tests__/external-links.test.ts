import { describe, expect, it } from "vitest"
import { httpUrl, youtubeId, youtubeThumbnail } from "@/lib/external-links"

describe("httpUrl", () => {
  it("keeps http and https links", () => {
    expect(httpUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1")
    expect(httpUrl("http://example.com")).toBe("http://example.com/")
  })

  it("drops script, data and malformed links", () => {
    expect(httpUrl("javascript:alert(1)")).toBeNull()
    expect(httpUrl(" JavaScript:alert(1)")).toBeNull()
    expect(httpUrl("data:text/html,<script>alert(1)</script>")).toBeNull()
    expect(httpUrl("not a url")).toBeNull()
    expect(httpUrl("")).toBeNull()
    expect(httpUrl(undefined)).toBeNull()
  })
})

describe("youtubeId", () => {
  it("reads watch, short-link and shorts URLs", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  })

  it("rejects other hosts and odd IDs", () => {
    expect(youtubeId("https://vimeo.com/123456")).toBeNull()
    expect(youtubeId("https://www.youtube.com/watch?v=../../x")).toBeNull()
    expect(youtubeId("javascript:alert(1)")).toBeNull()
  })

  it("builds the thumbnail URL", () => {
    expect(youtubeThumbnail("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    )
  })
})
