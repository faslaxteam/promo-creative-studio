import { BannerTheme } from "./banner-types";

export const DEFAULT_BASE_COLOR = "#14b8a6";

export function safeHex(hex: string | undefined | null): string {
  if (hex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return hex;
  return DEFAULT_BASE_COLOR;
}

export function hexToRgb(hex: string) {
  let clean = hex.replace("#", "");
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function clampByte(v: number) {
  return Math.min(255, Math.max(0, Math.round(v)));
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => clampByte(v).toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = 0; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h: number, s: number, l: number) {
  const { r, g, b } = hslToRgb(((h % 360) + 360) % 360, Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, l)));
  return rgbToHex(r, g, b);
}

export function shade(hex: string, amt: number) {
  try {
    const { h, s, l } = hexToHsl(hex);
    return hslToHex(h, s, l + amt / 100);
  } catch {
    return hex;
  }
}

export function lighten(hex: string, amt: number) { return shade(hex, Math.abs(amt)); }
export function darken(hex: string, amt: number) { return shade(hex, -Math.abs(amt)); }

export function mix(hexA: string, hexB: string, t: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

export function withAlpha(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function textOn(hex: string) {
  return relativeLuminance(hex) > 0.48 ? "#12161F" : "#FFFFFF";
}

export function buildTheme(rawColor: string): BannerTheme {
  const base = safeHex(rawColor);
  const { h, s } = hexToHsl(base);
  const highlight = hslToHex(h + 12, Math.min(1, s * 1.15 + 0.1), 0.62);
  return {
    base,
    baseSoft: lighten(base, 22),
    baseDeep: darken(base, 32),
    baseDeeper: darken(base, 52),
    ink: mix(darken(base, 58), "#04050A", 0.4),
    paper: mix(lighten(base, 68), "#FFFFFF", 0.6),
    onBase: textOn(base),
    onDeep: "#F5F7FA",
    glow: highlight,
    highlight,
  };
}