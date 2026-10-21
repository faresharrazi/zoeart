import { apiClient } from "@/lib/apiClient";
import { useApi } from "./useApi";

export interface HeroImage {
  id: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  original_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  format?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/** Active home page slider images, in display order. */
export const useHeroImages = () => {
  const { data, loading, error, refetch } = useApi(async () => {
    const response = await apiClient.getHeroImages();
    return [...(response.data as HeroImage[])].sort(
      (a, b) =>
        a.display_order - b.display_order ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, []);

  return {
    heroImages: data ?? [],
    loading,
    error: error?.message ?? null,
    refetch,
  };
};
