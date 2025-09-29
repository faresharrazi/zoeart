import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// Fallback gallery images - placeholder URLs for when no real exhibition images are provided
const sampleImages = [
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+1",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+2",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+3",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+4",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+5",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+6",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+7",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+8",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+9",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+10",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+11",
  "https://via.placeholder.com/400x300/393E46/FFFFFF?text=Gallery+Image+12",
];

interface ExhibitionGalleryProps {
  images?: string[];
  title?: string;
}

const ExhibitionGallery = ({
  images = sampleImages,
  title = "Exhibition Gallery",
}: ExhibitionGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return;

    if (direction === "prev") {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
      );
    } else {
      setSelectedImageIndex(
        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
      );
    }
    // Reset zoom and position when navigating
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") navigateImage("prev");
    if (e.key === "ArrowRight") navigateImage("next");
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only enable wheel zoom on desktop (md and up)
    if (window.innerWidth >= 768) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  return (
    <section className="py-16 bg-theme-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl  text-theme-text-primary mb-4">
            {title}
          </h2>
        </div>

        {/* Album View */}
        <div className="max-w-4xl mx-auto">
          {/* Mobile: 2 columns - show 3 images + icon */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(index)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 relative">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center text-theme-text-muted">
                            <div class="w-8 h-8 mx-auto mb-2 bg-theme-primary/20 rounded-full flex items-center justify-center">
                              <svg class="w-4 h-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <p class="text-xs">${index + 1}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-2">
                        <svg
                          className="w-4 h-4 text-theme-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile + icon */}
            {images.length > 3 && (
              <div
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(3)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/20 to-theme-primary/10 relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-theme-primary/30 rounded-full flex items-center justify-center group-hover:bg-theme-primary/50 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-theme-primary group-hover:text-white transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-theme-primary  text-xs group-hover:text-white transition-colors duration-300">
                      +{images.length - 3}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tablet: 3 columns - show 5 images + icon */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-3">
            {images.slice(0, 5).map((image, index) => (
              <div
                key={index}
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(index)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 relative">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center text-theme-text-muted">
                            <div class="w-8 h-8 mx-auto mb-2 bg-theme-primary/20 rounded-full flex items-center justify-center">
                              <svg class="w-4 h-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <p class="text-xs">${index + 1}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-2">
                        <svg
                          className="w-4 h-4 text-theme-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}

            {/* Tablet + icon */}
            {images.length > 5 && (
              <div
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(5)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/20 to-theme-primary/10 relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-2 bg-theme-primary/30 rounded-full flex items-center justify-center group-hover:bg-theme-primary/50 transition-colors duration-300">
                      <svg
                        className="w-7 h-7 text-theme-primary group-hover:text-white transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-theme-primary  text-sm group-hover:text-white transition-colors duration-300">
                      +{images.length - 5}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: 4 columns - show 7 images + icon */}
          <div className="hidden lg:grid grid-cols-4 gap-3">
            {images.slice(0, 7).map((image, index) => (
              <div
                key={index}
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(index)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 relative">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center text-theme-text-muted">
                            <div class="w-8 h-8 mx-auto mb-2 bg-theme-primary/20 rounded-full flex items-center justify-center">
                              <svg class="w-4 h-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <p class="text-xs">${index + 1}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-2">
                        <svg
                          className="w-4 h-4 text-theme-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}

            {/* Desktop + icon */}
            {images.length > 7 && (
              <div
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openModal(7)}
              >
                <div className="aspect-square bg-gradient-to-br from-theme-primary/20 to-theme-primary/10 relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-theme-primary/30 rounded-full flex items-center justify-center group-hover:bg-theme-primary/50 transition-colors duration-300">
                      <svg
                        className="w-8 h-8 text-theme-primary group-hover:text-white transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-theme-primary  text-sm group-hover:text-white transition-colors duration-300">
                      +{images.length - 7}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedImageIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={closeModal}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Zoom Controls - Desktop only */}
              <div className="absolute top-4 left-4 z-10 flex gap-2 hidden md:flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Image Container */}
              <div
                className="flex items-center justify-center w-full h-full overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={`Gallery image ${selectedImageIndex + 1}`}
                  className="object-contain"
                  style={{
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    width: 'auto',
                    height: 'auto',
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                        <div class="text-center text-white">
                          <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p class="text-lg">Image not available</p>
                          <p class="text-sm text-gray-300">${
                            selectedImageIndex + 1
                          } of ${images.length}</p>
                        </div>
                      </div>
                    `;
                  }}
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white text-sm">
                  {selectedImageIndex + 1} of {images.length}
                  <span className="hidden md:inline"> • Zoom: {Math.round(zoom * 100)}%</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExhibitionGallery;
