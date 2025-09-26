import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Image } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

// Mock data structure - replace with real API calls later
interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  size: string;
  description: string;
  images: string[];
  slug: string;
}

// Artworks will be fetched from database

// Artists will be fetched from database

const ArtworkManagement = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Artwork>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artworksData, artistsData] = await Promise.all([
          apiClient.getArtworks(),
          apiClient.getArtists(),
        ]);
        setArtworks(artworksData);
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

    fetchData();
  }, [toast]);

  const handleEdit = (artwork: Artwork) => {
    setFormData(artwork);
    setEditingId(artwork.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      artist: "",
      year: new Date().getFullYear(),
      medium: "",
      size: "",
      description: "",
      images: [],
      slug: "",
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.artist) {
      toast({
        title: "Error",
        description: "Title and Artist are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const artworkData = {
        title: formData.title,
        artist_id: formData.artist,
        year: formData.year || "",
        medium: formData.medium || "",
        size: formData.size || "",
        description: formData.description || "",
        images: JSON.stringify(formData.images || []),
      };

      if (editingId) {
        // Update existing artwork
        await apiClient.updateArtwork(parseInt(editingId), artworkData);
        toast({
          title: "Success",
          description: "Artwork updated successfully",
        });
      } else {
        // Add new artwork
        await apiClient.createArtwork(artworkData);
        toast({
          title: "Success",
          description: "New artwork added successfully",
        });
      }

      // Refresh data from database
      const artworksData = await apiClient.getArtworks();
      setArtworks(artworksData);

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Error",
        description: "Failed to save artwork",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteArtwork(parseInt(id));
      setArtworks(artworks.filter((artwork) => artwork.id !== id));
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Mock upload function - in a real app, this would upload to your storage
    return URL.createObjectURL(file);
  };

  const handleAddImage = async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    setFormData({
      ...formData,
      images: [...(formData.images || []), imageUrl],
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl ">
            {editingId ? "Edit Artwork" : "Add New Artwork"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm  mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter artwork title"
                />
              </div>
              <div>
                <label className="block text-sm  mb-2">
                  Artist *
                </label>
                <Select
                  value={formData.artist || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, artist: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.name}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm  mb-2">Year</label>
                <Input
                  type="number"
                  value={formData.year || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm  mb-2">Medium</label>
                <Input
                  value={formData.medium || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, medium: e.target.value })
                  }
                  placeholder="Oil on Canvas, Acrylic, etc."
                />
              </div>
              <div>
                <label className="block text-sm  mb-2">Size</label>
                <Input
                  value={formData.size || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  placeholder="48 x 60 inches"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm  mb-2">
                Description
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter artwork description..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm  mb-2">
                Artwork Images
              </label>
              <div className="space-y-4">
                {/* Display existing images */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Artwork ${index + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload new image */}
                <div className="border-2 border-dashed border-theme-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAddImage(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Image className="w-8 h-8 text-theme-text-muted" />
                    <span className="text-theme-text-muted">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-sm text-theme-text-muted">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="">
              {editingId ? "Update Artwork" : "Add Artwork"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl ">Artwork Management</h2>
        <Button onClick={handleAdd} className="">
          <Plus className="w-4 h-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={artwork.images[0]}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className=" text-lg">{artwork.title}</h3>
                <p className="text-theme-text-muted mb-1">{artwork.artist}</p>
                <p className="text-sm text-theme-text-muted mb-1">
                  {artwork.year} • {artwork.medium}
                </p>
                <p className="text-sm text-theme-text-muted">{artwork.size}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`/artwork/${artwork.slug}`, "_blank")
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(artwork)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{artwork.title}</strong> by{" "}
                        <strong>{artwork.artist}</strong>? This action cannot be
                        undone and will remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(artwork.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Artwork
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtworkManagement;
