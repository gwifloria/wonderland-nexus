// Lab/Experiment 相关业务类型
import { WithDbId, WithApiId, ApiResponse } from "./common";

// Re-export common types for lab domain
export type { ApiResponse } from "./common";

export type LabCategory = "tech" | "life";
export type LabType = "bug" | "idea" | "issue";
export type LabStatus = "open" | "inProgress" | "resolved";

// Lab 核心数据结构
export interface LabCore {
  title: string;
  content?: string;
  type: LabType;
  status: LabStatus;
  category: LabCategory;
  createdAt: Date;
  updatedAt: Date;
}

// Lab 创建输入类型
export interface LabCreateInput {
  title: string;
  content?: string;
  type: LabType;
  status?: LabStatus;
  category: LabCategory;
}

// Lab 更新输入类型
export type LabUpdateInput = Partial<LabCreateInput>;

// 数据库中的 Lab 类型（包含 _id）
export type LabDb = WithDbId<LabCore>;

// API 返回的 Lab 类型（包含 id）
export type Lab = WithApiId<LabCore>;

// Lab 列表响应类型
export interface LabListResponse extends ApiResponse<Lab[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
