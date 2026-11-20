import { describe, expect, it } from "vitest"
import { FILL_TIME_FIELD, isFilledTooFast, spamSignals } from "@/lib/contact-spam"

describe("isFilledTooFast", () => {
  it("lets a form that was open for a few seconds through", () => {
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: 3000 })).toBe(false)
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: 45_000 })).toBe(false)
  })

  it("drops a submission made in under 3 seconds", () => {
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: 2999 })).toBe(true)
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: 0 })).toBe(true)
  })

  it("drops a post that skipped the browser and never sent the field", () => {
    expect(isFilledTooFast({})).toBe(true)
    expect(isFilledTooFast(null)).toBe(true)
    expect(isFilledTooFast(undefined)).toBe(true)
  })

  it("drops a fill time that isn't a real number", () => {
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: "5000" })).toBe(true)
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: Number.NaN })).toBe(true)
    expect(isFilledTooFast({ [FILL_TIME_FIELD]: Number.POSITIVE_INFINITY })).toBe(true)
  })
})

describe("spamSignals", () => {
  const clean = { firstName: "Jane", lastName: "Doe", message: "Do you have openings on Saturday?" }

  it("flags nothing in an ordinary message", () => {
    expect(spamSignals(clean)).toEqual([])
  })

  it("allows a single link in the message", () => {
    expect(spamSignals({ ...clean, message: "Is this the oil? https://example.com/oil" })).toEqual([])
  })

  it("flags two or more links in the message, with the count", () => {
    const message = "Cheap SEO https://a.example and www.b.example and http://c.example"
    expect(spamSignals({ ...clean, message })).toEqual(["3 links in message"])
  })

  it("flags a link in either name field", () => {
    expect(spamSignals({ ...clean, firstName: "www.spam.example" })).toEqual(["link in name"])
    expect(spamSignals({ ...clean, lastName: "https://spam.example" })).toEqual(["link in name"])
  })

  it("gives the same answer when called repeatedly", () => {
    // A global regex would keep lastIndex between calls and flip the result.
    const spammy = { ...clean, firstName: "http://spam.example" }
    expect(spamSignals(spammy)).toEqual(["link in name"])
    expect(spamSignals(spammy)).toEqual(["link in name"])
  })
})
