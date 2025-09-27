import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

interface HeroImage {
  id: number;
  originalName: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
}

export const useHeroImages = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHeroImages();
      
      // Handle the response structure: { success: true, data: [...] }
      const images = response.data || response || [];

      // Ensure images is an array
      if (!Array.isArray(images)) {
        console.warn("Hero images response is not an array:", images);
        setHeroImages([]);
        return;
      }

      // Map file_path to url and convert snake_case to camelCase
      const mappedImages = images.map((image: any) => ({
        id: image.id,
        originalName: image.original_name,
        filename: image.filename,
        url: `/api/file/${image.id}`, // Use API endpoint to serve files from database
        fileSize: image.file_size,
        mimeType: image.mime_type,
      }));
      setHeroImages(mappedImages);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      // Fallback to placeholder images
      setHeroImages([
        {
          id: 0,
          originalName: "placeholder",
          filename: "placeholder",
          url: "https://via.placeholder.com/1920x1080/393E46/FFFFFF?text=Aether+Art+Space",
          fileSize: 0,
          mimeType: "image/png",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  return { heroImages, loading, refreshHeroImages: fetchHeroImages };
};
