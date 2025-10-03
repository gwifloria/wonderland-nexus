import type { Components } from "react-markdown";

export type MarkdownSize = "default" | "compact";

/**
 * 创建可配置字号的 markdown components
 */
export function createMarkdownComponents(
  size: MarkdownSize = "default",
): Components {
  const sizeClasses = {
    default: {
      h1: "text-lg font-bold text-neutral-800 mb-4",
      h2: "text-md font-semibold text-neutral-700 mb-3 mt-6",
      h3: "text-base font-semibold text-neutral-700 mb-2 mt-4",
      h4: "text-sm font-medium text-neutral-600 mb-2",
      p: "text-sm text-neutral-600 mb-3 leading-relaxed",
      ul: "list-disc list-inside space-y-1 text-sm text-neutral-600 mb-3",
      li: "mb-1",
    },
    compact: {
      h1: "text-sm font-bold text-neutral-800 mb-3",
      h2: "text-sm font-semibold text-neutral-700 mb-2 mt-4",
      h3: "text-xs font-semibold text-neutral-700 mb-2 mt-3",
      h4: "text-xs font-medium text-neutral-600 mb-1",
      p: "text-xs text-neutral-600 mb-2 leading-relaxed",
      ul: "list-disc list-inside space-y-0.5 text-xs text-neutral-600 mb-2",
      li: "mb-0.5",
    },
  };

  const classes = sizeClasses[size];

  return {
    h1: ({ children, ...props }) => (
      <h1 className={classes.h1} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className={classes.h2} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className={classes.h3} {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className={classes.h4} {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className={classes.p} {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className={classes.ul} {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ...props }) => (
      <li className={classes.li} {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-neutral-700" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-neutral-600" {...props}>
        {children}
      </em>
    ),
    hr: () => <hr className="my-6 border-neutral-200" />,
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="rounded-md border-l-4 border-nepal-500/70 bg-neutral-50 px-4 py-3 my-5"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Special elements from mdxComponents
    a: ({ node, ...props }) => (
      <a {...props} className="no-underline hover:underline text-nepal-600" />
    ),
    code(props) {
      const { inline, className, children, ...rest } = props as any;
      if (inline) {
        return (
          <code className="rounded bg-rose-50/80 px-1 py-0.5 text-[0.9em] text-rose-600">
            {children}
          </code>
        );
      }
      return (
        <code className={(className || "") + " text-sm font-mono"} {...rest}>
          {children}
        </code>
      );
    },
    pre: ({ node, ...props }) => (
      <pre
        {...props}
        className="not-prose rounded-lg bg-neutral-100 text-sm leading-relaxed font-mono p-4 overflow-x-auto whitespace-pre-wrap break-words my-5 border border-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700/50 scrollbar-track-transparent"
      />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6 shadow-sm">
        <table
          {...props}
          className="min-w-full divide-y divide-neutral-300 border border-neutral-300 rounded-lg bg-white"
        />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead {...props} className="bg-rose-50/80" />
    ),
    tbody: ({ node, ...props }) => (
      <tbody {...props} className="divide-y divide-neutral-200 bg-white" />
    ),
    tr: ({ node, ...props }) => (
      <tr
        {...props}
        className="hover:bg-neutral-50/80 transition-colors duration-150"
      />
    ),
    th: ({ node, ...props }) => (
      <th
        {...props}
        className="px-3 py-3 text-left text-sm font-semibold text-neutral-900 border-r border-neutral-300 last:border-r-0 min-w-0"
      />
    ),
    td: ({ node, ...props }) => (
      <td
        {...props}
        className="px-3 py-3 text-sm text-neutral-700 border-r border-neutral-200 last:border-r-0 min-w-0 break-words"
      />
    ),
  };
}
