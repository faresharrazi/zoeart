import { useState, useEffect } from "react";
import { artworkService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface PublicArtwork {
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

export const usePublicArtworks = () => {
  const [artworks, setArtworks] = useState<PublicArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artworkService.getAll(); // This filters by is_visible = true
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
    searchArtworks,
  };
};
