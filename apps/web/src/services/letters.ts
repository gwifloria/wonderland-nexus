import {
  ThreadApi,
  MailMessageApi,
  CommentApi,
  ThreadCore,
  MailMessageCore,
  CommentCore,
  WithDbId,
} from "@/types/letter";
import { dbConnect, Thread, MailMessage, Comment } from "@wonderland/database";
import { extractPlainText, sanitizeHtml } from "@wonderland/shared";

export interface ThreadsListParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface ThreadsListResponse {
  data: ThreadApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ThreadDetailResponse {
  thread: ThreadApi;
  messages: MailMessageApi[];
}

export class LettersService {
  /**
   * 获取线程列表（分页 + 搜索）
   */
  async getThreadsList(
    params: ThreadsListParams = {},
  ): Promise<ThreadsListResponse> {
    try {
      await dbConnect();

      const { q = "", page = 1, limit = 20 } = params;
      const normalizedQ = q.trim();
      const normalizedPage = Math.max(1, page);
      const normalizedLimit = Math.min(Math.max(1, limit), 50);

      const filter: any = {};
      if (normalizedQ) {
        filter.subject = {
          $regex: normalizedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        };
      }

      const cursor = Thread.find(filter)
        .sort({ updatedAt: -1 })
        .select({
          _id: 1,
          subject: 1,
          participants: 1,
          firstAt: 1,
          updatedAt: 1,
          messageCount: 1,
        })
        .skip((normalizedPage - 1) * normalizedLimit)
        .limit(normalizedLimit)
        .lean();

      const [items, total] = await Promise.all([
        cursor,
        Thread.countDocuments(filter),
      ]);

      const data: ThreadApi[] = items.map((item: any) => ({
        id: typeof item._id === "string" ? item._id : String(item._id),
        subject: item.subject || "",
        participants: item.participants || [],
        firstAt: item.firstAt ? new Date(item.firstAt).toISOString() : null,
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toISOString()
          : null,
        messageCount: item.messageCount ?? 0,
      }));

      return {
        data,
        pagination: {
          page: normalizedPage,
          limit: normalizedLimit,
          total,
          pages: Math.ceil(total / normalizedLimit),
        },
      };
    } catch (error) {
      console.error("Error fetching threads list:", error);
      throw new Error("Failed to fetch threads list");
    }
  }

  /**
   * 获取线程详情（包含消息）
   */
  async getThreadDetail(threadId: string): Promise<ThreadDetailResponse> {
    try {
      await dbConnect();

      const id = decodeURIComponent(threadId);

      const threadDoc = await Thread.findById(id)
        .select({
          _id: 1,
          subject: 1,
          participants: 1,
          firstAt: 1,
          updatedAt: 1,
          messageCount: 1,
        })
        .lean<WithDbId<ThreadCore>>();

      if (!threadDoc) {
        throw new Error("Thread not found");
      }

      const msgDocs = await MailMessage.find({ threadId })
        .sort({ sentAt: 1 })
        .lean<WithDbId<MailMessageCore>[]>();

      const thread: ThreadApi = {
        id: String(threadDoc._id),
        subject: threadDoc.subject || "",
        participants:
          threadDoc.participants?.map((p) => ({
            name: p.name ?? null,
            address: p.address ?? "",
          })) || [],
        firstAt: threadDoc.firstAt
          ? new Date(threadDoc.firstAt).toISOString()
          : null,
        updatedAt: threadDoc.updatedAt
          ? new Date(threadDoc.updatedAt).toISOString()
          : null,
        messageCount: threadDoc.messageCount ?? (msgDocs?.length || 0),
      };

      const messages: MailMessageApi[] = (msgDocs || []).map((m) => ({
        id: String(m._id),
        threadId: m.threadId,
        from: {
          name: m.from?.name ?? null,
          address: m.from?.address ?? "",
        },
        to: (m.to || []).map((p) => ({
          name: p.name ?? null,
          address: p.address ?? "",
        })),
        sentAt: new Date(m.sentAt).toISOString(),
        subject: m.subject || "",
        bodyPreview: m.bodyPreview || "",
        html: m.html || "",
        attachments: m.attachments || [],
      }));

      return { thread, messages };
    } catch (error) {
      console.error("Error fetching thread detail:", error);
      throw new Error("Failed to fetch thread detail");
    }
  }

  /**
   * 获取线程评论
   */
  async getThreadComments(threadId: string): Promise<CommentApi[]> {
    try {
      await dbConnect();

      const cmtDocs = await Comment.find({ threadId })
        .sort({ createdAt: 1 })
        .lean<WithDbId<CommentCore>[]>();

      return (cmtDocs || []).map((c) => ({
        id: String(c._id),
        threadId: c.threadId,
        author: { name: c.author.name, address: c.author.address },
        content: c.content || "",
        createdAt: new Date(c.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching thread comments:", error);
      throw new Error("Failed to fetch thread comments");
    }
  }

  /**
   * 创建评论
   */
  async createComment(params: {
    threadId: string;
    content: string;
    author: { name: string; address: string };
  }): Promise<CommentApi> {
    try {
      await dbConnect();

      const { threadId, content, author } = params;

      if (!content || typeof content !== "string") {
        throw new Error("Content is required");
      }

      if (content.length > 10_000) {
        throw new Error("Comment too long");
      }

      const clean = sanitizeHtml(content);
      const plain = extractPlainText(content);

      if (!plain) {
        throw new Error("Content is required");
      }

      if (clean.length > 10000) {
        throw new Error("Content too long");
      }

      const doc = await Comment.create({
        threadId,
        author: { name: author.name, address: author.address },
        content: clean,
      });

      const lean = await Comment.findById(doc._id).lean({ virtuals: true });

      if (!lean) {
        throw new Error("Failed to create comment");
      }

      return {
        id: String(lean._id),
        threadId: lean.threadId,
        author: { name: lean.author.name, address: lean.author.address },
        content: lean.content || "",
        createdAt: new Date(lean.createdAt).toISOString(),
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  /**
   * 删除评论
   */
  async deleteComment(
    commentId: string,
    userAddress: string,
  ): Promise<boolean> {
    try {
      await dbConnect();

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.author?.address !== userAddress) {
        throw new Error("Forbidden");
      }

      await Comment.deleteOne({ _id: commentId });
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
}

// 创建单例实例
export const lettersService = new LettersService();
