import Image from "next/image";
import { ReactNode } from "react";
import {
  DECORATION_SIZES,
  HAND_FONT_STYLE,
  SPACING,
  TAPE_VARIANTS,
  THEME_COLORS,
} from "../constants";

interface HandwrittenTitleProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function HandwrittenTitle({
  children,
  size = "md",
  className = "",
}: HandwrittenTitleProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <h2
      className={`mb-6 font-semibold ${THEME_COLORS.primary} ${sizeClasses[size]} ${className}`}
      style={HAND_FONT_STYLE}
    >
      {children}
    </h2>
  );
}
interface ScrapbookCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  tape?: boolean;
  tapeVariant?: keyof typeof TAPE_VARIANTS;
}

export function ScrapbookCard({
  title,
  children,
  className = "",
  tape = true,
  tapeVariant = "beige",
}: ScrapbookCardProps) {
  const tapeSrc = TAPE_VARIANTS[tapeVariant];

  return (
    <div
      className={`relative p-6 rounded-3xl border border-milktea-200 shadow-sm bg-milktea-50/85 ${SPACING.cardMargin} ${className}`}
    >
      {tape && (
        <div className="pointer-events-none absolute -top-3 -left-4 rotate-9 opacity-90 w-[60px] h-[40px] print:hidden">
          <Image
            src={tapeSrc}
            alt="tape"
            width={60}
            height={40}
            className="object-contain"
          />
        </div>
      )}

      {title && <HandwrittenTitle>{title}</HandwrittenTitle>}
      {children}
    </div>
  );
}
