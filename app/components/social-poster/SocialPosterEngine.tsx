"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PosterCanvas from "./PosterCanvas";
import { PosterAspectRatio, PosterProduct, PosterExportPayload } from "./types";
import { normalizeUrl } from "./share-utils";

export interface SocialPosterEngineProps {
  products: PosterProduct[];
  storeName: string;
  storeUrl: string;
  defaultColor?: string;
  currencySymbol?: string;
  watermarkText?: string;
  showWatermark?: boolean;
  onExport?: (payload: PosterExportPayload) => Promise<void> | void;
  onShareProduct?: (product: PosterProduct) => void;
}

export default function SocialPosterEngine({
  products,
  storeName,
  storeUrl,
  defaultColor = "#14B8A6",
  currencySymbol = "₹",
  watermarkText = "",
  showWatermark = false,
  onExport,
  onShareProduct,
}: SocialPosterEngineProps) {
  const [selectedProduct, setSelectedProduct] = useState<PosterProduct | null>(
    products[0] ?? null
  );
  const [ratio, setRatio] = useState<PosterAspectRatio>("2:3");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterBgColor, setPosterBgColor] = useState<string>(
    defaultColor?.startsWith("#") ? defaultColor : "#14B8A6"
  );
  const [copiedNotification, setCopiedNotification] = useState(false);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasRender = useCallback((canvas: HTMLCanvasElement) => {
    activeCanvasRef.current = canvas;
  }, []);

  function handleShareClick() {
    if (!selectedProduct) return;
    if (onShareProduct) {
      onShareProduct(selectedProduct);
      return;
    }

    const cleanStoreUrl = normalizeUrl(storeUrl);
    const productPageUrl =
      selectedProduct.productUrl || `${cleanStoreUrl}/product/${selectedProduct.id}`;

    const text = `Check out *${selectedProduct.title}* for *${currencySymbol}${selectedProduct.price.toLocaleString(
      "en-IN"
    )}* on ${storeName}!\n\nBuy here: ${productPageUrl}`;

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  }

  function downloadCanvasImage() {
    const canvas = activeCanvasRef.current;
    if (!canvas || !selectedProduct) return;

    setError(null);
    setExporting(true);

    try {
      const fileName = `${selectedProduct.title
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}-${ratio.replace(":", "-")}-poster.png`;

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(
        "Direct export blocked by image security. Right-click the poster preview image and select 'Save Image As...' to download."
      );
    } finally {
      setExporting(false);
    }
  }

  if (!selectedProduct) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Publish at least one product to start generating posters.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="font-serif text-2xl font-bold text-gray-900">Social posters</h1>
      <p className="mt-1 text-sm text-gray-600">
        Generate premium shareable posters themed to your store colors or customized palette.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <label className="block text-sm font-medium text-gray-700">
            Product
            <select
              value={selectedProduct.id}
              onChange={(e) =>
                setSelectedProduct(
                  products.find((p) => p.id === e.target.value) ?? products[0]
                )
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-black focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({currencySymbol}{p.price})
                </option>
              ))}
            </select>
          </label>

          <div>
            <label className="text-sm font-medium text-gray-700">Format</label>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setRatio("2:3")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs sm:text-sm font-medium transition ${
                  ratio === "2:3"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                2:3 Poster
              </button>
              <button
                type="button"
                onClick={() => setRatio("1:1")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs sm:text-sm font-medium transition ${
                  ratio === "1:1"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                1:1 Feed
              </button>
              <button
                type="button"
                onClick={() => setRatio("9:16")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs sm:text-sm font-medium transition ${
                  ratio === "9:16"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                9:16 Story
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Poster Background Color
            </label>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-300 shadow-sm transition hover:border-gray-400">
                <input
                  type="color"
                  value={posterBgColor}
                  onChange={(e) => setPosterBgColor(e.target.value)}
                  className="absolute -inset-2 h-16 w-16 cursor-pointer border-0 p-0"
                  title="Choose any color from palette"
                />
              </div>
              <input
                type="text"
                value={posterBgColor}
                onChange={(e) => setPosterBgColor(e.target.value)}
                placeholder="#14B8A6"
                className="w-36 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-mono uppercase shadow-sm focus:border-black focus:outline-none"
              />
              {defaultColor &&
                posterBgColor.toLowerCase() !== defaultColor.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => setPosterBgColor(defaultColor)}
                    className="text-xs font-medium text-gray-500 underline hover:text-black"
                  >
                    Reset Color
                  </button>
                )}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={downloadCanvasImage}
              disabled={exporting}
              className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 disabled:opacity-50"
            >
              {exporting ? "Preparing Download..." : "Download Poster"}
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="w-full rounded-full border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Share Product Link
            </button>

            {copiedNotification && (
              <p className="text-center text-xs font-medium text-emerald-600">
                Product link copied to clipboard!
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <PosterCanvas
            product={selectedProduct}
            ratio={ratio}
            bgColor={posterBgColor}
            storeName={storeName}
            storeUrl={storeUrl}
            currencySymbol={currencySymbol}
            watermarkText={watermarkText}
            showWatermark={showWatermark}
            onRender={handleCanvasRender}
          />
        </div>
      </div>
    </div>
  );
}