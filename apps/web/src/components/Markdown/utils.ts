import { CatKey } from "@/types/blog";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function catStyles(cat: CatKey) {
  const isByteNotes = cat === "ByteNotes";
  return {
    dot: isByteNotes ? "bg-nepal-300/70" : "bg-rose-300/70",
    bar: isByteNotes ? "bg-nepal-300/70" : "bg-rose-300/70",
    mainAccent: isByteNotes ? "bg-nepal-300/40" : "bg-rose-300/40",
  } as const;
}
export const textFetcher = (url: string) => fetch(url).then((r) => r.text());

// src/utils/dom.ts
export function getScrollParent(el: HTMLElement | null): HTMLElement {
  if (!el) return document.documentElement;
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY, overflow } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflow))
      return node;
    node = node.parentElement;
  }
  return document.documentElement;
}
// src/app/blog/toc/types.ts
export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
  el: HTMLHeadingElement;
};

export const TOC_SELECTOR = "h2[id], h3[id]";
export const TOC_OFFSET = 100; // sticky 头部偏移，可按页面微调

export function computeTopsRelativeToScroller(
  items: TocItem[],
  scroller: HTMLElement,
): number[] {
  const sRect = scroller.getBoundingClientRect();
  return items.map(
    (it) => it.el.getBoundingClientRect().top - sRect.top + scroller.scrollTop,
  );
}
// src/app/blog/toc/scrollspy.ts
export function pickActiveIndex(positions: number[], y: number): number {
  let idx = 0;
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] <= y + 1)
      idx = i; // +1 避免浮点抖动
    else break;
  }
  return idx;
}
