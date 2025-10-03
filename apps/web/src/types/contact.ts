// Contact 相关业务类型
import { StaticImageData } from "next/image";
import { TimeRange } from "./common";

// 工作经历类型
export interface WorkHistory extends TimeRange {
  companyName: string;
  responsibilities: string[];
}

// 项目经历类型
export interface ProjectExperience {
  projectName: string;
  projectBackground: string;
  details: string[];
  pictures: StaticImageData[];
  skills: string[];
}

// 多语言支持
export type Language = "zh" | "en";
export type LocalizedText = {
  zh: string;
  en: string;
};
