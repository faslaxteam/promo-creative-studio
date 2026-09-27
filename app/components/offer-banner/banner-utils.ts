import { BannerProduct, HeroBannerStyle } from "./banner-types";

/**
 * Normalizes a URL by ensuring it contains an HTTP or HTTPS protocol.
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

/**
 * Generates a clean, SEO-friendly file name for exported banner images.
 */
export function generateBannerFileName(
  productTitle: string,
  style: HeroBannerStyle,
  extension: "png" | "jpeg" | "webp" = "png"
): string {
  const cleanTitle = productTitle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${cleanTitle || "offer"}-${style}-banner.${extension}`;
}

/**
 * Triggers a direct browser download of the rendered canvas as an image.
 */
export function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: string = "image/png"
): void {
  const dataUrl = canvas.toDataURL(mimeType);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Converts a Canvas element into a standard Blob object with Promise wrapper.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string = "image/png",
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Formats a numerical price value with appropriate currency notation.
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "₹",
  locale: string = "en-IN"
): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  return `${currencySymbol}${Math.round(amount).toLocaleString(locale)}`;
}

/**
 * Validates if the selected product contains all required visual attributes.
 */
export function validateBannerProduct(product: BannerProduct | null): boolean {
  if (!product) return false;
  return Boolean(product.id && product.title && product.price >= 0);
}