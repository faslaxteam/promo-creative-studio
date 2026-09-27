import { FlowItem, FlowMeasure } from "./banner-types";
import { FONT_STACK, roundRectPath, iconChevronRight } from "./banner-primitives";

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  if (!text) return [];
  ctx.save();
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

export function filterFlow(items: FlowItem[]): FlowItem[] {
  return items.filter((item) => {
    if (item.kind === "text" || item.kind === "pill") return item.text.trim().length > 0;
    if (item.kind === "cta") return item.text.trim().length > 0;
    if (item.kind === "price") return item.price > 0 || (item.compareAt ?? 0) > 0;
    if (item.kind === "spacer") return item.size > 0;
    return true;
  });
}

export function measureFlowItem(ctx: CanvasRenderingContext2D, item: FlowItem, maxWidth: number, scale: number): FlowMeasure {
  switch (item.kind) {
    case "text": {
      const size = item.size * scale;
      const font = item.weight + " " + size + "px " + FONT_STACK;
      const txt = item.caps ? item.text.toUpperCase() : item.text;
      const lines = wrapText(ctx, txt, maxWidth, font);
      const lh = (item.lineHeight ?? 1.06) * size;
      return { height: Math.max(lines.length, 1) * lh, lines, lineHeight: lh };
    }
    case "pill": {
      const size = item.size * scale;
      return { height: size * 2.1 };
    }
    case "price": {
      const size = item.size * scale;
      return { height: size * 1.1 };
    }
    case "cta": {
      return { height: item.height * scale };
    }
    case "spacer": {
      return { height: item.size * scale };
    }
  }
}

export function fitFlow(ctx: CanvasRenderingContext2D, items: FlowItem[], maxWidth: number, maxHeight: number, gap: number) {
  let scale = 1;
  for (let i = 0; i < 10; i++) {
    const measured = items.map((it) => measureFlowItem(ctx, it, maxWidth, scale));
    const total = measured.reduce((a, m) => a + m.height, 0) + gap * Math.max(0, items.length - 1);
    if (total <= maxHeight || scale <= 0.5) return { scale, measured, total };
    scale -= 0.06;
  }
  const measured = items.map((it) => measureFlowItem(ctx, it, maxWidth, 0.5));
  const total = measured.reduce((a, m) => a + m.height, 0) + gap * Math.max(0, items.length - 1);
  return { scale: 0.5, measured, total };
}

