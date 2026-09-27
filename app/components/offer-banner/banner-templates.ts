import { SceneArgs } from "./banner-types";
import { lighten, withAlpha, textOn } from "./banner-theme";
import { drawProductPlate, drawConditionalDiscount } from "./banner-primitives";
import { renderFlow } from "./banner-flow";

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 560;

function fillCanvas(ctx: CanvasRenderingContext2D, style: (ctx: CanvasRenderingContext2D) => CanvasGradient | string) {
  ctx.save();
  ctx.fillStyle = style(ctx);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

export function renderNeoEditorial({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.addColorStop(0, theme.baseDeeper);
    g.addColorStop(0.45, theme.baseDeep);
    g.addColorStop(0.8, theme.base);
    g.addColorStop(1, lighten(theme.base, 14));
    return g;
  });

  ctx.save();
  const glow = ctx.createRadialGradient(1250, 280, 40, 1250, 280, 520);
  glow.addColorStop(0, withAlpha(theme.glow, 0.42));
  glow.addColorStop(0.6, withAlpha(theme.base, 0.18));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  const plateBox = { cx: 1230, cy: 275, w: 480, h: 420 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.55));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 20,
    plateBox.cy - plateBox.h / 2 + 10,
    62,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 90, y: 60, w: 740, h: 440 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 20, bg: withAlpha(theme.highlight, 0.22), fg: theme.highlight, paddingX: 24, caps: true, border: withAlpha(theme.highlight, 0.5) }]
        : []),
      { kind: "text", text: content.headline, size: 84, weight: 900, color: "#FFFFFF", lineHeight: 1.0, letterSpacing: -2 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 24, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 34, weight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 },
      { kind: "spacer", size: 6 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 64, color: theme.highlight, strikeColor: "rgba(255,255,255,0.55)", currency: priceInfo.currency },
      { kind: "spacer", size: 10 },
      { kind: "cta", text: content.cta, size: 24, bg: "#FFFFFF", fg: theme.ink, height: 64, icon: true },
    ],
    contentBox,
    "left",
    16,
    "center"
  );
}

export function renderCyberVelocity({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, CANVAS_HEIGHT, CANVAS_WIDTH, 0);
    g.addColorStop(0, theme.baseDeep);
    g.addColorStop(0.5, theme.base);
    g.addColorStop(1, lighten(theme.base, 18));
    return g;
  });

  ctx.save();
  ctx.fillStyle = withAlpha(theme.baseDeeper, 0.55);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(520, 0);
  ctx.lineTo(380, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = withAlpha(theme.highlight, 0.25);
  ctx.beginPath();
  ctx.moveTo(520, 0);
  ctx.lineTo(590, 0);
  ctx.lineTo(450, CANVAS_HEIGHT);
  ctx.lineTo(380, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const plateBox = { cx: 400, cy: 275, w: 420, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.55));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 20,
    plateBox.cy - plateBox.h / 2 + 10,
    58,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 860, y: 70, w: CANVAS_WIDTH - 860 - 80, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 19, bg: theme.highlight, fg: textOn(theme.highlight), paddingX: 22, caps: true }]
        : []),
      { kind: "text", text: content.headline, size: 76, weight: 900, color: "#FFFFFF", lineHeight: 0.98, letterSpacing: -1.5 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 58, color: "#FFFFFF", strikeColor: withAlpha(theme.highlight, 0.9), currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 23, bg: theme.highlight, fg: textOn(theme.highlight), height: 62, icon: true },
    ],
    contentBox,
    "left",
    16,
    "center"
  );
}

export function renderMinimalistAtelier({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createRadialGradient(1180, 260, 40, 1180, 260, 900);
    g.addColorStop(0, lighten(theme.base, 8));
    g.addColorStop(0.5, theme.baseDeep);
    g.addColorStop(1, theme.baseDeeper);
    return g;
  });

  const plateBox = { cx: 1230, cy: 260, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.45));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 20,
    plateBox.cy - plateBox.h / 2 + 20,
    54,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 100, y: 70, w: 760, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 18, bg: withAlpha(theme.highlight, 0.18), fg: theme.highlight, paddingX: 20, caps: true }]
        : []),
      { kind: "text", text: content.headline, size: 72, weight: 700, color: "#FFFFFF", lineHeight: 1.05, letterSpacing: -0.5 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.25 }]
        : []),
      { kind: "text", text: content.title, size: 28, weight: 400, color: "rgba(255,255,255,0.78)", lineHeight: 1.3 },
      { kind: "spacer", size: 8 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 52, color: theme.highlight, strikeColor: "rgba(255,255,255,0.5)", currency: priceInfo.currency },
      { kind: "spacer", size: 8 },
      { kind: "cta", text: content.cta, size: 22, bg: theme.highlight, fg: textOn(theme.highlight), height: 60, icon: false, border: "none", shadow: false },
    ],
    contentBox,
    "left",
    20,
    "center"
  );
}

