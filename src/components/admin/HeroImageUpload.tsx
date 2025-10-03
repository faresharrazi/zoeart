import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface HeroImage {
  id: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  original_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  format?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface HeroImageUploadProps {
  onImagesChange?: (images: HeroImage[]) => void;
}

const HeroImageUpload: React.FC<HeroImageUploadProps> = ({ onImagesChange }) => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch existing hero images
  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      console.log("HeroImageUpload: Fetching hero images...");
      const response = await apiClient.getHeroImages();
      console.log("HeroImageUpload: API response:", response);
      if (response.success) {
        setHeroImages(response.data);
        onImagesChange?.(response.data);
        console.log("HeroImageUpload: Set hero images:", response.data);
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch hero images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file size (4MB limit)
        const maxFileSize = 4 * 1024 * 1024; // 4MB
        if (file.size > maxFileSize) {
          throw new Error(`File ${file.name} exceeds 4MB limit`);
        }

        // Upload to Cloudinary first
        const uploadResponse = await apiClient.uploadImage(file, "hero");
        
        // Then save to hero_images table
        const heroImageData = {
          cloudinary_url: uploadResponse.file.url,
          cloudinary_public_id: uploadResponse.file.publicId || uploadResponse.file.id,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          width: uploadResponse.file.width,
          height: uploadResponse.file.height,
          format: uploadResponse.file.format,
          display_order: heroImages.length, // Add to end
        };

        return await apiClient.uploadHeroImage(heroImageData);
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      
      if (successful.length > 0) {
        await fetchHeroImages(); // Refresh the list
        toast({
          title: "Success",
          description: `${successful.length} hero image(s) uploaded to Cloudinary successfully`,
        });
      }

      if (results.length !== successful.length) {
        toast({
          title: "Partial Success",
          description: `Some images failed to upload`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error uploading hero images:", error);
      toast({
        title: "Error",
        description: `Failed to upload hero images: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      await apiClient.deleteHeroImage(id);
      await fetchHeroImages(); // Refresh the list
      toast({
        title: "Success",
        description: "Hero image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting hero image:", error);
      toast({
        title: "Error",
        description: "Failed to delete hero image",
        variant: "destructive",
      });
    }
  };

  const handleMoveImage = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = heroImages.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= heroImages.length) return;

    try {
      // Swap display orders
      const currentOrder = heroImages[currentIndex].display_order;
      const newOrder = heroImages[newIndex].display_order;

      await Promise.all([
        apiClient.updateHeroImage(id, { display_order: newOrder }),
        apiClient.updateHeroImage(heroImages[newIndex].id, { display_order: currentOrder }),
      ]);

      await fetchHeroImages(); // Refresh the list
      toast({
        title: "Success",
        description: "Image order updated successfully",
      });
    } catch (error) {
      console.error("Error updating image order:", error);
      toast({
        title: "Error",
        description: "Failed to update image order",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading hero images...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Upload Hero Images</p>
              <p className="text-sm text-gray-500">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-400">
                Up to 4MB each, JPG format preferred
              </p>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                <p className="font-medium mb-1">💡 Hero Image Tips:</p>
                <p>• Images will be optimized to 1920x1080 with auto-crop</p>
                <p>• Use landscape orientation for best results</p>
                <p>• Images will appear in the home page slider</p>
              </div>
            </div>
            <Button
              onClick={() => document.getElementById("hero-upload")?.click()}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? "Uploading..." : "Select Images"}
            </Button>
            <Input
              id="hero-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Images List */}
      {heroImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Hero Images ({heroImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heroImages.map((image, index) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={image.cloudinary_url}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {image.original_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {image.width} × {image.height} • {formatFileSize(image.file_size || 0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Order: {image.display_order} • Format: {image.format?.toUpperCase()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Move Up */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveImage(image.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveImage(image.id, 'down')}
                      disabled={index === heroImages.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeroImageUpload;
