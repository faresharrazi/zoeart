import { useState, useEffect } from "react";
import { artistService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface Artist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  education: string;
  exhibitions: string;
  profile_image: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  email: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtistFormData {
  name: string;
  specialty: string;
  bio: string;
  education: string;
  exhibitions: string;
  profile_image?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  website?: string | null;
  email?: string | null;
  is_visible?: boolean;
}

export const useArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artistService.getAllForAdmin();
      setArtists(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch artists";
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

  const createArtist = async (artistData: ArtistFormData) => {
    try {
      const newArtist = await artistService.create(artistData);
      setArtists((prev) => [...prev, newArtist]);
      toast({
        title: "Success",
        description: "Artist created successfully",
      });
      return newArtist;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateArtist = async (
    id: string,
    artistData: Partial<ArtistFormData>
  ) => {
    try {
      const updatedArtist = await artistService.update(id, artistData);
      setArtists((prev) =>
        prev.map((artist) => (artist.id === id ? updatedArtist : artist))
      );
      toast({
        title: "Success",
        description: "Artist updated successfully",
      });
      return updatedArtist;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      await artistService.delete(id);
      setArtists((prev) => prev.filter((artist) => artist.id !== id));
      toast({
        title: "Success",
        description: "Artist deleted successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return {
    artists,
    loading,
    error,
    fetchArtists,
    createArtist,
    updateArtist,
    deleteArtist,
  };
};
