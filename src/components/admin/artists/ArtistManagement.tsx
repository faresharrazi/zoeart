import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useArtistData } from "@/hooks/useArtistData";
import ArtistList from "./ArtistList";
import ArtistForm from "./ArtistForm";

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

  useEffect(() => {
    fetchArtists();
  }, [transformArtistsData]);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getArtists();
      const transformedArtists = transformArtistsData(data as any[]);
      setArtists(transformedArtists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast({
        title: "Error",
        description: "Failed to fetch artists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingArtist(undefined);
    setIsEditing(true);
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setIsEditing(true);
  };

  const handleSave = (artist: Artist) => {
    if (editingArtist) {
      // Update existing artist
      setArtists((prev) => prev.map((a) => (a.id === artist.id ? artist : a)));
    } else {
      // Add new artist
      setArtists((prev) => [...prev, artist]);
    }
    setIsEditing(false);
    setEditingArtist(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingArtist(null);
  };

  const handleDelete = (id: string) => {
    setArtists((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isVisible } : a))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Artist Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading artists...</span>
        </div>
      </div>
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
