import mongoose, { Document, Model, Schema } from "mongoose";

export interface Author {
  name: string;
  address: string;
}

export interface CommentDocument extends Document {
  threadId: string;
  messageId?: string;
  author: Author;
  type: string;
  content?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  id?: string;
}

const AuthorSchema = new Schema<Author>({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
});

const CommentSchema = new Schema<CommentDocument>(
  {
    threadId: { type: String, required: true, index: true, trim: true },
    messageId: { type: String, index: true, sparse: true },
    author: { type: AuthorSchema, required: true },
    type: { type: String, default: "comment", trim: true },
    content: { type: String, trim: true },
    status: { type: String, default: "published" },
  },
  {
    timestamps: true,
  }
);

CommentSchema.virtual("id").get(function (this: { _id?: any }) {
  return this._id?.toString();
});

CommentSchema.index({ threadId: 1, createdAt: -1 });

const Comment: Model<CommentDocument> =
  mongoose.models.Comment ||
  mongoose.model<CommentDocument>("Comment", CommentSchema);

export default Comment;
