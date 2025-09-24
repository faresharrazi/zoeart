import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Upload, Eye } from "lucide-react";

interface NavigationConfigProps {
  currentBackgroundImage: string;
  onBackgroundImageChange: (imageUrl: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const NavigationConfig = ({
  currentBackgroundImage,
  onBackgroundImageChange,
  onImageUpload,
}: NavigationConfigProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Available background images from assets
  const availableImages = [
    { url: "/gallery-hero.jpg", name: "Gallery Hero" },
    { url: "/gallery-hero2.jpg", name: "Gallery Hero 2" },
    { url: "/gallery-hero3.jpg", name: "Gallery Hero 3" },
    { url: "/artwork-abstract-1.jpg", name: "Abstract Art 1" },
    { url: "/artwork-abstract-2.jpg", name: "Abstract Art 2" },
    { url: "/artwork-geometric-1.jpg", name: "Geometric Art" },
    { url: "/artwork-landscape-1.jpg", name: "Landscape Art" },
    { url: "/artwork-portrait-1.jpg", name: "Portrait Art" },
    { url: "/artwork-sculpture-1.jpg", name: "Sculpture Art" },
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onBackgroundImageChange(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onBackgroundImageChange(imageUrl);
    setPreviewImage(null);
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
          Navigation Background Image
        </h3>
        <p className="text-theme-text-muted text-sm">
          Configure the background image for the navigation bar across all
          pages. The image will appear with reduced opacity to maintain text
          readability.
        </p>
      </div>

      {/* Current Background Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-theme-text-primary">
            Current Background
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full max-w-md">
              <img
                src={currentBackgroundImage}
                alt="Current navigation background"
                className="w-full h-32 object-cover rounded-lg shadow-md"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-theme-primary text-white">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
            <div className="text-sm text-theme-text-muted">
              <strong>Current Image:</strong>{" "}
              {currentBackgroundImage.split("/").pop()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload New Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-theme-text-primary">
            Upload New Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="nav-bg-upload"
                className="text-theme-text-primary"
              >
                Choose Image File
              </Label>
              <div className="flex items-center space-x-4 mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="nav-bg-upload"
                />
                <label htmlFor="nav-bg-upload">
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-theme-text-primary">
            Select from Available Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableImages.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded-lg shadow-md cursor-pointer"
                    onClick={() => handleImageSelect(image.url)}
                  />
                  {currentBackgroundImage === image.url && (
                    <div className="absolute inset-0 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                      <Badge className="bg-theme-primary text-white">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(image.url);
                      }}
                      className="p-1 h-6 w-6"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-theme-text-muted text-center">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-theme-text-primary">
                  Preview Navigation Background
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewImage(null)}
                  className="p-2"
                >
                  ×
                </Button>
              </div>

              {/* Preview Navigation Bar */}
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="relative bg-theme-background/95 backdrop-blur-sm border-b border-theme-border">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{ backgroundImage: `url(${previewImage})` }}
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-theme-background/80" />

                  <div className="container mx-auto px-6 py-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold tracking-tight">
                        <span className="hover:text-theme-primary transition-smooth">
                          Aether Art Space
                        </span>
                      </div>
                      <div className="hidden md:flex items-center space-x-8">
                        <span className="text-theme-text-muted hover:text-theme-text-primary transition-smooth">
                          Exhibitions
                        </span>
                        <span className="text-theme-text-muted hover:text-theme-text-primary transition-smooth">
                          Artists
                        </span>
                        <span className="text-theme-text-muted hover:text-theme-text-primary transition-smooth">
                          Gallery
                        </span>
                        <span className="text-theme-text-muted hover:text-theme-text-primary transition-smooth">
                          About
                        </span>
                        <span className="text-theme-text-muted hover:text-theme-text-primary transition-smooth">
                          Contact
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPreviewImage(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleImageSelect(previewImage)}>
                  Use This Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationConfig;
