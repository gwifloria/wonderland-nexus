// 通用类型工具库
import { StaticImageData } from "next/image";

// 数据库和API通用包装类型
export type WithDbId<T> = T & { _id: string };
export type WithApiId<T> = T & { id: string };

// 时间相关通用类型
export interface TimeRange {
  startTime: string;
  endTime?: string;
}

// GitHub API 基础类型
export interface GitHubResourceBase {
  name: string;
  path: string;
  sha: string;
  type: string;
}

export interface GitHubFileBase extends GitHubResourceBase {
  size: number;
}

export interface GitHubUrlsBase {
  download_url: string;
  git_url: string;
  html_url: string;
  url: StaticImageData;
}

export interface GitHubLinksBase {
  _links: {
    git: string;
    html: string;
    self: string;
  };
}

// 完整的 GitHub 文件类型（保持向后兼容）
export interface GitHubFile
  extends GitHubFileBase,
    GitHubUrlsBase,
    GitHubLinksBase {}

// 提交相关基础信息
export interface CommitInfoBase {
  updatedAt: string;
  author: string;
  message: string;
  sha: string;
  url: string;
}

// 数据库时间戳基础类型
export interface TimestampBase {
  createdAt: Date;
  updatedAt: Date;
}

// 通用API响应格式
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}
