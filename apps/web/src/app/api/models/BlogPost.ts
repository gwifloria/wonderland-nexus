import mongoose, { Document, Model, Schema } from "mongoose";
import { BlogPostCore } from "@/types/blog";

// Re-export types for backward compatibility
export interface IBlogPost extends Document, BlogPostCore {}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["ByteNotes", "Murmurs"],
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinOrder: {
      type: Number,
      default: 0,
    },
    pinnedAt: {
      type: Date,
    },
    pinnedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual id
BlogPostSchema.virtual("id").get(function (this: { _id?: any }) {
  return this._id?.toString();
});

// Compound indexes for efficient queries
BlogPostSchema.index({ category: 1, isPinned: -1, pinOrder: 1 });
BlogPostSchema.index({ category: 1, createdAt: -1 });

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
