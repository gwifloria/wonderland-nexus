import { CommitInfoBase, TimestampBase, WithDbId } from "./common";

// Re-export common types for blog domain
export type {
  CommitInfoBase,
  GitHubFile,
  TimestampBase,
  WithApiId,
  WithDbId,
} from "./common";

// Blog category types (moved from constants.ts to centralize type definitions)
export type CatKey = "ByteNotes" | "Murmurs";

export type BlogCategory = { key: CatKey; label: string };

export type CateGroup = BlogCategory & { files: string[] };

// GitHub API related types (moved from constants.ts)
export interface GitHubItem {
  name: string;
  path: string;
  type: string;
}

// Database layer core types (used by API models)
export interface BlogPostCore extends TimestampBase {
  path: string;
  title: string;
  category: CatKey;
  isPinned: boolean;
  pinOrder: number;
  pinnedAt?: Date;
  pinnedBy?: string;
}

// Database type with MongoDB Document interface
export type BlogPostDb = WithDbId<BlogPostCore>;

export interface BlogMeta {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  category?: string;
}

export interface BlogContent {
  content: string;
  meta: BlogMeta;
}

// 使用基础提交信息类型
export interface CommitMeta extends CommitInfoBase {}

export interface BlogPostItem {
  name: string;
  path: string;
  isPinned: boolean;
  pinOrder: number;
  title?: string;
}

export interface PinnedPost {
  path: string;
  category: string;
  title?: string;
  isPinned: boolean;
  pinOrder: number;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPostItem[];
  category: string;
}

export interface GitHubServiceConfig {
  owner?: string;
  repo?: string;
  branch?: string;
  token?: string;
}

export interface GitHubAPIError extends Error {
  status: number;
  url: string;
}
