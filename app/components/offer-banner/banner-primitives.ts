export const FONT_STACK =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function iconChevronRight(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.16);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, cy - size * 0.42);
  ctx.lineTo(cx + size * 0.3, cy);
  ctx.lineTo(cx - size * 0.22, cy + size * 0.42);
  ctx.stroke();
  ctx.restore();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

export function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number
) {
  if (!img) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(cx - maxW / 2, cy - maxH / 2, maxW, maxH);
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 3;
    const s = Math.min(maxW, maxH);
    ctx.beginPath();
    ctx.arc(cx - s * 0.16, cy - s * 0.14, s * 0.09, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.32, cy + s * 0.2);
    ctx.lineTo(cx - s * 0.06, cy - s * 0.06);
    ctx.lineTo(cx + s * 0.1, cy + s * 0.08);
    ctx.lineTo(cx + s * 0.32, cy - s * 0.14);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const naturalAspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height) || 1;
  let w = maxW;
  let h = w / naturalAspect;
  if (h > maxH) {
    h = maxH;
    w = h * naturalAspect;
  }
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

export function drawProductPlate(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  box: { cx: number; cy: number; w: number; h: number },
  strokeColor: string
) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(box.cx, box.cy + box.h * 0.52, box.w * 0.35, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  const w = box.w, h = box.h, x = box.cx - w / 2, y = box.cy - h / 2;
  const r = Math.min(28, Math.min(w, h) * 0.09);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();
  drawContainedImage(ctx, img, box.cx, box.cy, w * 0.92, h * 0.92);
  ctx.restore();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

export function computeDiscountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price || price <= 0) return null;
  const pct = Math.round((1 - price / compareAt) * 100);
  return pct > 0 ? pct : null;
}

export function drawDiscountBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  percent: number,
  bg: string,
  fg: string,
  offLabel: string
) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  starPath(ctx, cx, cy, radius, radius * 0.8, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = "900 " + Math.round(radius * 0.48) + "px " + FONT_STACK;
  ctx.fillText(percent + "%", cx, cy + radius * 0.12);
  ctx.font = "800 " + Math.round(radius * 0.22) + "px " + FONT_STACK;
  ctx.fillText(offLabel.toUpperCase(), cx, cy + radius * 0.42);
  ctx.restore();
}

export function drawConditionalDiscount(
  ctx: CanvasRenderingContext2D,
  priceInfo: { price: number; compareAt: number | null },
  cx: number,
  cy: number,
  radius: number,
  bg: string,
  fg: string,
  offLabel: string,
  show: boolean
) {
  if (!show) return;
  const pct = computeDiscountPercent(priceInfo.price, priceInfo.compareAt);
  if (pct === null) return;
  drawDiscountBadge(ctx, cx, cy, radius, pct, bg, fg, offLabel);
}