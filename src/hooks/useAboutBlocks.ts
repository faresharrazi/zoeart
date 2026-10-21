import { useCallback, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { useApi } from "./useApi";

export interface AboutBlock {
  id: number;
  block_id: string;
  title: string;
  content: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * About page blocks. The public page gets visible blocks only; the admin
 * editor passes includeHidden to manage all of them.
 */
export const useAboutBlocks = ({ includeHidden = false } = {}) => {
  const { data, loading, error, refetch } = useApi(async () => {
    const response = includeHidden
      ? await apiClient.getAdminAboutBlocks()
      : await apiClient.getAboutBlocks();
    return [...((response.data as AboutBlock[]) || [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }, [includeHidden]);

  const blocks = useMemo(() => data ?? [], [data]);
  const visibleBlocks = useMemo(
    () => blocks.filter((block) => block.is_visible),
    [blocks]
  );

  // Run a change, then reload the blocks
  const withRefresh = useCallback(
    <Args extends unknown[], R>(change: (...args: Args) => Promise<R>) =>
      async (...args: Args) => {
        const result = await change(...args);
        await refetch();
        return result;
      },
    [refetch]
  );

  return {
    blocks,
    visibleBlocks,
    loading,
    error: error?.message ?? null,
    createBlock: withRefresh(
      (
        blockData: Pick<AboutBlock, "title" | "content" | "is_visible"> & {
          sort_order?: number;
        }
      ) => apiClient.createAboutBlock(blockData)
    ),
    updateBlock: withRefresh((id: number, blockData: Partial<AboutBlock>) =>
      apiClient.updateAboutBlock(id, blockData)
    ),
    toggleVisibility: withRefresh((id: number, isVisible: boolean) =>
      apiClient.toggleAboutBlockVisibility(id, isVisible)
    ),
    deleteBlock: withRefresh((id: number) => apiClient.deleteAboutBlock(id)),
    reorderBlocks: withRefresh(
      (blocks: Array<{ id: number; sort_order: number }>) =>
        apiClient.reorderAboutBlocks(blocks)
    ),
    refreshBlocks: refetch,
  };
};
