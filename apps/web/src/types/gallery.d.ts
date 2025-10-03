import { WithDbId, WithApiId, GitHubFileBase, TimestampBase } from "./common";

// Re-export common types for gallery domain
export type {
  WithDbId,
  WithApiId,
  GitHubFileBase,
  TimestampBase,
} from "./common";

// Database layer core types (used by API models)
export interface GalleryImageCore extends GitHubFileBase, TimestampBase {
  filename: string;
  repo: string;
  branch: string;
  imageUrl: string;
}

// Database type with MongoDB Document interface
export type GalleryImageDb = WithDbId<GalleryImageCore>;

// Gallery API 图片项
export interface GitHubImageItem extends GitHubFileBase {
  imageUrl: string;
  type: "image";
}

// Gallery API 目录项
export interface GitHubDirectoryItem {
  name: string;
  path: string;
  type: "directory";
}

// Gallery API 响应
export interface GalleryApiResponse {
  images: GitHubImageItem[];
  directories: GitHubDirectoryItem[];
  currentPath: string;
  repo: string;
  branch: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
  cached?: boolean;
  lastSync?: Date;
}

// 组件使用的图片数据
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}
