import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import ArtworkList from "./ArtworkList";
import ArtworkForm from "./ArtworkForm";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist_id: number;
  artist_name: string;
  year: number;
  medium: string;
  size: string;
  description: string;
  images: string[];
  featured_image?: string;
  isVisible: boolean;
}

const ArtworkManagement = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artworksData, artistsData] = await Promise.all([
        apiClient.getArtworks(),
        apiClient.getArtists(),
      ]);

      console.log("Raw artworks data:", artworksData);
      console.log("Raw artists data:", artistsData);

      // Transform artworks data to match our interface
      const transformedArtworks = artworksData.map((artwork: any) => ({
        id: artwork.id.toString(),
        title: artwork.title,
        slug: artwork.slug,
        artist_id: artwork.artist_id,
        artist_name: artwork.artist_name || "Unknown Artist",
        year: artwork.year || new Date().getFullYear(),
        medium: artwork.medium || "",
        size: artwork.size || "",
        description: artwork.description || "",
        images: artwork.images || [],
        featured_image: artwork.featured_image || "",
        isVisible: artwork.is_visible !== false,
      }));

      console.log("Transformed artworks:", transformedArtworks);
      setArtworks(transformedArtworks);
      setArtists(artistsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load artworks data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingArtwork(undefined);
    setIsEditing(true);
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setIsEditing(true);
  };

  const handleSave = (artwork: Artwork) => {
    if (editingArtwork) {
      // Update existing artwork
      setArtworks((prev) =>
        prev.map((a) => (a.id === artwork.id ? artwork : a))
      );
    } else {
      // Add new artwork
      setArtworks((prev) => [...prev, artwork]);
    }
    setIsEditing(false);
    setEditingArtwork(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingArtwork(null);
  };

  const handleDelete = (id: string) => {
    setArtworks((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isVisible } : a))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading artworks...</span>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ArtworkForm
        artwork={editingArtwork}
        artists={artists}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={!!editingArtwork}
      />
    );
  }

  return (
    <ArtworkList
      artworks={artworks}
      onEdit={handleEdit}
      onAdd={handleAdd}
      onRefresh={fetchData}
      onDelete={handleDelete}
      onToggleVisibility={handleToggleVisibility}
    />
  );
};

export default ArtworkManagement;
