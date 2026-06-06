import { ShopifyProduct, ShopifyCollection, ThemeSettings } from "./types";

export const INITIAL_PRODUCTS: ShopifyProduct[] = [
  {
    id: "prod-1",
    sku: "Unit-001",
    name: "Quad Cortex StompGuard Acrylic Protector w/ Screen Shield",
    price: 49.99,
    image: "https://stompguard.com/cdn/shop/files/80403f2c-il_fullxfull.7627642180_7w3a.jpg?v=1773128059&width=1200",
    badge: "Field Tested",
    unitCode: "UNIT-001"
  },
  {
    id: "prod-2",
    sku: "Unit-002",
    name: "Quad Cortex Mini StompGuard w/ Screen Shield",
    price: 34.95,
    image: "https://stompguard.com/cdn/shop/files/26dd5755-il_fullxfull.7636746092_1utv.jpg?v=1773128060&width=500",
    badge: "New Unit",
    unitCode: "Unit-002"
  },
  {
    id: "prod-3",
    sku: "Unit-001-alt",
    name: "Quad Cortex StompGuard w/ Screen Protection",
    price: 49.99,
    image: "https://stompguard.com/cdn/shop/files/62eaf802-il_fullxfull.7575364814_alzo.jpg?v=1773128059&width=500",
    badge: "Field Tested",
    unitCode: "Unit-001"
  },
  {
    id: "prod-4",
    sku: "Unit-003",
    name: "Neural DSP Nano Cortex StompGuard Acrylic Protector",
    price: 21.95,
    image: "https://stompguard.com/cdn/shop/files/d9c0fafb-il_fullxfull.6924149105_frep.jpg?v=1773128059&width=500",
    badge: undefined,
    unitCode: "Unit-003"
  },
  {
    id: "prod-5",
    sku: "Unit-004",
    name: "Digitech Drop StompGuard Acrylic Protector",
    price: 21.95,
    image: "https://stompguard.com/cdn/shop/files/23f2648e-il_fullxfull.6876203484_mk9h.jpg?v=1773128060&width=500",
    badge: undefined,
    unitCode: "Unit-004"
  }
];

