export interface NavLink {
  label: string
  href: string
}

// A top-level menu entry: a plain link, or a group that opens a list of links.
export type NavItem =
  | (NavLink & { children?: undefined })
  | { label: string; href?: undefined; children: NavLink[] }

// The site's main menu (header and mobile menu). The sitemap also lists every
// link here. "Book now" is a separate button in the header, not a menu item.
export const navigation: NavItem[] = [
  {
    label: "Services",
    children: [
      { label: "All services", href: "/services" },
      { label: "Concierge", href: "/services/concierge" },
      { label: "Video consultations", href: "/services#video" },
      { label: "Health concerns", href: "/education/concerns" },
      { label: "Questions & policies", href: "/faq" },
    ],
  },
  {
    label: "Training",
    children: [
      { label: "Training & education", href: "/training" },
      { label: "Certification courses", href: "/training#certifications" },
      { label: "Classes & workshops", href: "/training#classes" },
      { label: "Licensing", href: "/training#licensing" },
      { label: "Cupping guide", href: "/education/cupping" },
    ],
  },
  { label: "Shop", href: "/products" },
  {
    label: "About",
    children: [
      { label: "About us", href: "/about" },
      { label: "Team", href: "/about/team" },
      { label: "Partners", href: "/about/partners" },
      { label: "Media", href: "/media" },
    ],
  },
  { label: "Contact", href: "/contact" },
]

/** Every link in the menu, for the sitemap. */
export function allNavLinks(): NavLink[] {
  return navigation.flatMap((item) => (item.children ? item.children : [item]))
}

export const BOOKING_URL = "/book"

export const CONTACT_INFO = {
  email: "info@stoneiwc.com",
  phone: "+1 972-473-2205",
  phoneGeneral: "+1 972-473-2205",
  phoneConcierge: "+1 469-439-0052",
  address: "1108 W Parker Rd Ste 102 Plano, TX 75075",
}

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/stoneiwc/",
  x: "https://x.com/stoneiwc_?s=21&t=DR_vypSz-OSCfPafdme6aQ",
  instagram:
    "https://www.instagram.com/stoneiwc_?utm_source=ig_web_button_share_sheet&igsh=MXgwenM0YW43ZGxnZA%3D%3D",
  tiktok: "https://www.tiktok.com/@stoneiwc?is_from_webapp=1&sender_device=pc",
  spotify:
    "https://open.spotify.com/show/4o2EoOQx3dyY6BAFrorBql?si=b8d9a97d75f14b7e&nd=1&dlsi=f66e713c2ed14f89",
  youtube: "https://youtube.com/@stoneiwc?si=bHy9m4AFFdDG-ffY",
}
