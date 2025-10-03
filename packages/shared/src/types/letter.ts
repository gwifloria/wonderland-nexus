import { WithDbId, WithApiId } from "./common";

export type { WithDbId, WithApiId };

// Database layer core types
export interface AuthorCore {
  name: string;
  address: string;
}

export interface CommentDbCore {
  threadId: string;
  author: AuthorCore;
  type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailPersonCore {
  name?: string;
  address: string;
}

export interface MailAttachmentCore {
  id: string;
  name: string;
  contentType: string;
  size: number;
  isInline?: boolean;
  contentId?: string;
  url?: string;
}

export interface MailMessageDbCore {
  _id: string;
  threadId: string;
  from: MailPersonCore;
  to: MailPersonCore[];
  cc: MailPersonCore[];
  sentAt: Date;
  subject?: string;
  bodyPreview?: string;
  html?: string;
  attachments: MailAttachmentCore[];
  contentHash?: string;
  flagged?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ThreadParticipantCore {
  name: string;
  address: string;
}

export interface ThreadDbCore {
  _id: string;
  subject?: string;
  participants: ThreadParticipantCore[];
  messageCount?: number;
  lastSyncAt?: Date;
  deltaLink?: string;
  contentHash?: string;
  tags?: string[];
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

// API layer types
export type AttachmentType = {
  id?: string | null;
  name?: string | null;
  size?: number | null;
  url?: string | null;
  contentId?: string | null;
};

export type MailMessageCore = {
  threadId: string;
  from?: { name?: string | null; address: string } | null;
  to?: { name?: string | null; address: string }[];
  sentAt: string;
  subject?: string;
  html: string;
  attachments?: AttachmentType[];
  bodyPreview: string;
};

export type CommentCore = {
  threadId: string;
  author: { name: string; address: string };
  content: string;
  createdAt: string;
};

export type ThreadCore = {
  id: string;
  subject: string;
  participants?: { name?: string | null; address: string }[];
  firstAt: string | null;
  updatedAt?: string | null;
  messageCount?: number;
};

export type MailMessageApi = WithApiId<MailMessageCore>;
export type CommentApi = WithApiId<CommentCore>;
export type ThreadApi = WithApiId<ThreadCore>;
