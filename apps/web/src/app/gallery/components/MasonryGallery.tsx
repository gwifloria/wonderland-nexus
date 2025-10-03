"use client";

import { GalleryImage } from "@/types/gallery";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { GALLERY_CONFIG } from "../constants";
import { useInfiniteScroll, useResponsiveColumns } from "../hooks";
import { PolaroidFrame } from "./PolaroidFrame";

interface MasonryGalleryProps {
  images: GalleryImage[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MasonryGallery({
  images,
  onLoadMore,
  hasMore,
}: MasonryGalleryProps) {
  const { columns, containerRef } = useResponsiveColumns();
  const { loadMoreRef } = useInfiniteScroll(onLoadMore, hasMore);

  const columnArrays = useMemo(() => {
    const arrays: GalleryImage[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);

    images?.forEach((image) => {
      const shortestIndex = heights.reduce(
        (minIdx, cur, i) => (cur < heights[minIdx] ? i : minIdx),
        0,
      );
      arrays[shortestIndex].push(image);
      const aspectRatio = image.height / image.width;
      heights[shortestIndex] += aspectRatio * GALLERY_CONFIG.IMAGE.BASE_SIZE;
    });

    return arrays;
  }, [images, columns]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: GALLERY_CONFIG.ANIMATION.LOAD_DURATION,
        staggerChildren: GALLERY_CONFIG.ANIMATION.STAGGER_DELAY,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: GALLERY_CONFIG.ANIMATION.LOAD_DURATION,
        staggerChildren: GALLERY_CONFIG.ANIMATION.STAGGER_DELAY,
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto"
    >
      <div
        className="flex gap-4 justify-center"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {columnArrays.map((columnImages, columnIndex) => (
          <motion.div
            key={columnIndex}
            variants={columnVariants}
            className="flex flex-col gap-6"
            style={{ flex: 1, maxWidth: `${100 / columns}%` }}
          >
            {columnImages.map((image, imageIndex) => (
              <motion.div
                key={image.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    columnIndex * GALLERY_CONFIG.ANIMATION.STAGGER_DELAY +
                    imageIndex * GALLERY_CONFIG.ANIMATION.IMAGE_DELAY,
                  duration: GALLERY_CONFIG.ANIMATION.LOAD_DURATION,
                  ease: "easeOut",
                }}
                className="cursor-pointer"
              >
                <PolaroidFrame image={image} />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      <div ref={loadMoreRef} className="h-1" />
    </motion.div>
  );
}
