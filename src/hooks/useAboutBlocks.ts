import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

interface AboutBlock {
  id: number;
  block_id: string;
  title: string;
  content: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useAboutBlocks = () => {
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [visibleBlocks, setVisibleBlocks] = useState<AboutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const [allBlocks, visibleBlocksData] = await Promise.all([
        apiClient.getAboutBlocks(),
        apiClient.getVisibleAboutBlocks(),
      ]);

      // Sort blocks by sort_order
      const sortedBlocks = (allBlocks.data || []).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const sortedVisibleBlocks = (visibleBlocksData.data || []).sort(
        (a, b) => a.sort_order - b.sort_order
      );

      setBlocks(sortedBlocks);
      setVisibleBlocks(sortedVisibleBlocks);
      setError(null);
    } catch (err) {
      console.error("Error fetching about blocks:", err);
      setError("Failed to fetch about blocks");
      setBlocks([]);
      setVisibleBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlock = useCallback(
    async (blockData: Omit<AboutBlock, "id" | "created_at" | "updated_at">) => {
      try {
        const response = await apiClient.createAboutBlock(blockData);
        apiClient.clearCache(); // Clear cache before refreshing
        await fetchBlocks(); // Refresh the list
        return response;
      } catch (err) {
        console.error("Error creating about block:", err);
        throw err;
      }
    },
    [fetchBlocks]
  );

  const updateBlock = useCallback(
    async (id: number, blockData: Partial<AboutBlock>) => {
      try {
        const response = await apiClient.updateAboutBlock(id, blockData);
        apiClient.clearCache(); // Clear cache before refreshing
        await fetchBlocks(); // Refresh the list
        return response;
      } catch (err) {
        console.error("Error updating about block:", err);
        throw err;
      }
    },
    [fetchBlocks]
  );

  const toggleVisibility = useCallback(
    async (id: number, isVisible: boolean) => {
      try {
        const response = await apiClient.toggleAboutBlockVisibility(
          id,
          isVisible
        );
        apiClient.clearCache(); // Clear cache before refreshing
        await fetchBlocks(); // Refresh the list
        return response;
      } catch (err) {
        console.error("Error toggling block visibility:", err);
        throw err;
      }
    },
    [fetchBlocks]
  );

  const deleteBlock = useCallback(
    async (id: number) => {
      try {
        const response = await apiClient.deleteAboutBlock(id);
        apiClient.clearCache(); // Clear cache before refreshing
        await fetchBlocks(); // Refresh the list
        return response;
      } catch (err) {
        console.error("Error deleting about block:", err);
        throw err;
      }
    },
    [fetchBlocks]
  );

  const reorderBlocks = useCallback(
    async (blocks: Array<{ id: number; sort_order: number }>) => {
      try {
        const response = await apiClient.reorderAboutBlocks(blocks);
        // Clear cache before refreshing to get fresh data
        apiClient.clearCache();
        await fetchBlocks(); // Refresh the list
        return response;
      } catch (err) {
        console.error("Error reordering blocks:", err);
        throw err;
      }
    },
    [fetchBlocks]
  );

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return {
    blocks,
    visibleBlocks,
    loading,
    error,
    createBlock,
    updateBlock,
    toggleVisibility,
    deleteBlock,
    reorderBlocks,
    refreshBlocks: fetchBlocks,
  };
};
