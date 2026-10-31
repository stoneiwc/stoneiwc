"use client"

import { useId, type Ref } from "react"
import { HONEYPOT_FIELD } from "@/lib/honeypot"

// Off-screen honeypot input (see lib/honeypot.ts). Moved off-screen rather
// than display:none, because some bots skip inputs that aren't rendered.
// aria-hidden and tabIndex -1 keep it away from screen readers and the Tab key.
export function HoneypotField({ ref }: { ref?: Ref<HTMLInputElement> }) {
  const id = useId()
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
    >
      <label htmlFor={id}>Leave this field empty</label>
      <input
        ref={ref}
        id={id}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  )
}
