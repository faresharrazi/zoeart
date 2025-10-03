import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

interface HeroImage {
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

export const useHeroImagesNew = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("useHeroImagesNew: Fetching hero images...");
      console.log("useHeroImagesNew: About to call apiClient.getHeroImages()");
      
      const response = await apiClient.getHeroImages();
      console.log("useHeroImagesNew: API response:", response);
      console.log("useHeroImagesNew: Response success:", response.success);
      console.log("useHeroImagesNew: Response data:", response.data);
      console.log("useHeroImagesNew: Response data length:", response.data?.length);
      
      if (response.success) {
        // Sort by display_order, then by created_at
        const sortedImages = response.data.sort((a: HeroImage, b: HeroImage) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        console.log("useHeroImagesNew: Sorted images:", sortedImages);
        console.log("useHeroImagesNew: Setting hero images to:", sortedImages);
        setHeroImages(sortedImages);
      } else {
        console.error("useHeroImagesNew: API response not successful:", response);
        setError("Failed to fetch hero images");
      }
    } catch (err) {
      console.error("useHeroImagesNew: Error fetching hero images:", err);
      console.error("useHeroImagesNew: Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useHeroImagesNew: useEffect triggered");
    fetchHeroImages();
  }, []);

  return {
    heroImages,
    loading,
    error,
    refetch: fetchHeroImages,
  };
};