export const INITIAL_COLLECTIONS: ShopifyCollection[] = [
  {
    id: "all",
    title: "All Protectors",
    productIds: ["prod-2", "prod-3", "prod-4", "prod-5"]
  },
  {
    id: "neural-dsp",
    title: "Neural DSP Units",
    productIds: ["prod-1", "prod-2", "prod-3", "prod-4"]
  },
  {
    id: "others",
    title: "Accessory Gear",
    productIds: ["prod-5"]
  }
];

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  header: {
    logoText: "StompGuard",
    subText: "Pedal Protection Systems",
    badgeInitials: "SG",
    menuJson: JSON.stringify([
      { title: "Home", url: "#home" },
      { title: "Catalog", url: "#catalog" },
      { title: "Acrylic Covers", url: "#covers" },
      { title: "Contact", url: "#contact" }
    ], null, 2),
    ctaText: "Cart"
  },
  hero: {
    eyebrow: "Field-Grade Pedal Protection",
    lineChrome: "Protect",
    lineSolid: "Your",
    lineRed: "Signal.",
    specTitle: "MISSION BRIEF",
    specText: "Precision-cut acrylic protectors for your most valuable gear. Engineered for gigging musicians who operate in hostile environments.",
    deployButtonText: "Deploy Now →",
    catalogButtonText: "View Catalog →",
    featuredProductId: "prod-1",
    bgImage: "https://stompguard.com/cdn/shop/files/80403f2c-il_fullxfull.7627642180_7w3a.jpg?v=1773128059&width=1200"
  },
  ticker: {
    speedSeconds: 35,
    items: [
      { id: "t1", text: "US Based Operations" },
      { id: "t2", text: "Premium Acrylic Construction" },
      { id: "t3", text: "Precision CNC Cut" },
      { id: "t4", text: "Rapid Order Fulfillment" },
      { id: "t5", text: "Neural DSP Specialists" },
      { id: "t6", text: "Gig-Ready Protection" }
    ]
  },
  productGrid: {
    eyebrow: "Equipment Catalog",
    title: "Protective Covers",
    viewAllText: "View All Units →",
    collectionId: "all"
  },
  fieldReport: {
    eyebrow: "Field Report",
    title: "Built for Serious Players",
    description: "Your pedalboard is mission-critical equipment. StompGuard protectors are precision-manufactured to keep your gear operational through knocks, liquid, and the chaos of live performance.",
    features: [
      { id: "f1", icon: "🔒", name: "Precision Fit", description: "Cut to exact specs for your specific pedal model. No gaps, no wobble." },
      { id: "f2", icon: "⚡", name: "Magnetic Secure", description: "Select covers use magnets for tool-free removal between gigs." },
      { id: "f3", icon: "🇺🇸", name: "US Based", description: "Fast order fulfillment and real human customer support." },
      { id: "f4", icon: "🎸", name: "Gig Tested", description: "Designed by musicians who play live and understand the risks." }
    ],
    imgUrl: "https://stompguard.com/cdn/shop/files/80403f2c-il_fullxfull.7627642180_7w3a.jpg?v=1773128059&width=800",
    stampNum: "100%",
    stampLabel: "Satisfaction Guaranteed"
  },
  testimonials: {
    eyebrow: "Field Intel",
    title: "Operator Reports",
    blocks: [
      {
        id: "testi-1",
        stars: "★★★★★",
        quote: '"Finally a protector that actually fits my Quad Cortex perfectly. No more worrying about accidental stomps wiping out my presets mid-set."',
        author: "Mike R.",
        initials: "MR",
        unit: "Quad Cortex StompGuard"
      },
      {
        id: "testi-2",
        stars: "★★★★★",
        quote: '"The magnetic version is genius. Snaps on and off in seconds and the screen protection is crystal clear. Worth every penny for touring players."',
        author: "Jason L.",
        initials: "JL",
        unit: "Magnetic Quad Cortex w/ Screen Shield"
      },
      {
        id: "testi-3",
        stars: "★★★★★",
        quote: '"Super fast shipping and the build quality is excellent. Exactly what I needed to protect my Nano Cortex at the edge of my pedalboard."',
        author: "Dan S.",
        initials: "DS",
        unit: "Nano Cortex StompGuard"
      }
    ]
  },
  ctaBanner: {
    title: "Gear Down. Protect Up.",
    subtitle: "One accidental stomp can take your rig offline mid-performance. Don't risk the mission.",
    buttonText: "Deploy Protection →"
  },
  footer: {
    brandDescription: "Your source for premium pedal protection. US based for fast order fulfillment and exceptional customer service.",
    col1Title: "Shop",
    col1LinksJson: JSON.stringify([
      { title: "All Products", url: "#all" },
      { title: "Acrylic Covers", url: "#acrylic" },
      { title: "Quad Cortex", url: "#qc" },
      { title: "Nano Cortex", url: "#nano" },
      { title: "Digitech", url: "#digitech" }
    ], null, 2),
    col2Title: "Support",
    col2LinksJson: JSON.stringify([
      { title: "Contact Us", url: "#contact" },
      { title: "Shipping Info", url: "#shipping" },
      { title: "Returns", url: "#returns" },
      { title: "FAQ", url: "#faq" }
    ], null, 2),
    col3Title: "Company",
    col3LinksJson: JSON.stringify([
      { title: "About", url: "#about" },
      { title: "Privacy Policy", url: "#privacy" },
      { title: "Terms of Service", url: "#terms" }
    ], null, 2),
    copyrightText: "© 2026 StompGuard. All rights reserved.",
    versionCode: "SG-TACTICAL-v2.0"
  }
};
