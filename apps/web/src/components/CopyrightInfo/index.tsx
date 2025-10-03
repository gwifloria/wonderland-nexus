"use client";
import { useState } from "react";

export default function CopyrightInfo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-2 left-2 print:hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - extremely small and subtle */}
      <div className="text-neutral-400/60 hover:text-neutral-500 transition-colors cursor-help text-[10px]">
        ⓘ
      </div>

      {/* Tooltip content */}
      {isHovered && (
        <div className="absolute bottom-6 left-0 bg-neutral-50/95 backdrop-blur-sm px-3 py-2 rounded-lg text-[11px] leading-4 text-neutral-600 shadow-lg whitespace-nowrap">
          <div>Built with Next.js, React, TypeScript</div>
          <div className="text-neutral-500">
            © 2025 Floria&apos;s Wonderland
          </div>
        </div>
      )}
    </div>
  );
}
