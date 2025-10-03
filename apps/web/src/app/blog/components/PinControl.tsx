"use client";
import { isAdminUser } from "@/constants/auth";
import { BlogPostItem } from "@/types/blog";
import { postFetcher } from "@/util/fetch";
import { useSession } from "next-auth/react";
import useSWRMutation from "swr/mutation";

interface PinControlProps {
  post: BlogPostItem;
  category: string;
}

interface PinRequest {
  path: string;
  category: string;
  title: string;
  isPinned: boolean;
}

export default function PinControl({ post, category }: PinControlProps) {
  const { data: session } = useSession();

  const { trigger: togglePin, isMutating: isLoading } = useSWRMutation<
    any,
    Error,
    string,
    PinRequest
  >("/api/posts/pin", postFetcher, {
    onError: (error) => {
      console.error("Error toggling pin:", error);
    },
  });

  // Only show to admin users
  if (!isAdminUser(session?.user?.email)) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        togglePin({
          path: post.path,
          category,
          title: post.title || post.name.replace(/\.(md|mdx)$/i, ""),
          isPinned: !post.isPinned,
        });
      }}
      disabled={isLoading}
      className={`
        absolute right-0 top-1/2 transform -translate-y-1/2
        opacity-0 group-hover:opacity-100 transition-all duration-200
        p-1 rounded text-xs
        ${
          post.isPinned
            ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            : "text-neutral-400 hover:text-amber-600 hover:bg-amber-50"
        }
        ${
          isLoading
            ? "cursor-not-allowed opacity-50 scale-95"
            : "cursor-pointer hover:scale-105"
        }
      `}
    >
      {isLoading ? <span className="animate-spin">⏳</span> : "📌"}
    </button>
  );
}
