import { useState, useEffect } from "react";
import { exhibitionService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface PublicExhibition {
  id: string;
  title: string;
  status: "upcoming" | "past";
  start_date: string;
  end_date: string;
  description: string | null;
  location: string | null;
  curator: string | null;
  featured_image: string | null;
  gallery_images: string[] | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  exhibition_artworks?: {
    artworks: {
      id: string;
      title: string;
      image: string | null;
      artists: {
        name: string;
      };
    };
  }[];
}

export const usePublicExhibitions = () => {
  const [exhibitions, setExhibitions] = useState<PublicExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exhibitionService.getAll(); // This filters by is_visible = true
      setExhibitions(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch exhibitions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  return {
    exhibitions,
    loading,
    error,
  };
};
