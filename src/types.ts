export interface ShopifyProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  unitCode: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  productIds: string[];
}

export interface TestimonialBlock {
  id: string;
  stars: string;
  quote: string;
  author: string;
  initials: string;
  unit: string;
}

export interface FeatureBlock {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface TickerItemBlock {
  id: string;
  text: string;
}

export interface ThemeSettings {
  header: {
    logoText: string;
    subText: string;
    badgeInitials: string;
    menuJson: string;
    ctaText: string;
  };
  hero: {
    eyebrow: string;
    lineChrome: string;
    lineSolid: string;
    lineRed: string;
    specTitle: string;
    specText: string;
    deployButtonText: string;
    catalogButtonText: string;
    featuredProductId: string;
    bgImage: string;
  };
  ticker: {
    speedSeconds: number;
    items: TickerItemBlock[];
  };
  productGrid: {
    eyebrow: string;
    title: string;
    viewAllText: string;
    collectionId: string;
  };
  fieldReport: {
    eyebrow: string;
    title: string;
    description: string;
    features: FeatureBlock[];
    imgUrl: string;
    stampNum: string;
    stampLabel: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    blocks: TestimonialBlock[];
  };
  ctaBanner: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  footer: {
    brandDescription: string;
    col1Title: string;
    col1LinksJson: string;
    col2Title: string;
    col2LinksJson: string;
    col3Title: string;
    col3LinksJson: string;
    copyrightText: string;
    versionCode: string;
  };
}

export interface CartItem {
  product: ShopifyProduct;
  quantity: number;
}
