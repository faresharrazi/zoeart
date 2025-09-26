import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

interface ArtworkZoomProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ArtworkZoom = ({ images, isOpen, onClose, initialIndex = 0 }: ArtworkZoomProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `artwork-${currentIndex + 1}.jpg`;
    link.click();
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
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoom]);

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">
            {currentIndex + 1} of {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Image */}
      <div 
        className="flex items-center justify-center h-full p-20"
        onWheel={handleWheel}
      >
        <div
          className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`Artwork ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              ←
            </Button>
          )}
          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              →
            </Button>
          )}
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex gap-2 max-w-[80vw] overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/70 text-xs">
        <p>Use mouse wheel to zoom • Arrow keys to navigate • R to rotate • ESC to close</p>
      </div>
    </div>
  );
};

export default ArtworkZoom;