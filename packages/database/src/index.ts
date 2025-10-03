export { default as dbConnect } from "./dbConnect";
export { default as Thread } from "./models/Thread";
export { default as MailMessage } from "./models/MailMessage";
export { default as Comment } from "./models/Comment";

// Re-export types
export type { ThreadDocument, ThreadParticipant } from "./models/Thread";
export type {
  MailMessageDocument,
  MailPerson,
  MailAttachment,
} from "./models/MailMessage";
export type { CommentDocument, Author } from "./models/Comment";
