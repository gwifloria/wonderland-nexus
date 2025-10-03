const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "span",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "h2",
  "h3",
]);

const DROP_ON_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = String(html);

  // remove scripts & styles entirely
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // strip on* attributes
  out = out.replace(DROP_ON_ATTR, "");

  // allow-list opening tags; normalize <a> attributes
  out = out.replace(/<([^>\s\/]+)([^>]*)>/gi, (m, tag, attrs) => {
    const t = String(tag).toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return "";
    if (t !== "a") return `<${t}>`;

    // only keep safe http/https href
    const hrefMatch = attrs.match(
      /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i
    );
    const href = hrefMatch
      ? (hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || "").trim()
      : "";
    const safeHref = /^https?:\/\//i.test(href) ? href : "#";
    return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">`;
  });

  // close tags: drop closing for disallowed tags
  out = out.replace(/<\/([^>]+)>/gi, (m, tag) =>
    ALLOWED_TAGS.has(String(tag).toLowerCase()) ? m : ""
  );

  // collapse empty <p>
  out = out.replace(/<p>\s*<\/p>/g, "");
  return out.trim();
}

export function extractPlainText(html: string): string {
  return String(html)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function getRateLimit(
  ip: string
): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  const current = requestCounts.get(ip);

  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: maxRequests - current.count };
}
