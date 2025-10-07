import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Save, X, Image, Upload } from "lucide-react";
import FeaturedImageSelector from "../FeaturedImageSelector";

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
  pressMediaName?: string;
  pressMediaLink?: string;
  isVisible?: boolean;
}

interface ExhibitionFormProps {
  exhibition?: Exhibition;
  artists: any[];
  artworks: any[];
  onSave: (exhibition: Exhibition) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ExhibitionForm = ({
  exhibition,
  artists,
  artworks,
  onSave,
  onCancel,
  isEditing,
}: ExhibitionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Exhibition>>(
    exhibition || {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      curator: "",
      status: "upcoming",
      featuredImage: "",
      galleryImages: [],
      assignedArtists: [],
      assignedArtworks: [],
      callForArtists: false,
      ctaLink: "",
      pressMediaName: "",
      pressMediaLink: "",
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

    try {
      setSaving(true);

      // Convert full URLs back to relative URLs for database storage
      const convertToRelativeUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http://localhost:3001/api/files/")) {
          return url.replace("http://localhost:3001/api/files/", "/api/file/");
        }
        return url;
      };

      const exhibitionData = {
        title: formData.title,
        slug:
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        description: formData.description || "",
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location || "",
        curator: formData.curator || "",
        status: formData.status || "upcoming",
        featured_image: convertToRelativeUrl(formData.featuredImage || ""),
        gallery_images: JSON.stringify(
          (formData.galleryImages || []).map(convertToRelativeUrl)
        ),
        assigned_artists: JSON.stringify(formData.assignedArtists || []),
        assigned_artworks: JSON.stringify(formData.assignedArtworks || []),
        call_for_artists: formData.callForArtists || false,
        cta_link: formData.ctaLink || "",
        press_media_name: formData.pressMediaName || "",
        press_media_link: formData.pressMediaLink || "",
        is_visible: formData.isVisible !== false,
      };

      console.log("=== EXHIBITION SAVE DEBUG ===");
      console.log("Form data:", formData);
      console.log("Exhibition data to send:", exhibitionData);
      console.log("Is editing:", isEditing);
      console.log("Exhibition ID:", exhibition?.id);

      if (isEditing && exhibition?.id) {
        await apiClient.updateExhibition(
          parseInt(exhibition.id),
          exhibitionData
        );
      } else {
        await apiClient.createExhibition(exhibitionData);
      }

      onSave(formData as Exhibition);
      toast({
        title: "Success",
        description: `Exhibition ${
          isEditing ? "updated" : "created"
        } successfully`,
      });
    } catch (error: any) {
      console.error("Error saving exhibition:", error);
      const errorMessage = error.message || "Failed to save exhibition";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      console.log("Uploading featured image:", file.name);
      // Use new Cloudinary-enabled upload method
      const response = await apiClient.uploadImage(file, "exhibition");
      console.log("Featured image upload response:", response);

      // The response now contains the Cloudinary URL directly
      const imageUrl = response.file.url;

      setFormData({
        ...formData,
        featuredImage: imageUrl,
      });

      toast({
        title: "Success",
        description: "Featured image uploaded to Cloudinary successfully",
      });
    } catch (error) {
      console.error("Error uploading featured image:", error);
      toast({
        title: "Error",
        description: "Failed to upload featured image",
        variant: "destructive",
      });
    } finally {
      // Reset the file input to prevent infinite loops
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const handleGalleryImageUpload = async (file: File) => {
    try {
      console.log("Uploading gallery image:", file.name);
      // Use new Cloudinary-enabled upload method
      const response = await apiClient.uploadImage(file, "exhibition");
      console.log("Upload response:", response);

      // The response now contains the Cloudinary URL directly
      const imageUrl = response.file.url;

      setFormData({
        ...formData,
        galleryImages: [...(formData.galleryImages || []), imageUrl],
      });

      toast({
        title: "Success",
        description: "Gallery image uploaded to Cloudinary successfully",
      });
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      toast({
        title: "Error",
        description: "Failed to upload gallery image",
        variant: "destructive",
      });
    } finally {
      // Reset the file input to prevent infinite loops
      const fileInput = document.getElementById(
        "gallery-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const handleBulkGalleryUpload = async (files: FileList) => {
    try {
      console.log("Bulk uploading gallery images:", files.length, "files");
      const uploadPromises = Array.from(files).map((file) =>
        apiClient.uploadImage(file, "exhibition")
      );

      const responses = await Promise.all(uploadPromises);
      console.log("Bulk upload responses:", responses);

      // Extract Cloudinary URLs from responses
      const imageUrls = responses.map((response) => response.file.url);

      setFormData({
        ...formData,
        galleryImages: [...(formData.galleryImages || []), ...imageUrls],
      });

      toast({
        title: "Success",
        description: `${files.length} gallery images uploaded to Cloudinary successfully`,
      });
    } catch (error) {
      console.error("Error bulk uploading gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      // Reset the file input to prevent infinite loops
      const fileInput = document.getElementById(
        "gallery-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const cleanupUploadedFiles = async () => {
    try {
      // Clean up featured image
      if (formData.featuredImage) {
        const fileId = formData.featuredImage.split("/").pop();
        if (fileId) {
          await apiClient.deleteFile(parseInt(fileId));
          console.log("Cleaned up featured image:", fileId);
        }
      }

      // Clean up gallery images
      if (formData.galleryImages && formData.galleryImages.length > 0) {
        const cleanupPromises = formData.galleryImages.map(async (imageUrl) => {
          const fileId = imageUrl.split("/").pop();
          if (fileId) {
            await apiClient.deleteFile(parseInt(fileId));
            console.log("Cleaned up gallery image:", fileId);
          }
        });
        await Promise.all(cleanupPromises);
      }
    } catch (error) {
      console.error("Error cleaning up uploaded files:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Exhibition" : "Add New Exhibition"}
        </CardTitle>
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
              placeholder="Enter exhibition title"
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter exhibition description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Enter exhibition location"
            />
          </div>

          <div>
            <Label htmlFor="curator">Curator</Label>
            <Input
              id="curator"
              value={formData.curator || ""}
              onChange={(e) =>
                setFormData({ ...formData, curator: e.target.value })
              }
              placeholder="Enter curator name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || "upcoming"}
            onValueChange={(value: "upcoming" | "current" | "past") =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Featured Image</Label>
          <p className="text-sm text-gray-600 mb-4">
            This image will be displayed prominently on the exhibition detail
            page and in exhibition cards.
          </p>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Featured Image
                </Button>
              </div>
              {formData.featuredImage && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setFormData({ ...formData, featuredImage: "" })
                  }
                  className="w-full sm:w-auto"
                >
                  Remove Image
                </Button>
              )}
            </div>

            {formData.featuredImage ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Current Featured Image:
                </p>
                <div className="aspect-video w-full max-w-lg overflow-hidden rounded-lg border-2 border-blue-200">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full max-w-lg border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No featured image selected
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Gallery Images</Label>
          <p className="text-sm text-gray-600 mb-4">
            Additional images that will be displayed in the gallery section of
            the exhibition detail page.
          </p>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      if (files.length === 1) {
                        handleGalleryImageUpload(files[0]);
                      } else {
                        handleBulkGalleryUpload(files);
                      }
                    }
                  }}
                  className="hidden"
                  id="gallery-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("gallery-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Gallery Images
                </Button>
              </div>
            </div>

            {formData.galleryImages && formData.galleryImages.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Gallery Images ({formData.galleryImages.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.galleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error("Image failed to load:", image);
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newGalleryImages =
                            formData.galleryImages.filter(
                              (_, i) => i !== index
                            );
                          setFormData({
                            ...formData,
                            galleryImages: newGalleryImages,
                          });
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full max-w-lg border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No gallery images added
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Assigned Artists</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {artists.map((artist) => (
                <label
                  key={artist.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.assignedArtists?.includes(
                        artist.id.toString()
                      ) || false
                    }
                    onChange={(e) => {
                      const currentArtists = formData.assignedArtists || [];
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          assignedArtists: [
                            ...currentArtists,
                            artist.id.toString(),
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedArtists: currentArtists.filter(
                            (id) => id !== artist.id.toString()
                          ),
                        });
                      }
                    }}
                  />
                  <span>{artist.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Assigned Artworks</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {artworks.map((artwork) => (
                <label
                  key={artwork.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.assignedArtworks?.includes(
                        artwork.id.toString()
                      ) || false
                    }
                    onChange={(e) => {
                      const currentArtworks = formData.assignedArtworks || [];
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          assignedArtworks: [
                            ...currentArtworks,
                            artwork.id.toString(),
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedArtworks: currentArtworks.filter(
                            (id) => id !== artwork.id.toString()
                          ),
                        });
                      }
                    }}
                  />
                  <span>{artwork.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="callForArtists"
              checked={formData.callForArtists || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, callForArtists: checked })
              }
            />
            <Label htmlFor="callForArtists">Call for Artists</Label>
          </div>

          {formData.callForArtists && (
            <div>
              <Label htmlFor="ctaLink">CTA Link</Label>
              <Input
                id="ctaLink"
                value={formData.ctaLink || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ctaLink: e.target.value })
                }
                placeholder="Enter CTA link"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="pressMediaName">Press Release Name</Label>
              <Input
                id="pressMediaName"
                value={formData.pressMediaName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pressMediaName: e.target.value })
                }
                placeholder="e.g., Press Release - Exhibition Name"
              />
            </div>

            <div>
              <Label htmlFor="pressMediaLink">Press Release Download Link</Label>
              <Input
                id="pressMediaLink"
                value={formData.pressMediaLink || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pressMediaLink: e.target.value })
                }
                placeholder="https://example.com/press-release.pdf"
              />
              <p className="text-sm text-gray-600 mt-1">
                Provide a direct link to the press release PDF file
              </p>
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
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? "Saving..."
              : isEditing
              ? "Update Exhibition"
              : "Add Exhibition"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await cleanupUploadedFiles();
              onCancel();
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExhibitionForm;
