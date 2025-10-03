import { LabStatus, LabType } from "@/types/lab";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILab extends Document {
  title: string;
  content?: string;
  type: LabType;
  status: LabStatus;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabSchema = new Schema<ILab>(
  {
    title: {
      type: String,
      required: [true, "请提供标题"],
      trim: true,
      maxlength: [200, "标题不能超过200个字符"],
    },
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "请提供类型"],
      enum: {
        values: ["bug", "issue", "idea"],
        message: "类型必须是 bug、issue 或 idea",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["open", "inProgress", "resolved"],
        message: "状态必须是 open、inProgress 或 resolved",
      },
      default: "open",
    },
    category: {
      type: String,
      required: [true, "请提供分类"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Lab: Model<ILab> =
  mongoose.models.Lab || mongoose.model<ILab>("Lab", LabSchema);

export default Lab;