export function renderBoldClearance({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.addColorStop(0, theme.baseDeeper);
    g.addColorStop(0.4, theme.baseDeep);
    g.addColorStop(0.75, theme.base);
    g.addColorStop(1, theme.highlight);
    return g;
  });

  const plateBox = { cx: 420, cy: 260, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.6));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 10,
    plateBox.cy - plateBox.h / 2 + 20,
    68,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 900, y: 50, w: CANVAS_WIDTH - 900 - 70, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 22, bg: theme.highlight, fg: textOn(theme.highlight), paddingX: 24, caps: true }]
        : []),
      { kind: "text", text: content.headline, size: 92, weight: 900, color: "#FFFFFF", lineHeight: 0.92, letterSpacing: -3 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 24, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.15 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.15 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 66, color: "#FFFFFF", strikeColor: withAlpha(theme.highlight, 0.95), currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 26, bg: theme.highlight, fg: textOn(theme.highlight), height: 68, icon: true },
    ],
    contentBox,
    "left",
    14,
    "center"
  );
}

export function renderGlassmorphism({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.addColorStop(0, theme.baseDeeper);
    g.addColorStop(0.5, theme.baseDeep);
    g.addColorStop(1, theme.base);
    return g;
  });

  const plateBox = { cx: 1220, cy: 280, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.55));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx - plateBox.w / 2 + 30,
    plateBox.cy - plateBox.h / 2 + 30,
    54,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 80, y: 70, w: 780, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 19, bg: "rgba(255,255,255,0.16)", fg: "#FFFFFF", paddingX: 24, caps: true, border: "rgba(255,255,255,0.3)" }]
        : []),
      { kind: "text", text: content.headline, size: 76, weight: 800, color: "#FFFFFF", lineHeight: 1.0, letterSpacing: -1.5 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.25 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 58, color: theme.highlight, strikeColor: "rgba(255,255,255,0.55)", currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 22, bg: "rgba(255,255,255,0.95)", fg: theme.ink, height: 62, icon: true },
    ],
    contentBox,
    "left",
    18,
    "center"
  );
}

export function renderArchitecturalDiagonal({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => theme.baseDeeper);

  ctx.save();
  const g1 = ctx.createLinearGradient(0, 0, 800, CANVAS_HEIGHT);
  g1.addColorStop(0, theme.base);
  g1.addColorStop(1, theme.highlight);
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(820, 0);
  ctx.lineTo(680, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.ink;
  ctx.beginPath();
  ctx.moveTo(900, 0);
  ctx.lineTo(CANVAS_WIDTH, 0);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(760, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const plateBox = { cx: 380, cy: 260, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.6));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 20,
    plateBox.cy - plateBox.h / 2 + 20,
    58,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 960, y: 70, w: CANVAS_WIDTH - 960 - 70, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 19, bg: withAlpha(theme.highlight, 0.25), fg: theme.highlight, paddingX: 22, caps: true, border: withAlpha(theme.highlight, 0.5) }]
        : []),
      { kind: "text", text: content.headline, size: 80, weight: 900, color: "#FFFFFF", lineHeight: 0.96, letterSpacing: -2 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 60, color: theme.highlight, strikeColor: "rgba(255,255,255,0.5)", currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 23, bg: theme.highlight, fg: textOn(theme.highlight), height: 62, icon: true },
    ],
    contentBox,
    "left",
    16,
    "center"
  );
}

