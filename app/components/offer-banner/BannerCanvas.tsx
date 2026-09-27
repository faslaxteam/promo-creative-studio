"use client";

import { useEffect, useRef, useState } from "react";
import { HeroBannerStyle, SceneArgs } from "./banner-types";
import { buildTheme, DEFAULT_BASE_COLOR } from "./banner-theme";
import { FONT_STACK, loadImage } from "./banner-primitives";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  renderNeoEditorial,
  renderCyberVelocity,
  renderMinimalistAtelier,
  renderBoldClearance,
  renderGlassmorphism,
  renderArchitecturalDiagonal,
  renderMidnightGlow,
  renderOrganicSculptural,
  renderUrbanCommerce,
} from "./banner-templates";

export interface BannerCanvasProps {
  style: HeroBannerStyle;
  baseColor?: string;
  productImageUrl: string | null;
  productTitle?: string;
  productPrice?: number;
  productCompareAtPrice?: number | null;
  headline: string;
  subheadline?: string;
  ctaText: string;
  currencySymbol?: string;
  offerText?: string;
  brandingText?: string;
  showDiscountBadge?: boolean;
  onRender?: (canvas: HTMLCanvasElement) => void;
}

export default function BannerCanvas({
  style,
  baseColor = DEFAULT_BASE_COLOR,
  productImageUrl,
  productTitle = "",
  productPrice = 0,
  productCompareAtPrice = null,
  headline,
  subheadline,
  ctaText,
  currencySymbol = "₹",
  offerText,
  brandingText,
  showDiscountBadge = true,
  onRender,
}: BannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      let img: HTMLImageElement | null = null;
      if (productImageUrl) {
        setProcessingImage(true);
        try {
          img = await loadImage(productImageUrl);
        } catch {
          img = null;
        } finally {
          if (!cancelled) setProcessingImage(false);
        }
      }

      if (cancelled) return;

      const theme = buildTheme(baseColor);
      const content = {
        headline: (headline || "").trim(),
        title: (productTitle || "").trim(),
        sub: (subheadline || "").trim(),
        cta: (ctaText || "Shop Now").trim(),
        offer: (offerText || "").trim(),
      };
      const priceInfo = { price: productPrice, compareAt: productCompareAtPrice, currency: currencySymbol };
      const scene: SceneArgs = { ctx, img, theme, content, priceInfo, showDiscountBadge };

      switch (style) {
        case "grand-launch": renderNeoEditorial(scene); break;
        case "bestseller-bundle": renderCyberVelocity(scene); break;
        case "flash-sale": renderMinimalistAtelier(scene); break;
        case "festive-bonanza": renderBoldClearance(scene); break;
        case "deal-of-the-week": renderGlassmorphism(scene); break;
        case "free-shipping": renderArchitecturalDiagonal(scene); break;
        case "premium-arrival": renderMidnightGlow(scene); break;
        case "anniversary-celebration": renderOrganicSculptural(scene); break;
        case "mega-clearance": renderUrbanCommerce(scene); break;
        default: renderNeoEditorial(scene);
      }

      if (brandingText && brandingText.trim()) {
        ctx.save();
        ctx.font = "600 15px " + FONT_STACK;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.textAlign = "right";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(brandingText.trim(), CANVAS_WIDTH - 40, CANVAS_HEIGHT - 24);
        ctx.restore();
      }

      if (!cancelled) onRender?.(canvas);
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [
    style,
    baseColor,
    productImageUrl,
    productTitle,
    productPrice,
    productCompareAtPrice,
    headline,
    subheadline,
    ctaText,
    currencySymbol,
    offerText,
    brandingText,
    showDiscountBadge,
    onRender,
  ]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
      <canvas ref={canvasRef} className="h-auto w-full object-contain" />
      {processingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white backdrop-blur-sm">
          Rendering image preview...
        </div>
      )}
    </div>
  );
}