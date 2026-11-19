import type { StripeElementsOptions } from "@stripe/stripe-js"

// Stripe renders the payment form inside its own iframe, so it can't read the
// site's CSS variables. These hex values mirror the tokens in app/globals.css.
// Text-on-cream colours use the darker gold and red so they pass contrast.
const COLORS = {
  background: "#FAF8F5", // --background
  foreground: "#251E18", // --foreground
  muted: "#70645C", // --muted-foreground
  border: "#E1DAD0", // --border
  goldStrong: "#8C6117", // darker gold for text and focus (5.1:1 on cream)
  danger: "#B62020",
}

const appearance: NonNullable<StripeElementsOptions["appearance"]> = {
  theme: "stripe",
  variables: {
    fontFamily: "Lato, system-ui, sans-serif",
    colorPrimary: COLORS.goldStrong,
    colorBackground: COLORS.background,
    colorText: COLORS.foreground,
    colorTextSecondary: COLORS.muted,
    colorDanger: COLORS.danger,
    borderRadius: "2px", // rounded-sm, like the site's inputs
  },
  rules: {
    ".Input": {
      border: `1px solid ${COLORS.border}`,
      boxShadow: "none",
    },
    ".Input:focus": {
      border: `1px solid ${COLORS.goldStrong}`,
      boxShadow: `0 0 0 2px ${COLORS.goldStrong}`,
    },
    ".Tab": {
      border: `1px solid ${COLORS.border}`,
      boxShadow: "none",
    },
    ".Tab--selected, .Tab--selected:focus": {
      borderColor: COLORS.goldStrong,
      boxShadow: `0 0 0 1px ${COLORS.goldStrong}`,
    },
  },
}

// Lato for the iframe; it can't use the copy next/font loads for the page.
const fonts: StripeElementsOptions["fonts"] = [
  { cssSrc: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" },
]

/** Elements options for a payment form, themed to match the site. */
export function stripeElementsOptions(clientSecret: string): StripeElementsOptions {
  return { clientSecret, appearance, fonts }
}
