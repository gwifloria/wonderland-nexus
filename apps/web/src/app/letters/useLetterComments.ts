"use client";

import { fetcherFactory } from "@/util/fetch";
import { CommentApi } from "@/types/letter";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export function useLetterComments(threadId: string | null) {
  const { data, error, mutate } = useSWR<CommentApi[]>(
    threadId ? `/api/letters/comments?threadId=${threadId}` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const { trigger: addComment } = useSWRMutation(
    "/api/letters/comments",
    fetcherFactory("POST"),
    {
      onSuccess: () => mutate(),
    },
  );

  const { trigger: deleteComment } = useSWRMutation(
    "/api/letters/comments",
    async (
      url: string,
      { arg }: { arg: { commentId: string; address: string } },
    ) => {
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return response.json();
    },
    {
      onSuccess: () => mutate(),
    },
  );

  return {
    comments: data,
    loading: !error && !data && threadId,
    error,
    addComment,
    deleteComment,
    refetch: mutate,
  };
}
