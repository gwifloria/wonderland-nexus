"use client";

import Image from "next/image";
import React from "react";

interface JournalPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
}

export default function JournalPagination({
  current,
  total,
  pageSize,
  onChange,
  showQuickJumper = false,
  showTotal,
}: JournalPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  // Generate page numbers with ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (current > 1) {
      onChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      onChange(current + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      onChange(page);
    }
  };

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value >= 1 && value <= totalPages) {
        onChange(value);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-24 relative">
      {/* Background decoration using pagination.png */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-28 opacity-50 pointer-events-none z-0">
        <Image src="/images/pagination.png" alt="" fill priority={false} />
      </div>

      {/* Total info */}
      {showTotal && (
        <div className="flex items-center gap-3 text-sm relative z-10 font-handwritten mb-1">
          {/* Current range */}
          <div className="flex items-center gap-1.5">
            <span className="text-milktea-500 text-xs">Showing</span>
            <span className="text-milktea-800 font-bold text-base px-1.5 py-0.5 bg-milktea-50/50 rounded">
              {startItem}–{endItem}
            </span>
          </div>

          {/* Separator */}
          <span className="text-milktea-300">•</span>

          {/* Total count */}
          <div className="flex items-center gap-1.5">
            <span className="text-milktea-500 text-xs">Total</span>
            <span className="text-milktea-800 font-bold text-base px-1.5 py-0.5 bg-milktea-50/50 rounded">
              {total}
            </span>
            <span className="text-milktea-600 text-xs">entries</span>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2 relative z-10 flex-wrap justify-center">
        {/* Previous button */}
        <button
          className={`
            min-w-[40px] h-10 px-3
            border-2 border-transparent rounded-xl
            bg-transparent
            text-lg font-medium font-handwritten
            flex items-center justify-center
            transition-all duration-200
            ${
              current === 1
                ? "opacity-30 cursor-not-allowed text-milktea-700"
                : "text-milktea-800 hover:bg-milktea-50/50 hover:text-milktea-500 hover:scale-105 active:scale-95 cursor-pointer"
            }
          `}
          onClick={handlePrevious}
          disabled={current === 1}
          aria-label="Previous page"
        >
          ←
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={`${page}-${index}`}>
              {page === "..." ? (
                <span className="inline-flex items-center justify-center min-w-[32px] h-10 text-milktea-400 text-lg tracking-wider select-none italic font-handwritten">
                  ···
                </span>
              ) : (
                <button
                  className={`
                    min-w-[40px] h-10 px-3
                    rounded-xl
                    text-base font-medium font-handwritten
                    transition-all duration-250
                    ${
                      current === page
                        ? "font-bold text-milktea-700 border-2 border-dashed border-milktea-400 bg-milktea-50/30"
                        : "italic text-milktea-800 border-2 border-transparent hover:underline hover:decoration-2 hover:underline-offset-4 hover:text-milktea-500 hover:-translate-y-0.5 active:scale-95"
                    }
                  `}
                  onClick={() => handlePageClick(page)}
                  aria-label={`Page ${page}`}
                  aria-current={current === page ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          className={`
            min-w-[40px] h-10 px-3
            border-2 border-transparent rounded-xl
            bg-transparent
            text-lg font-medium font-handwritten
            flex items-center justify-center
            transition-all duration-200
            ${
              current === totalPages
                ? "opacity-30 cursor-not-allowed text-milktea-700"
                : "text-milktea-800 hover:bg-milktea-50/50 hover:text-milktea-500 hover:scale-105 active:scale-95 cursor-pointer"
            }
          `}
          onClick={handleNext}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          →
        </button>

        {/* Quick jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2 ml-4 text-sm text-milktea-800 italic font-handwritten">
            <span className="whitespace-nowrap">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              onKeyDown={handleQuickJump}
              aria-label="Jump to page"
              className="
                w-[60px] h-9 px-2
                border-2 border-milktea-300 rounded-lg
                bg-milktea-50/80
                text-milktea-700 text-sm italic text-center font-handwritten
                transition-all duration-200
                focus:outline-none focus:border-milktea-400 focus:bg-white
                hover:border-milktea-400
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
            />
          </div>
        )}
      </div>
    </div>
  );
}
