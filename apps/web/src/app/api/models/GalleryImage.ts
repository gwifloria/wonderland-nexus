import mongoose, { Document, Model, Schema } from "mongoose";
import { GalleryImageCore } from "@/types/gallery";

// Re-export types for backward compatibility
export interface IGalleryImage extends Document, GalleryImageCore {}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    sha: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    repo: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

GalleryImageSchema.index({ path: 1 });
GalleryImageSchema.index({ createdAt: -1 });
GalleryImageSchema.index({ filename: 1 });

const GalleryImage: Model<IGalleryImage> =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);

export default GalleryImage;
