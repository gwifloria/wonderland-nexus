"use client";
import { useState } from "react";

export const PrintButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    try {
      // 获取 about 容器
      const aboutContainer = document.querySelector("#about");

      if (!aboutContainer) {
        console.error("About container not found");
        return;
      }

      // 触发打印
      window.print();
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      // 打印对话框关闭后重置加载状态
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <button
      aria-label="导出 PDF"
      title="导出 PDF"
      className={`
        fixed print:hidden right-6 bottom-6 h-10 w-10 rounded-full
        text-white shadow-lg focus:outline-none focus-visible:ring-2 z-50
        transition-all duration-200
        ${
          isLoading
            ? "bg-rose-400 cursor-not-allowed scale-95"
            : "bg-rose-600 hover:bg-rose-700 hover:scale-105"
        }
      `}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 mx-auto animate-spin"
        >
          <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 mx-auto"
        >
          <path d="M6 9V2h12v7h2a2 2 0 012 2v6h-4v4H8v-4H4v-6a2 2 0 012-2h0zm2-5v5h8V4H8zm8 14H8v2h8v-2zM6 13h12v2H6v-2z" />
        </svg>
      )}
    </button>
  );
};
