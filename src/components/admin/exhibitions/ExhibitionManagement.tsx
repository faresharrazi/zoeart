import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import ExhibitionList from "./ExhibitionList";
import ExhibitionForm from "./ExhibitionForm";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "current" | "past";
  featuredImage?: string;
  galleryImages: string[];
  assignedArtists: string[];
  assignedArtworks: string[];
  callForArtists?: boolean;
  ctaLink?: string;
  isVisible?: boolean;
}

const ExhibitionManagement = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exhibitionsData, artistsData, artworksData] = await Promise.all([
        apiClient.getAdminExhibitions(),
        apiClient.getArtists(),
        apiClient.getArtworks(),
      ]);

      // Transform exhibitions data to match interface
      const transformedExhibitions = exhibitionsData.map((exhibition: any) => ({
        id: exhibition.id.toString(),
        title: exhibition.title,
        description: exhibition.description || "",
        startDate: exhibition.start_date,
        endDate: exhibition.end_date,
        location: exhibition.location || "",
        curator: exhibition.curator || "",
        status: exhibition.status,
        featuredImage: exhibition.featured_image || "",
        galleryImages: Array.isArray(exhibition.gallery_images)
          ? exhibition.gallery_images
          : [],
        assignedArtists: Array.isArray(exhibition.assigned_artists)
          ? exhibition.assigned_artists
          : [],
        assignedArtworks: Array.isArray(exhibition.assigned_artworks)
          ? exhibition.assigned_artworks
          : [],
        callForArtists: exhibition.call_for_artists || false,
        ctaLink: exhibition.cta_link || "",
        isVisible: exhibition.is_visible !== false,
      }));

      setExhibitions(transformedExhibitions);
      setArtists(artistsData);
      setArtworks(artworksData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load exhibitions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExhibition(undefined);
    setIsEditing(true);
  };

  const handleEdit = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition);
    setIsEditing(true);
  };

  const handleSave = (exhibition: Exhibition) => {
    if (editingExhibition) {
      // Update existing exhibition
      setExhibitions((prev) =>
        prev.map((e) => (e.id === exhibition.id ? exhibition : e))
      );
    } else {
      // Add new exhibition
      setExhibitions((prev) => [...prev, exhibition]);
    }
    setIsEditing(false);
    setEditingExhibition(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingExhibition(null);
  };

  const handleDelete = (id: string) => {
    setExhibitions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setExhibitions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isVisible } : e))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Exhibition Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading exhibitions...</span>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ExhibitionForm
        exhibition={editingExhibition}
        artists={artists}
        artworks={artworks}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={!!editingExhibition}
      />
    );
  }

  return (
    <ExhibitionList
      exhibitions={exhibitions}
      onEdit={handleEdit}
      onAdd={handleAdd}
      onRefresh={fetchData}
      onToggleVisibility={handleToggleVisibility}
    />
  );
};

export default ExhibitionManagement;
