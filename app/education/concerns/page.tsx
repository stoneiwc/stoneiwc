import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ConcernsExplorer } from "@/components/education/concerns-explorer"

export const metadata: Metadata = {
  title: "Health Concerns",
  description:
    "Explore the health concerns we address at Stone International Wellness Center. From muscle and joint health to mental wellness and internal health.",
}

export default function ConcernsPage() {
  return (
    <>
      <PageHeader
        title="Health Concerns"
        subtitle="Discover how our holistic treatments address a wide range of health concerns -- from the inside out."
      />
      <ConcernsExplorer />
    </>
  )
}
