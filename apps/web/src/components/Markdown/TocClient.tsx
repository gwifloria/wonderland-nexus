"use client";
import { useEffect } from "react";
import { useTocData } from "./useToc";

export default function TocClient() {
  const { containerRef, scrollerRef, tocItems, activeHeadingId } = useTocData();

  useEffect(() => {
    // 连接到 SSR 渲染的 DOM 元素
    const container = document.querySelector(
      "[data-markdown-container]",
    ) as HTMLElement;
    const scroller = document.querySelector(
      "[data-markdown-scroller]",
    ) as HTMLElement;

    if (container && scroller) {
      containerRef.current = container;
      scrollerRef.current = scroller;
    }
  }, [containerRef, scrollerRef]);

  if (!tocItems.length) return null;

  return (
    <div className="hidden lg:block">
      <aside className="sticky top-20 self-start pr-2">
        <nav
          aria-label="Table of contents"
          className="rounded-lg border border-neutral-200 bg-white/80 backdrop-blur p-3 shadow-sm"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            On this page
          </p>
          <ul className="space-y-1.5 text-[13px] leading-5">
            {tocItems.map((item) => {
              const isActive = item.id === activeHeadingId;
              const base =
                "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors";
              const state = isActive
                ? "bg-neutral-100 text-nepal-700"
                : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50";
              return (
                <li
                  key={item.id}
                  className={item.level === 3 ? "ml-3" : undefined}
                >
                  <a
                    href={`#${item.id}`}
                    className={`${base} ${state}`}
                    data-active={isActive ? "true" : undefined}
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive
                          ? "bg-nepal-600"
                          : "bg-neutral-300 group-hover:bg-neutral-500"
                      }`}
                    />
                    <span className="truncate">{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
