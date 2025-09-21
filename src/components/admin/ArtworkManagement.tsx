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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Image,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import MediaSelector from "./MediaSelector";
import {
  useArtworks,
  type Artwork,
  type ArtworkFormData,
} from "@/hooks/use-artworks";
import { useArtists } from "@/hooks/use-artists";
import { fileService } from "@/lib/database";

const ArtworkManagement = () => {
  const { artworks, loading, createArtwork, updateArtwork, deleteArtwork } =
    useArtworks();
  const { artists } = useArtists();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ArtworkFormData>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEdit = (artwork: Artwork) => {
    setFormData({
      title: artwork.title,
      artist_id: artwork.artist_id,
      year: artwork.year,
      medium: artwork.medium,
      description: artwork.description || "",
      image: artwork.image,
      slug: artwork.slug,
      status: artwork.status,
      dimensions: artwork.dimensions,
      technique: artwork.technique,
      provenance: artwork.provenance,
      is_visible: artwork.is_visible,
    });
    setEditingId(artwork.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      artist_id: "",
      year: new Date().getFullYear(),
      medium: "",
      description: "",
      image: null,
      slug: "",
      status: "available",
      dimensions: null,
      technique: null,
      provenance: null,
      is_visible: true,
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.artist_id) {
      toast({
        title: "Error",
        description: "Title and Artist are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        await updateArtwork(editingId, formData);
      } else {
        // Generate slug from title
        const slug = formData.title.toLowerCase().replace(/\s+/g, "-");
        await createArtwork({ ...formData, slug } as ArtworkFormData);
      }

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArtwork(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleVisibilityToggle = async (
    id: string,
    currentVisibility: boolean
  ) => {
    try {
      await updateArtwork(id, { is_visible: !currentVisibility });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await fileService.uploadImage(file, "artworks");
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
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
                <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">
                  Artist *
                </label>
                <Select
                  value={formData.artist_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, artist_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
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
                <label className="block text-sm font-medium mb-2">Medium</label>
                <Input
                  value={formData.medium || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, medium: e.target.value })
                  }
                  placeholder="Oil on Canvas, Acrylic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={formData.status || "available"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={formData.is_visible || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_visible: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="is_visible" className="text-sm font-medium">
                  Visible on website
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dimensions
                </label>
                <Input
                  value={formData.dimensions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dimensions: e.target.value })
                  }
                  placeholder="e.g., 48 x 60 inches"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Technique
                </label>
                <Input
                  value={formData.technique || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, technique: e.target.value })
                  }
                  placeholder="e.g., Oil on Canvas, Acrylic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Provenance
                </label>
                <Input
                  value={formData.provenance || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, provenance: e.target.value })
                  }
                  placeholder="e.g., Created in artist's studio, 2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
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
              <label className="block text-sm font-medium mb-2">
                Artwork Image
              </label>
              <div className="space-y-2">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Selected artwork"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <div className="mt-2 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMediaSelector(true)}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="artwork-image-upload"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          document
                            .getElementById("artwork-image-upload")
                            ?.click()
                        }
                      >
                        Upload New
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="artwork-image-upload-new"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("artwork-image-upload-new")
                          ?.click()
                      }
                      className="w-full py-8 border-dashed"
                    >
                      <Image className="w-6 h-6 mr-2" />
                      Upload Artwork Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-gallery-gold hover:bg-gallery-gold/90"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingId ? "Update Artwork" : "Add Artwork"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Artwork Management</h2>
          <Button
            onClick={handleAdd}
            className="bg-gallery-gold hover:bg-gallery-gold/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Artwork
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Artwork Management</h2>
        <Button
          onClick={handleAdd}
          className="bg-gallery-gold hover:bg-gallery-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={artwork.image || "/placeholder-artwork.jpg"}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{artwork.title}</h3>
                <Badge className={getStatusColor(artwork.status)}>
                  {artwork.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-1">
                {artwork.artists?.name || "Unknown Artist"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {artwork.year} • {artwork.medium}
              </p>

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
                  onClick={() =>
                    handleVisibilityToggle(artwork.id, artwork.is_visible)
                  }
                  className={
                    artwork.is_visible
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-400 hover:text-gray-600"
                  }
                >
                  {artwork.is_visible ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(artwork)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(artwork.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showMediaSelector && (
        <MediaSelector
          selectedImage={formData.image || ""}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, image: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="artwork"
        />
      )}
    </div>
  );
};

export default ArtworkManagement;
