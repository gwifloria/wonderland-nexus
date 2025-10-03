"use client";
import { useScroll, useSize } from "ahooks";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  TOC_OFFSET,
  TOC_SELECTOR,
  TocItem,
  computeTopsRelativeToScroller,
  pickActiveIndex,
} from "./utils";

export type UseTocOptions = {
  /** Sticky header offset (px). Default: 96 */
  offset?: number;
  /** Heading selector to collect. Default: 'h2[id], h3[id]' */
  selector?: string;
};

/**
 * TOC Data Hook - Pure logic for table of contents functionality.
 * - Creates and manages refs internally
 * - Computes heading positions relative to the scrollable ancestor
 * - Listens directly to the scroller's `scroll` event
 * - Returns only data and state, no UI components
 */
export const useTocData = (options?: UseTocOptions) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);

  const scroll = useScroll(scrollerRef);
  const size = useSize(containerRef);

  const offset = options?.offset ?? TOC_OFFSET;
  const selector = options?.selector ?? TOC_SELECTOR;

  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [tocPositions, setTocPositions] = useState<number[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");

  const container = containerRef.current;

  // Collect headings matching selector within container
  const collect = useCallback(() => {
    if (!container) return;
    const headings = Array.from(
      container.querySelectorAll<HTMLHeadingElement>(selector),
    );
    setTocItems(
      headings.map((h) => ({
        id: h.id,
        text: h.textContent || "",
        level: h.tagName === "H2" ? 2 : 3,
        el: h,
      })),
    );
  }, [container, selector]);

  useEffect(() => {
    collect();
  }, [collect]);

  // Compute positions of headings relative to scroller
  useEffect(() => {
    if (tocItems.length === 0) {
      setTocPositions([]);
      return;
    }

    const scrollerEl = scrollerRef.current;
    if (!scrollerEl) return;

    setTocPositions(computeTopsRelativeToScroller(tocItems, scrollerEl));
  }, [tocItems, scroll?.top, scrollerRef, size]);

  // Determine active heading based on scroll position and offset
  useEffect(() => {
    if (tocItems.length === 0 || tocPositions.length === 0) return;

    let rafId = 0;
    const scrollTop = scroll?.top ?? 0;

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const y = scrollTop + offset;
      const activeIndex = pickActiveIndex(tocPositions, y);
      const currentId = tocItems[activeIndex]?.id ?? tocItems[0].id;
      setActiveHeadingId((prev) => (prev === currentId ? prev : currentId));
    });

    return () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };
  }, [tocItems, tocPositions, scroll?.top, offset]);

  return {
    containerRef,
    scrollerRef,
    tocItems,
    activeHeadingId,
  };
};
