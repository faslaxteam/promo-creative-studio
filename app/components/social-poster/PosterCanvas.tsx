"use client";

import { useEffect, useRef } from "react";
import { PosterAspectRatio, PosterDimensions, PosterProduct } from "./types";
import {
  adjustBrightness,
  drawRoundedPill,
  drawStoreBadge,
  safeHex,
  wrapText,
} from "./share-utils";

export const POSTER_DIMENSIONS: Record<PosterAspectRatio, PosterDimensions> = {
  "1:1": { width: 1080, height: 1080 },
  "2:3": { width: 1080, height: 1620 },
  "9:16": { width: 1080, height: 1920 },
};

export interface PosterCanvasProps {
  product: PosterProduct;
  ratio: PosterAspectRatio;
  bgColor: string;
  storeName: string;
  storeUrl: string;
  currencySymbol?: string;
  watermarkText?: string;
  showWatermark?: boolean;
  onRender?: (canvas: HTMLCanvasElement) => void;
}

function loadCORSImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export default function PosterCanvas({
  product,
  ratio,
  bgColor,
  storeName,
  storeUrl,
  currencySymbol = "₹",
  watermarkText = "",
  showWatermark = false,
  onRender,
}: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function drawPoster() {
      const canvas = canvasRef.current;
      if (!canvas || !product) return;
      const { width, height } = POSTER_DIMENSIONS[ratio];
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const baseColor = safeHex(bgColor);
      const lightShade = adjustBrightness(baseColor, 18);
      const darkShade = adjustBrightness(baseColor, -25);
      const podiumShade = adjustBrightness(baseColor, -12);

      let podiumRatio = 0.72;
      if (ratio === "1:1") podiumRatio = 0.75;
      if (ratio === "9:16") podiumRatio = 0.76;

      const podiumY = height * podiumRatio;

      const wallGrad = ctx.createLinearGradient(0, 0, width * 0.85, podiumY);
      wallGrad.addColorStop(0, lightShade);
      wallGrad.addColorStop(0.55, baseColor);
      wallGrad.addColorStop(1, darkShade);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, width, podiumY);

      const floorGrad = ctx.createLinearGradient(0, podiumY, 0, height);
      floorGrad.addColorStop(0, podiumShade);
      floorGrad.addColorStop(1, darkShade);
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, podiumY, width, height - podiumY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, podiumY, width, 3);

      let img: HTMLImageElement | null = null;
      const imgSource = product.imageUrl || (product as any).image;
      if (imgSource) {
        try {
          img = await loadCORSImage(imgSource);
        } catch {
          img = null;
        }
      }

      if (cancelled) return;

      if (ratio === "1:1") {
        const logoSize = 48;
        const logoX = 70;
        const logoY = 70;
        drawStoreBadge(ctx, logoX, logoY, logoSize);

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.font = "700 36px 'Inter', sans-serif, system-ui";
        ctx.fillText(storeName, logoX + logoSize + 20, logoY + 36);

        const leftColX = 75;
        const maxWidth = width * 0.43;

        let titleFontSize = 68;
        if (product.title.length > 25) titleFontSize = 54;
        else if (product.title.length > 15) titleFontSize = 62;

        const titleLineHeight = titleFontSize * 1.15;
        const titleStartY = 380;

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.font = `800 ${titleFontSize}px 'Inter', sans-serif, system-ui`;

        const lastTitleBaselineY = wrapText(
          ctx,
          product.title,
          leftColX,
          titleStartY,
          maxWidth,
          titleLineHeight,
          "left"
        );

        const priceY = lastTitleBaselineY + 115;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 86px 'Inter', sans-serif, system-ui";
        ctx.fillText(
          `${currencySymbol}${product.price.toLocaleString("en-IN")}`,
          leftColX,
          priceY
        );

        const displayUrl = storeUrl.replace(/^https?:\/\//, "");
        const pillW = Math.min(maxWidth + 40, 420);
        const pillH = 68;
        const pillY = priceY + 45;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2.5;
        drawRoundedPill(ctx, leftColX, pillY, pillW, pillH);
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.font = "600 20px 'Inter', sans-serif, system-ui";
        const maxTextWidth = pillW - 65;
        let finalUrl = displayUrl;
        while (ctx.measureText(finalUrl + "  →").width > maxTextWidth && finalUrl.length > 0) {
          finalUrl = finalUrl.slice(0, -1);
        }
        if (finalUrl !== displayUrl) {
          finalUrl = finalUrl.slice(0, -3) + "...";
        }
        ctx.fillText(finalUrl + "  →", leftColX + 24, pillY + 42);

        const maxProdW = width * 0.46;
        const maxProdH = height * 0.65;
        const aspect = img ? img.width / img.height : 1;
        let prodW = maxProdW;
        let prodH = prodW / aspect;

        if (prodH > maxProdH) {
          prodH = maxProdH;
          prodW = prodH * aspect;
        }

        const prodX = width * 0.5 + (maxProdW - prodW) / 2;
        const prodY = podiumY - prodH + 20;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = -25;
        ctx.shadowOffsetY = 30;
        if (img) {
          ctx.drawImage(img, prodX, prodY, prodW, prodH);
        } else {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(prodX, prodY, prodW, prodH);
        }
        ctx.restore();

        if (showWatermark && watermarkText) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.textAlign = "right";
          ctx.font = "500 22px 'Inter', sans-serif, system-ui";
          ctx.fillText(watermarkText, width - 70, height - 60);
        }
      } else if (ratio === "2:3") {
        const logoSize = 48;
        const logoX = 75;
        const logoY = 75;
        drawStoreBadge(ctx, logoX, logoY, logoSize);

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.font = "700 38px 'Inter', sans-serif, system-ui";
        ctx.fillText(storeName, logoX + logoSize + 22, logoY + 38);

        const titleY = 270;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";

        const fontSize = product.title.length > 22 ? 72 : 88;
        const lineH = fontSize * 1.15;
        ctx.font = `800 ${fontSize}px 'Inter', sans-serif, system-ui`;
        const lastLineY = wrapText(
          ctx,
          product.title,
          width / 2,
          titleY,
          width * 0.86,
          lineH,
          "center"
        );

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 70, lastLineY + 45);
        ctx.lineTo(width / 2 + 70, lastLineY + 45);
        ctx.stroke();

        const maxProdW = width * 0.62;
        const maxProdH = height * 0.42;
        const aspect = img ? img.width / img.height : 1;
        let prodW = maxProdW;
        let prodH = prodW / aspect;

        if (prodH > maxProdH) {
          prodH = maxProdH;
          prodW = prodH * aspect;
        }

        const prodX = (width - prodW) / 2;
        const prodY = podiumY - prodH + 15;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.52)";
        ctx.shadowBlur = 55;
        ctx.shadowOffsetX = -20;
        ctx.shadowOffsetY = 30;
        if (img) {
          ctx.drawImage(img, prodX, prodY, prodW, prodH);
        } else {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(prodX, prodY, prodW, prodH);
        }
        ctx.restore();

        const priceY = podiumY + 140;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "900 105px 'Inter', sans-serif, system-ui";
        ctx.fillText(
          `${currencySymbol}${product.price.toLocaleString("en-IN")}`,
          width / 2,
          priceY
        );

        const pillW = Math.min(width * 0.8, 640);
        const pillH = 76;
        const pillX = (width - pillW) / 2;
        const pillY = priceY + 60;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2.5;
        drawRoundedPill(ctx, pillX, pillY, pillW, pillH);
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "600 30px 'Inter', sans-serif, system-ui";
        ctx.fillText(storeUrl, width / 2, pillY + 48);

        if (showWatermark && watermarkText) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.font = "500 24px 'Inter', sans-serif, system-ui";
          ctx.fillText(watermarkText, width / 2, height - 70);
        }
      } else {
        const logoSize = 52;
        const logoX = 80;
        const logoY = 120;
        drawStoreBadge(ctx, logoX, logoY, logoSize);

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.font = "700 42px 'Inter', sans-serif, system-ui";
        ctx.fillText(storeName, logoX + logoSize + 24, logoY + 40);

        const titleY = 360;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";

        const fontSize = product.title.length > 22 ? 80 : 96;
        const lineH = fontSize * 1.15;
        ctx.font = `800 ${fontSize}px 'Inter', sans-serif, system-ui`;
        const lastLineY = wrapText(
          ctx,
          product.title,
          width / 2,
          titleY,
          width * 0.86,
          lineH,
          "center"
        );

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 80, lastLineY + 50);
        ctx.lineTo(width / 2 + 80, lastLineY + 50);
        ctx.stroke();

        const maxProdW = width * 0.7;
        const maxProdH = height * 0.46;
        const aspect = img ? img.width / img.height : 1;
        let prodW = maxProdW;
        let prodH = prodW / aspect;

        if (prodH > maxProdH) {
          prodH = maxProdH;
          prodW = prodH * aspect;
        }

        const prodX = (width - prodW) / 2;
        const prodY = podiumY - prodH + 20;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 65;
        ctx.shadowOffsetX = -20;
        ctx.shadowOffsetY = 35;
        if (img) {
          ctx.drawImage(img, prodX, prodY, prodW, prodH);
        } else {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(prodX, prodY, prodW, prodH);
        }
        ctx.restore();

        const priceY = podiumY + 160;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "900 118px 'Inter', sans-serif, system-ui";
        ctx.fillText(
          `${currencySymbol}${product.price.toLocaleString("en-IN")}`,
          width / 2,
          priceY
        );

        const pillW = Math.min(width * 0.82, 680);
        const pillH = 84;
        const pillX = (width - pillW) / 2;
        const pillY = priceY + 70;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2.5;
        drawRoundedPill(ctx, pillX, pillY, pillW, pillH);
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "600 32px 'Inter', sans-serif, system-ui";
        ctx.fillText(storeUrl, width / 2, pillY + 54);

        if (showWatermark && watermarkText) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.font = "500 24px 'Inter', sans-serif, system-ui";
          ctx.fillText(watermarkText, width / 2, height - 90);
        }
      }

      if (!cancelled && onRender) {
        onRender(canvas);
      }
    }

    void drawPoster();
    return () => {
      cancelled = true;
    };
  }, [
    product,
    ratio,
    bgColor,
    storeUrl,
    storeName,
    currencySymbol,
    watermarkText,
    showWatermark,
    onRender,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-xl shadow-xl transition-all ${
        ratio === "1:1"
          ? "aspect-square w-full max-w-[380px]"
          : ratio === "2:3"
          ? "aspect-[2/3] w-[280px]"
          : "aspect-[9/16] w-[260px]"
      }`}
    />
  );
}