import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_CONFIG } from "./constants";

export const useResponsiveColumns = () => {
  const [columns, setColumns] = useState<number>(
    GALLERY_CONFIG.COLUMNS.DESKTOP,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const updateColumns = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    if (width < GALLERY_CONFIG.BREAKPOINTS.MOBILE) {
      setColumns(GALLERY_CONFIG.COLUMNS.MOBILE);
    } else if (width < GALLERY_CONFIG.BREAKPOINTS.TABLET) {
      setColumns(GALLERY_CONFIG.COLUMNS.TABLET);
    } else if (width < GALLERY_CONFIG.BREAKPOINTS.DESKTOP) {
      setColumns(GALLERY_CONFIG.COLUMNS.DESKTOP);
    } else {
      setColumns(GALLERY_CONFIG.COLUMNS.LARGE);
    }
  };

  useEffect(() => {
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return { columns, containerRef };
};

export const useInfiniteScroll = (
  onLoadMore?: () => void,
  hasMore?: boolean,
) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const lastTriggerTime = useRef(0);
  const setupObserver = useCallback(() => {
    if (!loadMoreRef.current || !onLoadMore) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 防止频繁触发
          const now = Date.now();
          if (now - lastTriggerTime.current < 2000) {
            return; // 2秒内不重复触发
          }

          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            // 再次检查页面可见性和条件
            if (document.visibilityState === "visible" && hasMore) {
              lastTriggerTime.current = Date.now();
              onLoadMore();
            }
          }, GALLERY_CONFIG.OBSERVER.DEBOUNCE_DELAY);
        }
      },
      {
        rootMargin: GALLERY_CONFIG.OBSERVER.INFINITE_SCROLL_MARGIN,
        threshold: GALLERY_CONFIG.OBSERVER.THRESHOLD,
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

    // 防止初始挂载时立即触发
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const initDelay = setTimeout(() => {
        // 初始化延迟后再设置 observer
        setupObserver();
      }, 1000); // 1秒延迟避免初始触发

      return () => clearTimeout(initDelay);
    }

    setupObserver();
  }, [onLoadMore, hasMore, setupObserver]);

  // 重置初始挂载状态当组件卸载时
  useEffect(() => {
    return () => {
      isInitialMount.current = true;
    };
  }, []);

  return { loadMoreRef };
};
