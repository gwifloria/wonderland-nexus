import { TimestampBase, WithDbId, WithApiId } from "./common";

// Whisper entry core type (database layer)
export interface WhisperEntryCore extends TimestampBase {
  originalId?: string;
  timestamp: Date;
  content: string; // Markdown format
  originalHtml?: string; // Preserve original HTML
  images: string[]; // Array of image paths
  tags: string[]; // Extracted or manual tags
  source: string; // "whisper" or other sources
  sourceFile?: string; // Original export filename
  visibility: "public" | "private";
}

// Database type with MongoDB Document interface
export type WhisperEntryDb = WithDbId<WhisperEntryCore>;

// API response type with id field
export type WhisperEntryApi = WithApiId<WhisperEntryCore>;

// Parsed entry from HTML (before database save)
export interface ParsedWhisperEntry {
  originalId: string;
  timestamp: Date;
  content: string; // Markdown format
  originalHtml: string;
  images: string[];
  tags: string[];
}

// Parser result
export interface WhisperParseResult {
  entries: ParsedWhisperEntry[];
  totalEntries: number;
  imageFiles: Array<{ original: string; target: string; index: number }>;
  errors: string[];
}

// API response types
export interface WhisperListResponse {
  data: WhisperEntryApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    visibility: string;
    source: string;
    tag?: string;
    search?: string;
  };
}

export interface WhisperUploadResponse {
  success: boolean;
  summary: {
    totalParsed: number;
    saved: number;
    duplicates: number;
    errors: number;
  };
  details: {
    savedEntries: Array<{
      id: string;
      timestamp: string;
      contentPreview: string;
    }>;
    duplicates: Array<{
      originalId: string;
      timestamp: string;
      reason: string;
    }>;
    saveErrors: Array<{
      timestamp: string;
      error: string;
    }>;
    parseErrors: string[];
    imageFiles: {
      processed: number;
      copied: number;
      errors: string[];
    };
  };
}

export interface WhisperStatsResponse {
  overview: {
    totalEntries: number;
    totalWithImages: number;
    totalTags: number;
    recentEntries: number;
    dateRange: {
      oldest?: Date;
      newest?: Date;
    };
  };
  topTags: Array<{
    name: string;
    count: number;
  }>;
  monthlyActivity: Array<{
    year: number;
    month: number;
    count: number;
    date: string;
  }>;
}
