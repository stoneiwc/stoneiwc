"use client"

import Cal from "@calcom/embed-react"

type CalBookerProps = {
  calLink: string
}

export function CalBooker({ calLink }: CalBookerProps) {
  return (
    <Cal
      calLink={calLink}
      style={{ width: "100%", height: "100%", minHeight: "600px" }}
      config={{
        layout: "month_view",
        theme: "light",
        brandColor: "#D4921A",
      }}
    />
  )
}
