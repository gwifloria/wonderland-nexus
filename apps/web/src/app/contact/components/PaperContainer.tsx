import Image from "next/image";
import { ReactNode } from "react";
import { PAPER_TEXTURE_STYLE, SPACING, THEME_COLORS } from "../constants";

interface PaperContainerProps {
  children: ReactNode;
}

export function PaperContainer({ children }: PaperContainerProps) {
  return (
    <div
      className={`container ${THEME_COLORS.background} ${THEME_COLORS.border} border shadow-sm rounded-3xl mx-auto ${SPACING.container} relative overflow-hidden`}
    >
      {/* Priority preload for paper texture */}
      <Image
        src="/images/paper.png"
        alt=""
        width={400}
        height={400}
        priority
        className="hidden"
      />

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={PAPER_TEXTURE_STYLE}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
