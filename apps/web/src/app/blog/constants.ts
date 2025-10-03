// Import blog types from centralized type definitions
import type { CatKey, BlogCategory, CateGroup, GitHubItem } from "@/types/blog";

// Re-export types for backward compatibility
export type { CatKey, BlogCategory, CateGroup, GitHubItem };

export const categories: readonly BlogCategory[] = [
  { key: "ByteNotes", label: "ByteNotes" },
  { key: "Murmurs", label: "Murmurs" },
];
// -----------------------------
// UI constants
// -----------------------------

export const PROSE_CLASS = [
  "prose prose-slate max-w-none leading-relaxed",
  "prose-headings:font-medium prose-headings:text-neutral-800 ",
  "prose-h1:mt-0 prose-h1:text-2xl md:prose-h1:text-3xl",
  "prose-h2:pt-4 prose-h2:mt-8 prose-h2:border-t prose-h2:border-neutral-200",
  "prose-a:no-underline hover:prose-a:underline prose-a:text-nepal-600 ",
  "prose-code:bg-neutral-100 prose-code:text-milktea-600 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-['']",
  "prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm",
  "prose-img:rounded-md prose-blockquote:border-nepal-500",
].join(" ");

// -----------------------------
// Date formatter (memoized instance)
// -----------------------------
export const dtf = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// -----------------------------
// Utility functions
// -----------------------------

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
