import { useCallback, useRef } from "react";

export function useThrottle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
) {
  const lastRef = useRef(0);
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRef.current < delay) return;
      lastRef.current = now;
      fn(...args);
    },
    [fn, delay],
  );
}
