import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Image as ImageIcon } from "lucide-react";

interface FeaturedImageSelectorProps {
  images: string[];
  featuredImage: string | null;
  onFeaturedImageChange: (imageUrl: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const FeaturedImageSelector = ({
  images,
  featuredImage,
  onFeaturedImageChange,
  onImageUpload,
}: FeaturedImageSelectorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onFeaturedImageChange(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg  text-theme-text-primary mb-2">
          Featured Image
        </h3>
        <p className="text-theme-text-muted text-sm">
          Select one image from your gallery to be the featured image for this
          exhibition. This image will appear on exhibition cards and as the
          background on the detail page.
        </p>
      </div>

      {/* Current Featured Image */}
      {featuredImage && (
        <div className="space-y-2">
          <h4 className="text-sm  text-theme-text-primary">
            Current Featured Image:
          </h4>
          <div className="relative w-full max-w-md">
            <img
              src={featuredImage}
              alt="Featured image"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-theme-primary text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Image */}
      <div className="space-y-2">
        <h4 className="text-sm  text-theme-text-primary">
          Upload New Image:
        </h4>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="outline"
              disabled={isUploading}
              className="cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </label>
        </div>
      </div>

      {/* Gallery Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm  text-theme-text-primary">
            Select from Gallery ({images.length} images):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  featuredImage === image
                    ? "ring-2 ring-theme-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => onFeaturedImageChange(image)}
              >
                <CardContent className="p-2">
                  <div className="relative">
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    {featuredImage === image && (
                      <div className="absolute inset-0 bg-theme-primary/20 rounded flex items-center justify-center">
                        <Badge className="bg-theme-primary text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Images Message */}
      {images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
          <p className="text-theme-text-muted">
            No images in gallery yet. Upload some images to select a featured
            image.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeaturedImageSelector;
