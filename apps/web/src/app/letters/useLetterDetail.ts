"use client";

import { MailMessageApi, ThreadApi } from "@/types/letter";
import useSWR from "swr";

interface LetterDetailResponse {
  thread: ThreadApi;
  messages: MailMessageApi[];
}

export function useLetterDetail(threadId: string) {
  const { data, error, mutate } = useSWR<LetterDetailResponse>(
    `/api/letters/detail?threadId=${threadId}`,
  );

  return {
    thread: data?.thread,
    messages: data?.messages,
    loading: !error && !data,
    error,
    refetch: mutate,
  };
}
