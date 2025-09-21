import { useState, useEffect } from "react";
import { exhibitionService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface Exhibition {
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

export interface ExhibitionFormData {
  title: string;
  status: "upcoming" | "past";
  start_date: string;
  end_date: string;
  description?: string;
  location?: string;
  curator?: string;
  featured_image?: string;
  gallery_images?: string[];
  is_visible?: boolean;
}

export const useExhibitions = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exhibitionService.getAllForAdmin();
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

  const createExhibition = async (exhibitionData: ExhibitionFormData) => {
    try {
      const newExhibition = await exhibitionService.create(exhibitionData);
      setExhibitions((prev) => [...prev, newExhibition]);
      toast({
        title: "Success",
        description: "Exhibition created successfully",
      });
      return newExhibition;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create exhibition";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateExhibition = async (
    id: string,
    exhibitionData: Partial<ExhibitionFormData>
  ) => {
    try {
      const updatedExhibition = await exhibitionService.update(
        id,
        exhibitionData
      );
      setExhibitions((prev) =>
        prev.map((exhibition) =>
          exhibition.id === id ? updatedExhibition : exhibition
        )
      );
      toast({
        title: "Success",
        description: "Exhibition updated successfully",
      });
      return updatedExhibition;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update exhibition";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteExhibition = async (id: string) => {
    try {
      await exhibitionService.delete(id);
      setExhibitions((prev) =>
        prev.filter((exhibition) => exhibition.id !== id)
      );
      toast({
        title: "Success",
        description: "Exhibition deleted successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete exhibition";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const getExhibitionsByStatus = (status: "current" | "upcoming" | "past") => {
    return exhibitions.filter((exhibition) => exhibition.status === status);
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  return {
    exhibitions,
    loading,
    error,
    fetchExhibitions,
    createExhibition,
    updateExhibition,
    deleteExhibition,
    getExhibitionsByStatus,
  };
};
