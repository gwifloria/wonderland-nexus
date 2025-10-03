// 主题色彩配置
export const colors = {
  primary: {
    mint: {
      100: "#E8F5E8",
      200: "#C5E4C5",
      400: "#8BC5A7",
      500: "#72B385",
      600: "#5A9A6B",
    },
    macaronblue: {
      50: "#F0F9FF",
      200: "#BAE6FD",
      600: "#0284C7",
    },
    warmOrange: {
      50: "#FFF7ED",
      200: "#FED7AA",
      600: "#EA580C",
    },
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    600: "#525252",
    700: "#404040",
    800: "#262626",
  },
};

// 状态颜色映射
export const statusColors = {
  open: "bg-macaronblue-50 text-macaronblue-600 border border-macaronblue-200",
  inProgress:
    "bg-warmOrange-50 text-warmOrange-600 border border-warmOrange-200",
  resolved: "bg-rose-50 text-rose-600 border border-rose-200",
};

// 类型样式映射
export const typeStyles = {
  issue: "bg-green-50 text-green-800",
  bug: "bg-rose-50 text-rose-800",
  idea: "bg-nepal-50 text-nepal-800",
};

// Emoji 映射
export const typeEmojis = {
  bug: "🐛",
  idea: "💡",
  issue: "📌",
};

export const categoryEmojis = {
  tech: "🧑‍💻",
  life: "🍵",
};

// 彩纸颜色配置
export const confettiColors = [
  "#A8D8B9", // 薄荷绿
  "#F7DAD9", // 浅粉
  "#FCE5B0", // 奶油黄
  "#B5D6E0", // 雾蓝
  "#FFD6A5", // 蜜桃橙
];

// 动画配置
export const animations = {
  containerVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  tabVariants: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  cardVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};
