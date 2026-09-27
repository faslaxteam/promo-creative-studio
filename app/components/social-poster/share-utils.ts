export const DEFAULT_POSTER_COLOR = "#14B8A6";

export function safeHex(hex: string | undefined | null): string {
  if (hex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    return hex;
  }
  return DEFAULT_POSTER_COLOR;
}

export function normalizeUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export function hexToRgb(hex: string) {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) {
    return { r: 20, g: 184, b: 166 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  try {
    const validHex = safeHex(hex);
    const { r, g, b } = hexToRgb(validHex);
    const compute = (channel: number) => {
      const val = channel + (255 * percent) / 100;
      return Math.min(255, Math.max(0, Math.round(val)));
    };
    const nr = compute(r).toString(16).padStart(2, "0");
    const ng = compute(g).toString(16).padStart(2, "0");
    const nb = compute(b).toString(16).padStart(2, "0");
    return `#${nr}${ng}${nb}`;
  } catch {
    return hex;
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function drawStoreBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size * 0.26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawRoundedPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const r = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "center"
): number {
  ctx.textAlign = align;
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
  return currentY;
}