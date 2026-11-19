import Image from "next/image"
import type { ReactNode } from "react"
import { PageSection } from "@/components/ui/section"
import { cn } from "@/lib/utils"

interface FeatureSplitProps {
  image: { src: string; alt: string }
  /** Put the image on the right on wide screens. */
  imageRight?: boolean
  tone?: "plain" | "card"
  children: ReactNode
}

// Image beside text: the one layout used for every "about"-style block.
export function FeatureSplit({ image, imageRight = false, tone = "plain", children }: FeatureSplitProps) {
  return (
    <PageSection tone={tone}>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={cn("relative aspect-[4/3] overflow-hidden rounded-lg bg-muted", imageRight && "md:order-2")}>
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col items-start gap-5">{children}</div>
      </div>
    </PageSection>
  )
}
