import mongoose, { Document, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { WhisperEntryCore } from "@/types/whisper";

export interface WhisperEntryDocument extends Document, WhisperEntryCore {
  _id: string;
  id: string; // virtual
}

const WhisperEntrySchema = new Schema<WhisperEntryDocument>(
  {
    originalId: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    originalHtml: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    source: {
      type: String,
      required: true,
      default: "whisper",
      index: true,
    },
    sourceFile: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual id
WhisperEntrySchema.virtual("id").get(function (this: WhisperEntryDocument) {
  return this._id?.toString();
});

// Indexes for efficient queries
WhisperEntrySchema.index({ timestamp: -1 }); // Chronological ordering
WhisperEntrySchema.index({ source: 1, timestamp: -1 }); // Source-based queries
WhisperEntrySchema.index({ visibility: 1, timestamp: -1 }); // Visibility filtering
WhisperEntrySchema.index({ tags: 1, timestamp: -1 }); // Tag-based queries
WhisperEntrySchema.index(
  { originalId: 1, source: 1 },
  { unique: true, sparse: true },
); // Prevent duplicates

WhisperEntrySchema.plugin(mongooseLeanVirtuals);

const WhisperEntry =
  mongoose.models.WhisperEntry ||
  mongoose.model<WhisperEntryDocument>("WhisperEntry", WhisperEntrySchema);

export default WhisperEntry;
