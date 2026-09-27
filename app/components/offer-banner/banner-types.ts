export type HeroBannerStyle =
  | "grand-launch"
  | "bestseller-bundle"
  | "flash-sale"
  | "festive-bonanza"
  | "deal-of-the-week"
  | "free-shipping"
  | "premium-arrival"
  | "anniversary-celebration"
  | "mega-clearance";

export const heroBannerStyleLabels: Record<HeroBannerStyle, string> = {
  "grand-launch": "1. The Neo-Editorial Vogue",
  "bestseller-bundle": "2. Cyber-Velocity Retail",
  "flash-sale": "3. The Minimalist Atelier",
  "festive-bonanza": "4. The Bold Clearance Impact",
  "deal-of-the-week": "5. The Glassmorphism Showcase",
  "free-shipping": "6. The Architectural Diagonal",
  "premium-arrival": "7. The Midnight Glow Edition",
  "anniversary-celebration": "8. The Organic Sculptural",
  "mega-clearance": "9. The Urban Commerce Grid",
};

export interface BannerProduct {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
}

export interface BannerTheme {
  base: string;
  baseSoft: string;
  baseDeep: string;
  baseDeeper: string;
  ink: string;
  paper: string;
  onBase: string;
  onDeep: string;
  glow: string;
  highlight: string;
}

export type FontWeight = number | string;

export type FlowItem =
  | { kind: "text"; text: string; size: number; weight: FontWeight; color: string; caps?: boolean; lineHeight?: number; letterSpacing?: number }
  | { kind: "pill"; text: string; size: number; bg: string; fg: string; paddingX: number; caps?: boolean; border?: string }
  | { kind: "price"; price: number; compareAt: number | null; size: number; color: string; strikeColor: string; currency: string }
  | { kind: "cta"; text: string; size: number; bg: string; fg: string; height: number; icon?: boolean; border?: string; shadow?: boolean }
  | { kind: "spacer"; size: number };

export interface FlowMeasure {
  height: number;
  lines?: string[];
  lineHeight?: number;
}

export interface SceneArgs {
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement | null;
  theme: BannerTheme;
  content: { headline: string; title: string; sub: string; cta: string; offer: string };
  priceInfo: { price: number; compareAt: number | null; currency: string };
  showDiscountBadge: boolean;
}

export interface BannerExportPayload {
  blob: Blob;
  dataUrl?: string;
  headline: string;
  subheadline: string;
  offerTag: string;
  ctaText: string;
  style: HeroBannerStyle;
  product: BannerProduct;
  bannerColor: string;
}