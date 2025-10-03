const express = require("express");
const Message = require("../../models/Message");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// ---- Rate limit: each IP at most 5 posts per minute ----
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please slow down." },
});

// ---- Very basic server-side HTML sanitizer (allow-list) ----
// NOTE: For production, prefer a battle-tested lib like `sanitize-html` or DOMPurify (JSDOM)
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
// drop inline event handlers like onClick=, onerror=, etc.
const DROP_ON_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

function sanitizeHtml(html) {
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
    if (!ALLOWED_TAGS.has(t)) return ""; // drop unknown opening tags but keep text contents
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

function extractPlainText(html) {
  return String(html)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// GET /apis/message/list  — Fetch messages (desc), simple pagination: ?limit=20&before=timestamp
router.get("/list", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const before = req.query.before ? Number(req.query.before) : null;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const filter = { deletedAt: { $exists: false } };
    if (!Number.isNaN(before) && before > 0) {
      filter.createdAt = { $lt: before };
    }
    if (q) {
      // simple case-insensitive search on raw HTML; escape regex specials
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.content = { $regex: esc, $options: "i" };
    }

    const messages = await Message.find(filter, "content createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("[messages:list]", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /apis/message/send  — Create a new (sanitized) rich-text message
router.post("/send", messageLimiter, async (req, res) => {
  try {
    const raw = typeof req.body?.content === "string" ? req.body.content : "";
    const clean = sanitizeHtml(raw);
    const plain = extractPlainText(clean);

    if (!plain) {
      return res.status(400).json({ error: "Content is required" });
    }
    if (clean.length > 10000) {
      return res.status(413).json({ error: "Content too long" });
    }

    const doc = new Message({ content: clean, createdAt: Date.now() });
    await doc.save();

    return res.json({
      _id: doc._id,
      content: doc.content,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("[messages:send]", err);
    return res.status(500).json({ error: "Failed to save message" });
  }
});

// GET /apis/message/:id — fetch a single message
router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "invalid id" });
    const doc = await Message.findOne(
      { _id: id, deletedAt: { $exists: false } },
      "content createdAt"
    ).lean();
    if (!doc) return res.status(404).json({ error: "not found" });
    return res.json(doc);
  } catch (err) {
    console.error("[messages:get]", err);
    return res.status(500).json({ error: "Failed to fetch message" });
  }
});

// DELETE /apis/message/:id — delete a message by id (soft delete)
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    if (!id) return res.status(400).json({ error: "invalid id" });
  }

  try {
    const doc = await Message.findByIdAndUpdate(id, {
      $set: { deletedAt: Date.now() },
    });
    if (!doc) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, _id: id });
  } catch (err) {
    console.error("[messages:delete]", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

// POST /apis/message/empty — delete all messages
router.post("/empty", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ message: "All messages deleted successfully" });
  } catch (err) {
    console.error("[messages:empty]", err);
    res.status(500).json({ error: "Failed to delete all messages" });
  }
});

module.exports = router;
