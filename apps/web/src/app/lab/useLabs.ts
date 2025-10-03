"use client";

import {
  Lab,
  LabCreateInput,
  LabListResponse,
  LabStatus,
  LabType,
  LabUpdateInput,
} from "@/types/lab";
import { deleteFetcher, postFetcher, putFetcher } from "@/util/fetch";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

interface UseLabsFilters {
  type?: LabType;
  status?: LabStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseLabsReturn {
  labs: Lab[];
  loading: boolean;
  error: string | null;
  pagination: LabListResponse["pagination"] | null;
  fetchLabs: (filters?: UseLabsFilters) => void;
  addLab: (labData: LabCreateInput) => Promise<any>;
  updateLab: (data: { id: string } & LabUpdateInput) => Promise<any>;
  deleteLab: (data: { id: string }) => Promise<any>;
  clearAllLabs: () => Promise<void>;
}

export function useLabs(): UseLabsReturn {
  const [filters, setFilters] = useState<UseLabsFilters>({});

  const listKey = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const qs = params.toString();
    return `/api/lab/list${qs ? `?${qs}` : ""}`;
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<LabListResponse>(listKey, {
    keepPreviousData: true,
  });

  const fetchLabs = useCallback((next?: UseLabsFilters) => {
    // 直接更新筛选条件，SWR 会自动重新获取数据
    setFilters((prev) => ({ ...prev, ...(next || {}) }));
  }, []);

  // 直接使用 trigger 作为最终接口，消除冗余包装
  const { trigger: addLab } = useSWRMutation("/api/lab/add", postFetcher, {
    onSuccess: () => mutate(), // 成功后刷新列表
  });

  const { trigger: updateLab } = useSWRMutation("/api/lab/update", putFetcher, {
    onSuccess: () => mutate(), // 成功后刷新列表
  });

  const { trigger: deleteLab } = useSWRMutation(
    "/api/lab/delete",
    postFetcher,
    {
      onSuccess: () => mutate(), // 成功后刷新列表
    },
  );

  const clearAllLabs = useCallback(async (): Promise<void> => {
    const response = await fetch("/api/lab", { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || "清空失败");

    // 使用 mutate 自动更新缓存
    await mutate();
  }, [mutate]);

  return {
    labs: data?.data ?? [],
    loading: isLoading,
    error: error ? String(error) : null,
    pagination: data?.pagination ?? null,
    fetchLabs,
    addLab,
    updateLab,
    deleteLab,
    clearAllLabs,
  };
}
