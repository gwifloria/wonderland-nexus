import { MailMessage, Thread } from "@wonderland/database";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  fetchAttachments,
  fetchMessagesByContact,
  getAddresses,
  getToken,
} from "./graphClient";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const sha1 = (s: string) =>
  crypto
    .createHash("sha1")
    .update(s || "")
    .digest("hex");

const stripTracking = (html = "") =>
  html.replace(/<img[^>]+width=["']?1["']?[^>]*height=["']?1["']?[^>]*>/gi, "");

const foldQuotes = (html = "") =>
  html.replace(
    /<blockquote[\s\S]*?<\/blockquote>/gi,
    (m) => `<details><summary>展开历史</summary>${m}</details>`
  );

const placeholderCid = (html = "") =>
  html.replace(
    /<img([^>]+)src=["']cid:([^"']+)["']([^>]*)>/gi,
    (_m, pre, cid, post) =>
      `<img data-cid="${String(cid).replace(
        /["'<>]/g,
        ""
      )}" alt="[内联图片]" class="mail-cid-placeholder" ${pre || ""} ${post || ""}/>`
  );

async function uploadAttachmentToCloudinary(
  attachment: any,
  messageId: string,
  index: number
): Promise<string | null> {
  try {
    if (!attachment.contentBytes) {
      console.warn(`Attachment ${index} has no content bytes`);
      return null;
    }

    const contentType = attachment.contentType || "image/png";
    const dataUrl = `data:${contentType};base64,${attachment.contentBytes}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "mail-images",
      public_id: `${messageId}_${index}_${Date.now()}`,
      resource_type: "image",
      overwrite: false,
    });

    return result.secure_url;
  } catch (error: any) {
    console.error(
      `Failed to upload attachment ${index} to Cloudinary:`,
      error.message
    );
    return null;
  }
}

async function processCidImages(
  html: string,
  attachments: any[],
  messageId: string
): Promise<string> {
  if (!html || !attachments || attachments.length === 0) {
    return html;
  }

  const cidRegex = /<img([^>]+)src=["']cid:([^"']+)["']([^>]*)>/gi;
  const cids: Array<{
    fullMatch: string;
    pre: string;
    cid: string;
    post: string;
  }> = [];
  let match;
  while ((match = cidRegex.exec(html))) {
    cids.push({
      fullMatch: match[0],
      pre: match[1],
      cid: match[2],
      post: match[3],
    });
  }

  if (cids.length === 0) {
    return html;
  }

  const cidMap = new Map();
  attachments.forEach((att) => {
    if (att.isInline && att.contentId) {
      const cleanCid = att.contentId.replace(/^<|>$/g, "");
      cidMap.set(cleanCid, att);
    }
  });

  let updatedHtml = html;
  let uploadIndex = 0;

  for (const { fullMatch, pre, cid, post } of cids) {
    const cleanCid = cid.trim();
    const attachment = cidMap.get(cleanCid);

    if (attachment) {
      const cloudinaryUrl = await uploadAttachmentToCloudinary(
        attachment,
        messageId,
        uploadIndex++
      );

      if (cloudinaryUrl) {
        const newImg = `<img${pre || ""} src="${cloudinaryUrl}"${post || ""}>`;
        updatedHtml = updatedHtml.replace(fullMatch, newImg);
        console.log(`✓ Replaced cid:${cleanCid} with Cloudinary URL`);
      } else {
        const placeholder = `<img data-cid="${cleanCid}" alt="[内联图片]" class="mail-cid-placeholder"${pre || ""}${post || ""}>`;
        updatedHtml = updatedHtml.replace(fullMatch, placeholder);
        console.warn(`✗ Failed to upload cid:${cleanCid}, using placeholder`);
      }
    } else {
      const placeholder = `<img data-cid="${cleanCid}" alt="[内联图片]" class="mail-cid-placeholder"${pre || ""}${post || ""}>`;
      updatedHtml = updatedHtml.replace(fullMatch, placeholder);
      console.warn(`✗ Attachment not found for cid:${cleanCid}`);
    }
  }

  return updatedHtml;
}

const extractBlockquotes = (html = "") => {
  const re = /<blockquote[\s\S]*?<\/blockquote>/gi;
  let out = "";
  let m;
  while ((m = re.exec(html))) out += m[0];
  return out;
};

const splitByMarkers = (html = "") => {
  const marker =
    /(发件人|From)\s*:|在\s*\d{4}年?\d{1,2}月?\d{1,2}日.*写道|-----Original Message-----|原始邮件|On .* wrote:/i;
  const idx = html.search(marker);
  if (idx > -1) {
    return {
      cleanPart: html.slice(0, idx),
      quotedPart: html.slice(idx),
    };
  }
  return { cleanPart: html, quotedPart: "" };
};

const splitEmailParts = (rawHtml = "") => {
  const noTrack = stripTracking(rawHtml);
  const quoted1 = extractBlockquotes(noTrack);
  let clean1 = quoted1
    ? noTrack.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "")
    : noTrack;

  const { cleanPart, quotedPart } = splitByMarkers(clean1);
  const quotedHtml = (quoted1 || "") + (quotedPart || "");
  const hasQuoted = !!quotedHtml;
  const htmlClean = placeholderCid(foldQuotes(cleanPart));

  return {
    htmlRaw: rawHtml,
    htmlClean,
    quotedHtml,
    hasQuoted,
  };
};

function groupByConversation(messages: any[]) {
  const map: Record<string, any[]> = {};
  for (const m of messages) (map[m.conversationId || "no-conv"] ||= []).push(m);
  for (const k of Object.keys(map))
    map[k].sort((a, b) => {
      const atA = new Date(
        a.sentDateTime || a.receivedDateTime || a.createdDateTime || 0
      );
      const atB = new Date(
        b.sentDateTime || b.receivedDateTime || b.createdDateTime || 0
      );
      return +atA - +atB;
    });
  return map;
}

async function upsertToMongo(grouped: Record<string, any[]>, token: string) {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  await mongoose.connect(MONGODB_URI);

  let stats = {
    threadCount: 0,
    updatedThreads: 0,
    messageCount: 0,
    updatedMessages: 0,
    imagesProcessed: 0,
  };

  for (const [cid, list] of Object.entries(grouped)) {
    if (!list.length) continue;
    const first = list[0],
      last = list[list.length - 1];

    const participants = Array.from(
      new Set(
        [
          first.from?.emailAddress?.address,
          ...list.flatMap((m) => getAddresses(m.toRecipients || [])),
          ...list.flatMap((m) => getAddresses(m.ccRecipients || [])),
        ].filter(Boolean)
      )
    ).map((a) => ({ name: null as any, address: a as string }));

    const threadDoc = {
      _id: cid,
      subject: first.subject || "(无标题)",
      participants,
      firstAt: new Date(first.receivedDateTime),
      updatedAt: new Date(last.receivedDateTime),
      messageCount: list.length,
      lastSyncAt: new Date(),
    };

    const existed = await Thread.findById(cid).lean();
    if (existed) {
      await Thread.updateOne({ _id: cid }, { $set: threadDoc });
      stats.updatedThreads++;
    } else {
      await Thread.create(threadDoc);
      stats.threadCount++;
    }

    for (const m of list) {
      let rawHtml = m.body?.content || "";

      if (rawHtml.includes("cid:")) {
        try {
          const attachments = await fetchAttachments(token, m.id);
          if (attachments.length > 0) {
            const processedHtml = await processCidImages(
              rawHtml,
              attachments,
              m.id
            );
            if (processedHtml !== rawHtml) {
              stats.imagesProcessed++;
            }
            rawHtml = processedHtml;
          }
        } catch (error: any) {
          console.error(
            `Failed to process attachments for message ${m.id}:`,
            error.message
          );
        }
      }

      const { htmlRaw, htmlClean, quotedHtml, hasQuoted } =
        splitEmailParts(rawHtml);

      const tsRaw =
        m.sentDateTime || m.receivedDateTime || m.createdDateTime || 0;
      const ts = new Date(tsRaw);
      const tsIso = new Date(
        Math.floor(ts.getTime() / 1000) * 1000
      ).toISOString();
      const baseId = (m.internetMessageId || m.id || "")
        .replace(/[<>]/g, "")
        .trim();
      const messageId = sha1(
        `${baseId}#${tsIso}#${m.from?.emailAddress?.address || ""}#${m.subject || ""}`
      );

      const headers = Array.isArray(m.internetMessageHeaders)
        ? m.internetMessageHeaders
        : [];
      const getHeader = (name: string) =>
        headers.find((h: any) => (h.name || "").toLowerCase() === name)
          ?.value || null;
      const inReplyToId = getHeader("in-reply-to");
      const referencesRaw = getHeader("references");
      const references = referencesRaw
        ? referencesRaw.split(/\s+/).filter(Boolean)
        : [];

      const doc = {
        _id: m.id,
        messageId,
        inReplyToId,
        references,
        threadId: cid,
        from: m.from?.emailAddress || null,
        to: (m.toRecipients || []).map((x: any) => x.emailAddress),
        cc: (m.ccRecipients || []).map((x: any) => x.emailAddress),
        sentAt: new Date(
          m.sentDateTime || m.receivedDateTime || m.createdDateTime
        ),
        subject: m.subject || first.subject || "(无标题)",
        bodyPreview: m.bodyPreview || "",
        htmlRaw,
        html: htmlClean,
        htmlClean,
        quotedHtml,
        hasQuoted,
        attachments: [],
        contentHash: sha1(htmlClean),
        flagged: m.flag?.flagStatus === "flagged",
      };

      const existMsg = await MailMessage.findById<typeof doc>(m.id).lean();
      if (!existMsg) {
        await MailMessage.create(doc);
        stats.messageCount++;
      } else if (existMsg.contentHash !== doc.contentHash) {
        await MailMessage.updateOne({ _id: m.id }, { $set: doc });
        stats.updatedMessages++;
      }
    }
  }
  return stats;
}

export async function runMailSync() {
  const token = await getToken();
  const msgs = await fetchMessagesByContact(
    token,
    process.env.TARGET_EMAIL || ""
  );
  const grouped = groupByConversation(msgs);
  const stats = await upsertToMongo(grouped, token);
  console.log(
    `mail sync done: ${Object.keys(grouped).length} threads; +${stats.threadCount}/${stats.updatedThreads} threads, +${stats.messageCount}/${stats.updatedMessages} messages, ${stats.imagesProcessed} messages with inline images processed`
  );
}
