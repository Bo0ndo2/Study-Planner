"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useMemo } from "react";

import { fetchPlannerData, savePlannerData } from "@/features/planner/api/plannerApi";
import { loadPlannerData, savePlannerData as savePlannerDataLocally } from "@/lib/storage";
import type { PlannerData } from "@/types/planner";

export const plannerQueryKey = ["planner"] as const;

function shouldUseLocalFallback(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function usePlannerData() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: plannerQueryKey,
    queryFn: async () => {
      try {
        return await fetchPlannerData();
      } catch (error) {
        if (shouldUseLocalFallback(error)) {
          return loadPlannerData();
        }

        throw error;
      }
    },
    initialData: loadPlannerData,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: savePlannerData,
    onSuccess: (savedData) => {
      queryClient.setQueryData(plannerQueryKey, savedData);
    },
  });

  const data = query.data;

  useEffect(() => {
    savePlannerDataLocally(data);
  }, [data]);

  const setData = useCallback(
    (updater: (current: PlannerData) => PlannerData) => {
      queryClient.setQueryData<PlannerData>(plannerQueryKey, (current) => {
        const nextData = updater(current ?? loadPlannerData());
        savePlannerDataLocally(nextData);
        saveMutation.mutate(nextData);
        return nextData;
      });
    },
    [queryClient, saveMutation],
  );

  return useMemo(
    () => ({
      data,
      setData,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isSaving: saveMutation.isPending,
      loadError: query.error,
      saveError: saveMutation.error,
    }),
    [data, query.error, query.isFetching, query.isLoading, saveMutation.error, saveMutation.isPending, setData],
  );
}
