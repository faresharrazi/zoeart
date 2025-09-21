import { useState, useEffect } from "react";
import { artistService } from "@/lib/database";
import { useToast } from "./use-toast";

export interface PublicArtist {
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

export const usePublicArtists = () => {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artistService.getAll(); // This filters by is_visible = true
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

  useEffect(() => {
    fetchArtists();
  }, []);

  return {
    artists,
    loading,
    error,
  };
};
