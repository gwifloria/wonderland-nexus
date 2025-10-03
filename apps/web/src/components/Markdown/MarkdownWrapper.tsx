"use client";
import { SWRShell } from "@/provider/SWRShell";
import matter from "gray-matter";
import "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import useSWR from "swr";
import { createMarkdownComponents } from "./MarkdownComponents";
import TocClient from "./TocClient";

// 通用的骨架屏组件
export function MarkdownSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-sand-200 rounded w-3/4"></div>
      <div className="h-4 bg-sand-200 rounded w-1/2"></div>
      <div className="h-4 bg-sand-200 rounded w-5/6"></div>
      <div className="h-4 bg-sand-200 rounded w-2/3"></div>
    </div>
  );
}

// 通用的空状态组件
export function MarkdownEmptyState({
  message = "No content available",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <p>{message}</p>
    </div>
  );
}

// 通用的Prose类名
const PROSE_CLASS =
  "prose prose-sm mx-auto max-w-none " +
  "prose-headings:font-semibold prose-headings:text-neutral-800 " +
  "prose-p:text-neutral-700 prose-p:leading-relaxed " +
  "prose-a:text-mint-600 hover:prose-a:text-mint-700 " +
  "prose-strong:text-neutral-800 prose-code:text-mint-600 " +
  "prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200";

// 日期格式化工具
const dtf = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function MarkdownWrapperShell({
  path,
  toc = true,
  size = "default",
  showLastUpdated = false,
}: {
  path?: string | null;
  toc?: boolean;
  size?: "default" | "compact";
  showLastUpdated?: boolean;
}) {
  return (
    <SWRShell>
      <MarkdownWrapper
        path={path}
        toc={toc}
        size={size}
        showLastUpdated={showLastUpdated}
      />
    </SWRShell>
  );
}

function MarkdownWrapper({
  path,
  toc = true,
  size = "default",
  showLastUpdated = false,
}: {
  path?: string | null;
  toc?: boolean;
  size?: "default" | "compact";
  showLastUpdated?: boolean;
}) {
  const activePath = path ?? null;

  // Fetch content and metadata using SWR
  const { data: contentData, error: contentError } = useSWR(
    activePath
      ? `/api/posts/content?path=${encodeURIComponent(activePath)}`
      : null,
  );

  const { data: commitInfo } = useSWR(
    activePath && showLastUpdated
      ? `/api/posts/metadata?path=${encodeURIComponent(activePath)}`
      : null,
  );

  if (!activePath) return <MarkdownEmptyState />;

  // Handle loading state
  if (!contentData && !contentError) {
    return <MarkdownSkeleton />;
  }

  // Handle error state
  if (contentError) {
    return <div className="text-sm text-red-600">Error loading content.</div>;
  }

  if (!contentData) {
    return <MarkdownSkeleton />;
  }

  // Parse front-matter
  const { content } = matter(contentData.content);

  return (
    <>
      <div data-markdown-container className="h-full flex w-full">
        <div
          data-markdown-scroller
          className={`overflow-auto min-w-0 ${toc ? "mr-16" : ""}`}
        >
          <article className={PROSE_CLASS}>
            {showLastUpdated && commitInfo?.updatedAt && (
              <div className="mb-4 text-xs text-neutral-500">
                最后更新：{dtf.format(new Date(commitInfo.updatedAt))}
              </div>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypePrism]}
              components={createMarkdownComponents(size)}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
        {toc && <TocClient />}
      </div>
    </>
  );
}

export default MarkdownWrapperShell;