export function drawFlow(
  ctx: CanvasRenderingContext2D,
  items: FlowItem[],
  measured: FlowMeasure[],
  box: { x: number; y: number; w: number; h: number },
  align: CanvasTextAlign,
  scale: number,
  gap: number,
  totalHeight: number,
  verticalAlign: "top" | "center" = "center"
) {
  const anchorX = align === "left" ? box.x : align === "right" ? box.x + box.w : box.x + box.w / 2;
  let cursorY = box.y + (verticalAlign === "center" ? Math.max(0, (box.h - totalHeight) / 2) : 0);

  items.forEach((item, idx) => {
    const m = measured[idx];

    if (item.kind === "text") {
      const size = item.size * scale;
      ctx.save();
      ctx.font = item.weight + " " + size + "px " + FONT_STACK;
      ctx.fillStyle = item.color;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 10;
      const lh = m.lineHeight ?? size * 1.06;
      (m.lines || []).forEach((line, li) => {
        ctx.fillText(line, anchorX, cursorY + lh * (li + 1) - lh * 0.22);
      });
      ctx.restore();
    } else if (item.kind === "pill") {
      const size = item.size * scale;
      const padX = item.paddingX * scale;
      const h = m.height;
      ctx.save();
      ctx.font = "800 " + size + "px " + FONT_STACK;
      const label = item.caps ? item.text.toUpperCase() : item.text;
      const textW = ctx.measureText(label).width;
      const w = textW + padX * 2;
      const bx = align === "left" ? anchorX : align === "right" ? anchorX - w : anchorX - w / 2;
      ctx.fillStyle = item.bg;
      roundRectPath(ctx, bx, cursorY, w, h, h / 2);
      ctx.fill();
      if (item.border) {
        ctx.strokeStyle = item.border;
        ctx.lineWidth = 1.5;
        roundRectPath(ctx, bx, cursorY, w, h, h / 2);
        ctx.stroke();
      }
      ctx.fillStyle = item.fg;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, bx + padX, cursorY + h / 2 + 1);
      ctx.restore();
    } else if (item.kind === "price") {
      const size = item.size * scale;
      ctx.save();
      ctx.font = "900 " + size + "px " + FONT_STACK;
      const mainTxt = item.currency + Math.round(item.price).toLocaleString("en-IN");
      const mainW = ctx.measureText(mainTxt).width;
      const hasCompare = !!item.compareAt && item.compareAt > item.price;
      let compTxt = "";
      let compW = 0;
      if (hasCompare) {
        ctx.font = "700 " + size * 0.48 + "px " + FONT_STACK;
        compTxt = item.currency + Math.round(item.compareAt as number).toLocaleString("en-IN");
        compW = ctx.measureText(compTxt).width;
      }
      const gapW = hasCompare ? size * 0.32 : 0;
      const totalW = mainW + gapW + compW;
      const bx = align === "left" ? anchorX : align === "right" ? anchorX - totalW : anchorX - totalW / 2;
      const baselineY = cursorY + size * 0.86;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = item.color;
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 10;
      ctx.font = "900 " + size + "px " + FONT_STACK;
      ctx.fillText(mainTxt, bx, baselineY);
      if (hasCompare) {
        const cx0 = bx + mainW + gapW;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.66)";
        ctx.font = "700 " + size * 0.48 + "px " + FONT_STACK;
        ctx.fillText(compTxt, cx0, baselineY - size * 0.02);
        ctx.strokeStyle = item.strikeColor;
        ctx.lineWidth = Math.max(2, size * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx0 - 2, baselineY - size * 0.18);
        ctx.lineTo(cx0 + compW + 2, baselineY - size * 0.18);
        ctx.stroke();
      }
      ctx.restore();
    } else if (item.kind === "cta") {
      const size = item.size * scale;
      const h = m.height;
      ctx.save();
      ctx.font = "800 " + size + "px " + FONT_STACK;
      const textW = ctx.measureText(item.text).width;
      const padX = size * 1.4;
      const iconSpace = item.icon ? size * 1.1 : 0;
      const w = textW + iconSpace + padX * 2;
      const bx = align === "left" ? anchorX : align === "right" ? anchorX - w : anchorX - w / 2;
      ctx.fillStyle = item.bg;
      if (item.shadow !== false) {
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;
      }
      roundRectPath(ctx, bx, cursorY, w, h, h / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      if (item.border) {
        ctx.strokeStyle = item.border;
        ctx.lineWidth = 1.5;
        roundRectPath(ctx, bx, cursorY, w, h, h / 2);
        ctx.stroke();
      }
      ctx.fillStyle = item.fg;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(item.text, bx + padX, cursorY + h / 2 + 1);
      if (item.icon) {
        iconChevronRight(ctx, bx + w - padX - size * 0.28, cursorY + h / 2, size * 0.9, item.fg);
      }
      ctx.restore();
    }
    cursorY += m.height + gap;
  });
}

export function renderFlow(
  ctx: CanvasRenderingContext2D,
  rawItems: FlowItem[],
  box: { x: number; y: number; w: number; h: number },
  align: CanvasTextAlign,
  gap = 20,
  verticalAlign: "top" | "center" = "center"
) {
  const items = filterFlow(rawItems);
  if (items.length === 0) return;
  const { scale, measured, total } = fitFlow(ctx, items, box.w, box.h, gap);
  drawFlow(ctx, items, measured, box, align, scale, gap, total, verticalAlign);
}