import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Upload, Eye } from "lucide-react";

interface PageHeroConfigProps {
  heroBackgrounds: {
    home: string;
    exhibitions: string;
    artists: string;
    about: string;
    contact: string;
    collection: string;
  };
  onHeroBackgroundChange: (page: string, imageUrl: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const PageHeroConfig = ({
  heroBackgrounds,
  onHeroBackgroundChange,
  onImageUpload,
}: PageHeroConfigProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<string | null>(null);

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

  const pageNames = {
    home: "Home Page",
    exhibitions: "Exhibitions Page",
    artists: "Artists Page",
    about: "About Page",
    contact: "Contact Page",
    collection: "Collection Page",
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    page: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onHeroBackgroundChange(page, imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string, page: string) => {
    onHeroBackgroundChange(page, imageUrl);
    setPreviewImage(null);
    setPreviewPage(null);
  };

  const handlePreview = (imageUrl: string, page: string) => {
    setPreviewImage(imageUrl);
    setPreviewPage(page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
          Page Hero Background Images
        </h3>
        <p className="text-theme-text-muted text-sm">
          Configure the background images for each page's hero section. These
          images will appear behind the page titles and content with a dark
          overlay for text readability.
        </p>
      </div>

      {/* Page Configurations */}
      {Object.entries(heroBackgrounds).map(([page, currentImage]) => (
        <Card key={page}>
          <CardHeader>
            <CardTitle className="text-theme-text-primary">
              {pageNames[page as keyof typeof pageNames]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Background */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-theme-text-primary">Current Background</div>
                <div className="relative w-full max-w-md">
                  <img
                    src={currentImage}
                    alt={`${pageNames[page as keyof typeof pageNames]} background`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-theme-primary text-white">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Upload New Image */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-theme-text-primary">Upload New Image</div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, page)}
                    disabled={isUploading}
                    className="hidden"
                    id={`${page}-upload`}
                  />
                  <label htmlFor={`${page}-upload`}>
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

              {/* Available Images */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-theme-text-primary">Select from Available Images</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableImages.map((image, index) => (
                    <div key={index} className="space-y-1">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-20 object-cover rounded-lg shadow-md cursor-pointer"
                          onClick={() => handleImageSelect(image.url, page)}
                        />
                        {currentImage === image.url && (
                          <div className="absolute inset-0 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                            <Badge className="bg-theme-primary text-white text-xs">
                              <ImageIcon className="w-2 h-2 mr-1" />
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
                              handlePreview(image.url, page);
                            }}
                            className="p-1 h-5 w-5"
                          >
                            <Eye className="w-2 h-2" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-theme-text-muted text-center truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Preview Modal */}
      {previewImage && previewPage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-theme-text-primary">
                  Preview Hero Background - {pageNames[previewPage as keyof typeof pageNames]}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPreviewImage(null);
                    setPreviewPage(null);
                  }}
                  className="p-2"
                >
                  ×
                </Button>
              </div>

              {/* Preview Hero Section */}
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="relative h-64 bg-gradient-hero">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${previewImage})` }}
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl" />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        {pageNames[previewPage as keyof typeof pageNames]}
                      </h1>
                      <p className="text-lg md:text-xl drop-shadow-md max-w-2xl mx-auto">
                        This is how the hero section will look with the selected background image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewImage(null);
                    setPreviewPage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleImageSelect(previewImage, previewPage)}
                >
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

export default PageHeroConfig;
