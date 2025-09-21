import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Grid3X3,
  Image as ImageIcon,
} from "lucide-react";

interface ExhibitionGalleryProps {
  images: string[];
  featuredImage: string | null;
  exhibitionTitle: string;
}

const ExhibitionGallery = ({
  images,
  featuredImage,
  exhibitionTitle,
}: ExhibitionGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  const allImages =
    featuredImage && !images.includes(featuredImage)
      ? [featuredImage, ...images]
      : images;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gallery</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {allImages.length} image{allImages.length !== 1 ? "s" : ""}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {allImages.slice(0, 8).map((image, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
            onClick={() => openGallery(index)}
          >
            <img
              src={image}
              alt={`${exhibitionTitle} - Image ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {index === 0 && featuredImage === image && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-xs">
                Featured
              </Badge>
            )}
            {index === 7 && allImages.length > 8 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">
                  +{allImages.length - 8} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {exhibitionTitle} - Gallery
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "carousel" : "grid")
                    }
                  >
                    {viewMode === "grid" ? (
                      <Grid3X3 className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-auto">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                      onClick={() => {
                        setViewMode("carousel");
                        setCurrentIndex(index);
                      }}
                    >
                      <img
                        src={image}
                        alt={`${exhibitionTitle} - Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {index === 0 && featuredImage === image && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={allImages[currentIndex]}
                      alt={`${exhibitionTitle} - Image ${currentIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <div className="flex justify-center mt-4">
                    <div className="flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentIndex
                              ? "bg-gallery-gold"
                              : "bg-gray-300"
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitionGallery;
