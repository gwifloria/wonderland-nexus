// Gallery相关常量配置
export const GALLERY_CONFIG = {
  // 图片尺寸配置
  IMAGE: {
    DEFAULT_WIDTH: 250,
    DEFAULT_HEIGHT: 375,
    BASE_SIZE: 200,
    MAX_HEIGHT: 350,
  },

  // 分页配置
  PAGINATION: {
    ITEMS_PER_PAGE: 16,
    API_PATH: "/api/gallery",
  },

  // 响应式断点配置
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 1024,
    DESKTOP: 1536,
  },

  // 列数配置
  COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    LARGE: 4,
  },

  // Intersection Observer 配置
  OBSERVER: {
    LAZY_LOAD_MARGIN: "50px",
    INFINITE_SCROLL_MARGIN: "200px",
    THRESHOLD: 0.1,
    DEBOUNCE_DELAY: 100,
  },

  // 动画配置
  ANIMATION: {
    DURATION: 0.15, // Faster, less smooth for journal feel
    LOAD_DURATION: 0.4, // Quicker load
    STAGGER_DELAY: 0.05, // Less stagger for immediate feel
    IMAGE_DELAY: 0.15, // Faster image appearance
    ROTATION_RANGE: 10, // -5 to +5 degrees for casual scatter
    SLIGHT_ROTATION_RANGE: 6, // -3 to +3 degrees
  },

  // Washi tape variants for scrapbook style
  WASHI_TAPE_VARIANTS: [
    "/images/tape-pink.png",
    "/images/tape-beige.png",
    "/images/tape-green.png",
    "/images/tape-pink-flower.png",
    "/images/washi-1.png",
    "/images/washi-2.png",
  ],

  // 胶带位置配置 (expanded for multiple tapes per photo)
  TAPE_POSITIONS: [
    // Corners
    { top: "-8px", left: "-12px", rotate: "12deg" },
    { top: "-10px", right: "-15px", rotate: "-8deg" },
    { bottom: "-8px", left: "-10px", rotate: "-15deg" },
    { bottom: "-6px", right: "-12px", rotate: "10deg" },
    // Edge centers
    {
      top: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      rotate: "5deg",
    },
    {
      bottom: "-8px",
      left: "50%",
      transform: "translateX(-50%)",
      rotate: "-7deg",
    },
    {
      left: "-10px",
      top: "50%",
      transform: "translateY(-50%)",
      rotate: "-10deg",
    },
    {
      right: "-12px",
      top: "50%",
      transform: "translateY(-50%)",
      rotate: "8deg",
    },
  ],

  // Back to top配置
  BACK_TO_TOP: {
    SHOW_THRESHOLD: 300,
  },
} as const;

// CSS类名常量
export const GALLERY_STYLES = {
  CONTAINER: "min-h-screen ",
  FONT_FAMILY: "'Caveat', cursive",
  LOADING_GRADIENT: "bg-gradient-to-br from-milktea-100 to-rose-100",
  ERROR_GRADIENT: "bg-gradient-to-br from-gray-100 to-gray-200",
} as const;