export function renderMidnightGlow({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createRadialGradient(1200, 300, 40, 1200, 300, 950);
    g.addColorStop(0, lighten(theme.base, 18));
    g.addColorStop(0.35, theme.base);
    g.addColorStop(0.7, theme.baseDeep);
    g.addColorStop(1, theme.baseDeeper);
    return g;
  });

  const plateBox = { cx: 1200, cy: 250, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.65));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 10,
    plateBox.cy - plateBox.h / 2 + 20,
    56,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 90, y: 70, w: 740, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 19, bg: "rgba(255,255,255,0.15)", fg: "#FFFFFF", paddingX: 24, caps: true, border: "rgba(255,255,255,0.25)" }]
        : []),
      { kind: "text", text: content.headline, size: 78, weight: 900, color: "#FFFFFF", lineHeight: 0.98, letterSpacing: -2 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 58, color: theme.highlight, strikeColor: "rgba(255,255,255,0.55)", currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 23, bg: theme.highlight, fg: textOn(theme.highlight), height: 62, icon: true },
    ],
    contentBox,
    "left",
    16,
    "center"
  );
}

export function renderOrganicSculptural({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.addColorStop(0, theme.baseDeep);
    g.addColorStop(0.4, theme.base);
    g.addColorStop(0.8, lighten(theme.base, 16));
    g.addColorStop(1, theme.highlight);
    return g;
  });

  const plateBox = { cx: 420, cy: 260, w: 440, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.55));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 20,
    plateBox.cy - plateBox.h / 2 + 20,
    56,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 900, y: 70, w: CANVAS_WIDTH - 900 - 80, h: 420 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 19, bg: "rgba(255,255,255,0.2)", fg: "#FFFFFF", paddingX: 24, caps: true, border: "rgba(255,255,255,0.3)" }]
        : []),
      { kind: "text", text: content.headline, size: 76, weight: 800, color: "#FFFFFF", lineHeight: 1.02, letterSpacing: -1 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.25 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 400, color: "rgba(255,255,255,0.85)", lineHeight: 1.3 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 58, color: "#FFFFFF", strikeColor: withAlpha(theme.highlight, 0.9), currency: priceInfo.currency },
      { kind: "cta", text: content.cta, size: 23, bg: "rgba(255,255,255,0.95)", fg: theme.ink, height: 64, icon: true, border: "none" },
    ],
    contentBox,
    "left",
    18,
    "center"
  );
}

export function renderUrbanCommerce({ ctx, img, theme, content, priceInfo, showDiscountBadge }: SceneArgs) {
  fillCanvas(ctx, () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.addColorStop(0, theme.baseDeeper);
    g.addColorStop(0.35, theme.baseDeep);
    g.addColorStop(0.7, theme.base);
    g.addColorStop(1, lighten(theme.base, 10));
    return g;
  });

  const plateBox = { cx: 1250, cy: 250, w: 460, h: 360 };
  drawProductPlate(ctx, img, plateBox, withAlpha(theme.highlight, 0.6));

  drawConditionalDiscount(
    ctx,
    priceInfo,
    plateBox.cx + plateBox.w / 2 - 10,
    plateBox.cy - plateBox.h / 2 + 10,
    58,
    theme.highlight,
    textOn(theme.highlight),
    "OFF",
    showDiscountBadge
  );

  const contentBox = { x: 90, y: 60, w: 780, h: 440 };
  renderFlow(
    ctx,
    [
      ...(content.offer
        ? [{ kind: "pill" as const, text: content.offer, size: 18, bg: theme.highlight, fg: textOn(theme.highlight), paddingX: 22, caps: true }]
        : []),
      { kind: "text", text: content.headline, size: 78, weight: 900, color: "#FFFFFF", lineHeight: 0.98, letterSpacing: -1.5 },
      ...(content.sub
        ? [{ kind: "text" as const, text: content.sub, size: 22, weight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.2 }]
        : []),
      { kind: "text", text: content.title, size: 30, weight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 },
      { kind: "spacer", size: 4 },
      { kind: "price", price: priceInfo.price, compareAt: priceInfo.compareAt, size: 60, color: theme.highlight, strikeColor: "rgba(255,255,255,0.55)", currency: priceInfo.currency },
      { kind: "spacer", size: 6 },
      { kind: "cta", text: content.cta, size: 24, bg: theme.highlight, fg: textOn(theme.highlight), height: 64, icon: true },
    ],
    contentBox,
    "left",
    16,
    "center"
  );
}