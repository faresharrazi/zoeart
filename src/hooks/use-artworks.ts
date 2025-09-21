import { useState, useEffect } from "react";
import { artworkService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface Artwork {
  id: string;
  title: string;
  artist_id: string;
  year: number;
  medium: string;
  description: string | null;
  image: string | null;
  slug: string;
  status: "available" | "sold" | "reserved";
  dimensions: string | null;
  technique: string | null;
  provenance: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  artists?: {
    id: string;
    name: string;
    specialty: string;
  };
}

export interface ArtworkFormData {
  title: string;
  artist_id: string;
  year: number;
  medium: string;
  description?: string;
  image?: string | null;
  slug: string;
  status?: "available" | "sold" | "reserved";
  dimensions?: string | null;
  technique?: string | null;
  provenance?: string | null;
  is_visible?: boolean;
}

export const useArtworks = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artworkService.getAllForAdmin();
      setArtworks(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch artworks";
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

  const createArtwork = async (artworkData: ArtworkFormData) => {
    try {
      const newArtwork = await artworkService.create(artworkData);
      setArtworks((prev) => [...prev, newArtwork]);
      toast({
        title: "Success",
        description: "Artwork created successfully",
      });
      return newArtwork;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create artwork";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateArtwork = async (
    id: string,
    artworkData: Partial<ArtworkFormData>
  ) => {
    try {
      const updatedArtwork = await artworkService.update(id, artworkData);
      setArtworks((prev) =>
        prev.map((artwork) => (artwork.id === id ? updatedArtwork : artwork))
      );
      toast({
        title: "Success",
        description: "Artwork updated successfully",
      });
      return updatedArtwork;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update artwork";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      await artworkService.delete(id);
      setArtworks((prev) => prev.filter((artwork) => artwork.id !== id));
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete artwork";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const searchArtworks = async (query: string) => {
    try {
      setLoading(true);
      const data = await artworkService.search(query);
      setArtworks(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search artworks";
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
    fetchArtworks();
  }, []);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    searchArtworks,
  };
};
