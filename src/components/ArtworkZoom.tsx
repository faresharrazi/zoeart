import { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArtworkZoomProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  artist: string;
}

const ArtworkZoom = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  artist,
}: ArtworkZoomProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleZoomIn}
          disabled={zoom >= 5}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
        <span className="text-white text-sm ">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Image Container */}
      <div
        className="relative max-w-full max-h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt={`${title} by ${artist}`}
          className="max-w-none transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
              position.y / zoom
            }px)`,
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          draggable={false}
        />
      </div>

      {/* Image Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
        <h3 className="text-white  text-sm">{title}</h3>
        <p className="text-white/80 text-xs">{artist}</p>
      </div>

      {/* Instructions */}
      {zoom > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
          <span className="text-white/80 text-xs">Click and drag to pan</span>
        </div>
      )}
    </div>
  );
};

export default ArtworkZoom;
