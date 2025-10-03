"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_CONFIG, GALLERY_STYLES } from "../constants";

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: GALLERY_CONFIG.OBSERVER.LAZY_LOAD_MARGIN,
        threshold: GALLERY_CONFIG.OBSERVER.THRESHOLD,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView && (
        <div
          className={`absolute inset-0 ${GALLERY_STYLES.LOADING_GRADIENT} animate-pulse`}
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      )}

      {isInView && !hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0.7, scale: isLoaded ? 1 : 0.95 }}
          transition={{ duration: GALLERY_CONFIG.ANIMATION.DURATION }}
          className="relative"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-auto object-cover"
            priority={false}
            loading="lazy"
          />

          {!isLoaded && (
            <div
              className={`absolute inset-0 ${GALLERY_STYLES.LOADING_GRADIENT}/80 flex items-center justify-center`}
            >
              <div className="w-6 h-6 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      )}

      {hasError && (
        <div
          className={`absolute inset-0 ${GALLERY_STYLES.ERROR_GRADIENT} flex items-center justify-center`}
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
}
