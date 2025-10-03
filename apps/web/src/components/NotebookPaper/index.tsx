import clsx from "clsx";
import React from "react";
import "./index.scss";

interface NotebookPaperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 手帐风活页纸组件
 * 用法：
 * <NotebookPaper>
 *   <p>正文内容</p>
 * </NotebookPaper>
 */
export default function NotebookPaper({
  children,
  className,
}: NotebookPaperProps) {
  return (
    <div
      className={clsx(
        "relative bg-[#fdfcf7] shadow-md rounded-lg px-8 py-6",
        "notebook-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}
