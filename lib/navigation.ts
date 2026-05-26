export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "Team Members", href: "/about/team" },
      { label: "Partners & Affiliates", href: "/about/partners" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Professional Treatments", href: "/services/treatments" },
      { label: "Concierge", href: "/services/concierge" },
      { label: "Virtual Consultations", href: "/services/virtual-consultations" },
    ],
  },
  { label: "Products", href: "/products" },
  {
    label: "Education",
    href: "/education",
    children: [
      { label: "Practitioner Certifications", href: "/education/certifications" },
      { label: "Licensee Programs", href: "/education/licensee" },
      { label: "General Services Information", href: "/education/general" },
      { label: "Concerns", href: "/education/concerns" },
      { label: "Cupping", href: "/education/cupping" },
      { label: "Articles", href: "/education/articles" },
    ],
  },
  {
    label: "Featured On",
    href: "/featured",
    children: [
      { label: "Press", href: "/featured/press" },
      { label: "Media", href: "/featured/media" },
      { label: "Awards", href: "/featured/awards" },
      { label: "Stoneiwc Podcast", href: "/featured/podcast" },
      { label: "The QC Show", href: "/featured/qc-show" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
]

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
