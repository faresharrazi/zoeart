import { apiClient } from "@/lib/apiClient";
import { useApi } from "./useApi";

export interface WorkingHour {
  id: number | string;
  day: string;
  time_frame: string;
  is_active: boolean;
}

/** Active opening hours, as shown on the public site. */
export const useWorkingHours = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getWorkingHours() as Promise<WorkingHour[]>,
    []
  );

  return {
    workingHours: data ?? [],
    loading,
    error: error?.message ?? null,
    refetch,
  };
};
