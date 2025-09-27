import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Save, X, Upload, Image, Trash2 } from "lucide-react";
import FeaturedImageSelector from "../FeaturedImageSelector";

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

interface ArtworkFormProps {
  artwork?: Artwork;
  artists: any[];
  onSave: (artwork: Artwork) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ArtworkForm = ({
  artwork,
  artists,
  onSave,
  onCancel,
  isEditing,
}: ArtworkFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Artwork>>(
    artwork || {
      title: "",
      slug: "",
      artist_id: 0,
      artist_name: "",
      year: new Date().getFullYear(),
      medium: "",
      size: "",
      description: "",
      images: [],
      featured_image: "",
      isVisible: true,
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.artist_id) {
      toast({
        title: "Error",
        description: "Artist is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const artworkData = {
        title: formData.title,
        slug:
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        artist_id: formData.artist_id,
        year: formData.year || new Date().getFullYear(),
        medium: formData.medium || "",
        size: formData.size || "",
        description: formData.description || "",
        images: formData.images || [],
        featured_image: formData.featured_image || "",
        is_visible: formData.isVisible !== false,
      };

      if (isEditing && artwork?.id) {
        await apiClient.updateArtwork(parseInt(artwork.id), artworkData);
      } else {
        await apiClient.createArtwork(artworkData);
      }

      onSave(formData as Artwork);
      toast({
        title: "Success",
        description: `Artwork ${
          isEditing ? "updated" : "created"
        } successfully`,
      });
    } catch (error: any) {
      console.error("Error saving artwork:", error);
      const errorMessage = error.message || "Failed to save artwork";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const response = await apiClient.uploadFile(file, "artwork");
      const imageUrl = `/api/file/${response.file.id}`;

      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl],
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(file => handleImageUpload(file));
      await Promise.all(uploadPromises);
      
      toast({
        title: "Success",
        description: `${files.length} images uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      toast({
        title: "Error",
        description: "Failed to upload some images",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    const removedImage = newImages[index];
    newImages.splice(index, 1);
    
    // If the removed image was the featured image, clear it
    const newFeaturedImage = formData.featured_image === removedImage ? "" : formData.featured_image;
    
    setFormData({
      ...formData,
      images: newImages,
      featured_image: newFeaturedImage,
    });
  };

  const handleFeaturedImageChange = (imageUrl: string) => {
    setFormData({
      ...formData,
      featured_image: imageUrl,
    });
  };

  const selectedArtist = artists.find((a) => a.id === formData.artist_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Artwork" : "Add New Artwork"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter artwork title"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="Auto-generated from title"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="artist">Artist *</Label>
          <Select
            value={formData.artist_id?.toString() || ""}
            onValueChange={(value) => {
              const artistId = parseInt(value);
              const artist = artists.find((a) => a.id === artistId);
              setFormData({
                ...formData,
                artist_id: artistId,
                artist_name: artist?.name || "",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id.toString()}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: parseInt(e.target.value) || new Date().getFullYear(),
                })
              }
              placeholder="Enter year"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div>
            <Label htmlFor="medium">Medium</Label>
            <Input
              id="medium"
              value={formData.medium || ""}
              onChange={(e) =>
                setFormData({ ...formData, medium: e.target.value })
              }
              placeholder="e.g., Oil on canvas, Digital print"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={formData.size || ""}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            placeholder="e.g., 24 x 36 inches, 50 x 70 cm"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter artwork description..."
            rows={4}
          />
        </div>

        <div>
          <Label>Images</Label>
          <div className="space-y-4">
            {/* Multiple File Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleMultipleImageUpload(files);
                    }
                  }}
                  className="hidden"
                  id="multiple-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("multiple-image-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Multiple Images
                </Button>
              </div>
            </div>

            {/* Featured Image Selector */}
            <FeaturedImageSelector
              images={formData.images || []}
              featuredImage={formData.featured_image || ""}
              onFeaturedImageChange={handleFeaturedImageChange}
              onImageUpload={handleImageUpload}
            />

            {/* Gallery Images */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>Gallery Images ({formData.images.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`Artwork ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            checked={formData.isVisible !== false}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isVisible: checked })
            }
          />
          <Label htmlFor="isVisible">Visible on Frontend</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? "Saving..."
              : isEditing
              ? "Update Artwork"
              : "Add Artwork"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkForm;
