import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fileService } from "@/lib/database";
import { Upload, X, Star, StarOff, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageGalleryManagerProps {
  images: string[];
  featuredImage: string | null;
  onImagesChange: (images: string[]) => void;
  onFeaturedImageChange: (imageUrl: string | null) => void;
  type: "artworks" | "artists" | "exhibitions";
}

const ImageGalleryManager = ({
  images,
  featuredImage,
  onImagesChange,
  onFeaturedImageChange,
  type,
}: ImageGalleryManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await fileService.uploadImage(file, type);
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);

      // If no featured image is set, use the first uploaded image
      if (!featuredImage && uploadedUrls.length > 0) {
        onFeaturedImageChange(uploadedUrls[0]);
      }

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    const newImages = images.filter((img) => img !== imageUrl);
    onImagesChange(newImages);

    // If the removed image was the featured image, clear it
    if (featuredImage === imageUrl) {
      onFeaturedImageChange(null);
    }
  };

  const handleSetFeatured = (imageUrl: string) => {
    onFeaturedImageChange(imageUrl);
  };

  const handleRemoveFeatured = () => {
    onFeaturedImageChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gallery Images</h3>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="gallery-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("gallery-upload")?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Add Images"}
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />

                  {/* Featured badge */}
                  {featuredImage === imageUrl && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {featuredImage !== imageUrl ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetFeatured(imageUrl)}
                          className="h-6 w-6 p-0"
                        >
                          <StarOff className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleRemoveFeatured}
                          className="h-6 w-6 p-0"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(imageUrl)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400">
            Click "Add Images" to upload gallery images
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
