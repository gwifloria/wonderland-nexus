export type PageRoute =
  | "blog"
  | "whispers"
  | "letters"
  | "contact"
  | "tools"
  | "space"
  | "lab"
  | "travel"
  | "dance"
  | "gallery";

type PartialRouteMap<T> = Partial<Record<PageRoute, T>>;

// 路由图标配置 - 支持 emoji 和本地图标文件
export const routes: PartialRouteMap<{ emoji: string; icon?: string }> = {
  blog: { emoji: "🪶", icon: "blog-icon" },
  whispers: { emoji: "💭", icon: "whisper-icon" },
  letters: { emoji: "✉️", icon: "letters-icon" },
  gallery: { emoji: "📸", icon: "gallery-icon" },
  contact: { emoji: "👋", icon: "contact-icon" },
};

export const hiddenRoutes = ["tools", "space", "travel", "dance", "lab"];

export const routeDescriptions: PartialRouteMap<string> = {
  blog: "随便写的",
  letters: "拜拜微信",
  whispers: "碎碎念时光机",
  contact: "介绍一下我自己",
  lab: "实验室 - 记录想法与项目进展",
  tools: "实用工具集合",
  space: "3D 交互体验空间",
  travel: "足迹记录与旅行故事",
  dance: "舞蹈相关内容",
  gallery: "随手拍的",
};
