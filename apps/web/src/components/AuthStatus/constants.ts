// AuthStatus 组件相关常量
export const DECORATIVE_IMAGES = {
  WASHI_TAPE: "/images/tape-beige.png",
  WASHI_BOW: "/images/washi-2.png",
} as const;

// 样式常量
export const STYLES = {
  // 基础卡片样式
  CARD_BASE:
    "relative bg-[#FFFDF9] border border-dashed border-rose-200 rounded-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]",

  // 按钮样式
  BUTTON_PRIMARY:
    "relative px-4 py-2.5 bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 border border-dashed border-rose-300 rounded-2xl text-rose-700 font-medium transition-all duration-200 shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed",

  BUTTON_SECONDARY:
    "relative px-3 py-2 bg-white/80 hover:bg-white border border-dashed border-rose-200 rounded-xl text-xs text-rose-600 hover:text-rose-700 transition-all duration-200 font-medium shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden max-w-xs",

  // 头像样式
  AVATAR_COMPACT: "rounded-full border border-rose-200",
  AVATAR_NORMAL: "rounded-full border border-rose-200",
} as const;

// 装饰元素尺寸
export const DECORATION_SIZES = {
  TAPE_COMPACT: { width: 36, height: 12 },
  TAPE_NORMAL: { width: 36, height: 12 },
  BOW: { width: 32, height: 32 },
} as const;

// 头像尺寸
export const AVATAR_SIZES = {
  COMPACT: 24,
  NORMAL: 28,
} as const;
