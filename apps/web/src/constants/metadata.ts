import { Metadata } from "next/types";

// 基础网站信息
export const SITE_CONFIG = {
  name: "floria-wonderland",
  title: "Floria's Wonderland",
  description:
    "floria's personal portfolio showcasing React, Next.js, and front-end projects.",
  author: "Floria",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://floria-next-wonderland.vercel.app",
} as const;

// 默认元数据
export const defaultMetadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  authors: [{ name: SITE_CONFIG.author }],
  keywords: ["React", "Next.js", "TypeScript", "Portfolio", "Frontend"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
};

// 页面特定元数据
export const pageMetadata = {
  blog: {
    title: "Blog - Floria's Wonderland",
    description: "Technical articles and personal thoughts",
  },
  letters: {
    title: "Letters - Floria's Wonderland",
    description: "Personal correspondence and family communications",
    robots: { index: false, follow: true },
  },
  contact: {
    title: "Contact - Floria's Wonderland",
    description: "Get in touch with me",
  },
  lab: {
    title: "Lab - Floria's Wonderland",
    description: "Experiments and project showcase",
  },
} as const;
