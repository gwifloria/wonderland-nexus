"use client";

import { GalleryImage } from "@/types/gallery";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";
import { GALLERY_CONFIG } from "../constants";
import { LazyImage } from "./LazyImage";

interface PolaroidFrameProps {
  image: GalleryImage;
  variant?: "tape" | "corner" | "simple";
}

export function PolaroidFrame({ image, variant = "tape" }: PolaroidFrameProps) {
  const aspectRatio = image.height / image.width;
  const frameHeight = Math.min(
    aspectRatio * GALLERY_CONFIG.IMAGE.BASE_SIZE,
    GALLERY_CONFIG.IMAGE.MAX_HEIGHT,
  );

  // Generate random rotation for photo
  const randomRotation = useMemo(
    () =>
      Math.random() * GALLERY_CONFIG.ANIMATION.ROTATION_RANGE -
      GALLERY_CONFIG.ANIMATION.ROTATION_RANGE / 2,
    [],
  );

  // Select 1-2 random tapes per photo (mobile: 1, desktop: 1-2)
  const tapes = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const tapeCount = isMobile ? 1 : Math.floor(Math.random() * 2) + 1; // 1 on mobile, 1-2 on desktop
    const selectedTapes = [];
    const usedPositions = new Set<number>();

    for (let i = 0; i < tapeCount; i++) {
      let posIndex;
      do {
        posIndex = Math.floor(
          Math.random() * GALLERY_CONFIG.TAPE_POSITIONS.length,
        );
      } while (usedPositions.has(posIndex));

      usedPositions.add(posIndex);

      selectedTapes.push({
        src: GALLERY_CONFIG.WASHI_TAPE_VARIANTS[
          Math.floor(Math.random() * GALLERY_CONFIG.WASHI_TAPE_VARIANTS.length)
        ],
        position: GALLERY_CONFIG.TAPE_POSITIONS[posIndex],
        rotation: Math.random() * 30 - 15, // -15 to +15 degrees
      });
    }

    return selectedTapes;
  }, []);

  return (
    <motion.div
      className="relative group"
      whileHover={{
        y: -6,
        rotate: Math.random() * 2 - 1,
        transition: {
          duration: GALLERY_CONFIG.ANIMATION.DURATION,
          ease: "easeOut",
        },
      }}
    >
      <div
        className="relative transform"
        style={{
          transform: `rotate(${randomRotation}deg)`,
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
        }}
      >
        {/* Photo */}
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ height: `${frameHeight}px` }}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={frameHeight}
            className="rounded-sm"
          />
        </div>

        {/* Washi tapes - multiple per photo */}
        {variant === "tape" &&
          tapes.map((tape, index) => (
            <div
              key={index}
              className="absolute pointer-events-none opacity-85 w-[35px] sm:w-[45px] h-[24px] sm:h-[32px] z-10"
              style={{
                ...tape.position,
              }}
            >
              <Image
                src={tape.src}
                alt="washi tape"
                width={45}
                height={32}
                className="object-contain"
                style={{
                  filter: "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15))",
                }}
              />
            </div>
          ))}
      </div>
    </motion.div>
  );
}
