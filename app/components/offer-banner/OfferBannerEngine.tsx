"use client";

import { useCallback, useState } from "react";
import BannerCanvas from "./BannerCanvas";
import {
  BannerProduct,
  BannerExportPayload,
  HeroBannerStyle,
  heroBannerStyleLabels,
} from "./banner-types";

export interface OfferBannerEngineProps {
  products: BannerProduct[];
  defaultColor?: string;
  brandingText?: string;
  currencySymbol?: string;
  onExport?: (payload: BannerExportPayload) => Promise<void> | void;
}

const STYLES: HeroBannerStyle[] = [
  "grand-launch",
  "bestseller-bundle",
  "flash-sale",
  "festive-bonanza",
  "deal-of-the-week",
  "free-shipping",
  "premium-arrival",
  "anniversary-celebration",
  "mega-clearance",
];

export default function OfferBannerEngine({
  products,
  defaultColor = "#14b8a6",
  brandingText = "",
  currencySymbol = "₹",
  onExport,
}: OfferBannerEngineProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];

  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [offerTag, setOfferTag] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [style, setStyle] = useState<HeroBannerStyle>("grand-launch");
  const [bannerColor, setBannerColor] = useState(
    defaultColor?.startsWith("#") ? defaultColor : "#14b8a6"
  );

  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleRender = useCallback((canvas: HTMLCanvasElement) => {
    setRenderedCanvas(canvas);
  }, []);

  function handleDownload() {
    if (!renderedCanvas || !selectedProduct) return;
    const dataUrl = renderedCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${selectedProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-banner.png`;
    link.click();
  }

  async function handleExportClick() {
    if (!renderedCanvas || !selectedProduct) return;
    setExporting(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        renderedCanvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Canvas export failed");

      if (onExport) {
        await onExport({
          blob,
          headline: headline || selectedProduct.title,
          subheadline,
          offerTag,
          ctaText,
          style,
          product: selectedProduct,
          bannerColor,
        });
      } else {
        handleDownload();
      }
    } finally {
      setExporting(false);
    }
  }

  if (!selectedProduct) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No products available to generate banners.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              1. Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({currencySymbol}{p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              2. Main Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. SPECIAL SALE, MEGA DEAL"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              3. Supporting Subtitle (Optional)
            </label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              placeholder="e.g. Exclusive online discount for this week only"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              4. Offer Tag / Badge (Optional)
            </label>
            <input
              type="text"
              value={offerTag}
              onChange={(e) => setOfferTag(e.target.value)}
              placeholder="e.g. LIMITED OFFER, HOT DEAL"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              5. Button Text
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Shop Now"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              6. Banner Theme Color
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                <input
                  type="color"
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value)}
                  className="absolute -inset-3 h-16 w-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                placeholder="#14B8A6"
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase shadow-sm focus:border-black focus:outline-none"
              />
              {defaultColor && bannerColor.toLowerCase() !== defaultColor.toLowerCase() && (
                <button
                  type="button"
                  onClick={() => setBannerColor(defaultColor)}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Reset Color
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              7. Banner Visual Style
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${
                    style === s
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                  }`}
                >
                  {heroBannerStyleLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-800">Live Preview</p>
          
          <BannerCanvas
            style={style}
            baseColor={bannerColor}
            productImageUrl={selectedProduct.imageUrl}
            productTitle={selectedProduct.title}
            productPrice={selectedProduct.price}
            productCompareAtPrice={selectedProduct.compareAtPrice}
            headline={headline || selectedProduct.title}
            subheadline={subheadline}
            offerText={offerTag}
            ctaText={ctaText}
            currencySymbol={currencySymbol}
            brandingText={brandingText}
            showDiscountBadge={true}
            onRender={handleRender}
          />

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExportClick}
              disabled={exporting}
              className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 disabled:opacity-50"
            >
              {exporting ? "Generating Banner..." : onExport ? "Export Banner" : "Download PNG Banner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}