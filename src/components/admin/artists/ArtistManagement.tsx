import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useArtistData } from "@/hooks/useArtistData";
import ArtistList from "./ArtistList";
import ArtistForm from "./ArtistForm";
import { AdminPage, LoadingPanel } from "../AdminUI";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  profileImage: string;
  socialMedia: Record<string, string>;
  assignedArtworks: string[];
  isVisible: boolean;
}

const ArtistManagement = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const { toast } = useToast();
  const { transformArtistsData } = useArtistData();

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminArtists();
      const transformedArtists = transformArtistsData(data);
      setArtists(transformedArtists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast({
        title: "Couldn't load the artists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, transformArtistsData]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleAdd = () => {
    setEditingArtist(undefined);
    setIsEditing(true);
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setEditingArtist(null);
    // Reload so a new artist gets its id and web address from the server
    fetchArtists();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingArtist(null);
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isVisible } : a))
    );
  };

  if (loading) {
    return (
      <AdminPage title="Artists">
        <LoadingPanel label="Loading artists…" />
      </AdminPage>
    );
  }

  if (isEditing) {
    return (
      <ArtistForm
        artist={editingArtist}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={!!editingArtist}
      />
    );
  }

  return (
    <ArtistList
      artists={artists}
      onEdit={handleEdit}
      onAdd={handleAdd}
      onRefresh={fetchArtists}
      onToggleVisibility={handleToggleVisibility}
    />
  );
};

export default ArtistManagement;
