import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useModalDialog } from "@/hooks/useModalDialog";
import { downloadImage } from "@/lib/download";
import { imageUrl } from "@/lib/images";

export interface ViewerImage {
  src: string;
  alt: string;
}

interface ImageViewerProps {
  images: ViewerImage[];
  /** Index of the open image, or null when the viewer is closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Accessible name of the dialog, e.g. the artwork title. */
  label: string;
  /** Shows a download button; files are named `${downloadName}-N`. */
  downloadName?: string;
  allowRotate?: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

const controlClass =
  "inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * Full-screen image viewer: arrows/swipe to change image, wheel, pinch,
 * double-click or +/- to zoom, drag to pan, Escape to close.
 */
const ImageViewer = ({
  images,
  index,
  onIndexChange,
  label,
  downloadName,
  allowRotate = false,
}: ImageViewerProps) => {
  const isOpen = index !== null && images.length > 0;
  const close = useCallback(() => onIndexChange(null), [onIndexChange]);
  const dialogRef = useModalDialog<HTMLDivElement>(isOpen, close);
  const stageRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Active pointers and the gesture they started
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, pinchDistance: 0 });

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  useEffect(reset, [index]);

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      onIndexChange((index + step + images.length) % images.length);
    },
    [index, images.length, onIndexChange]
  );

  const zoomBy = useCallback((factor: number) => {
    setZoom((z) => {
      const next = clampZoom(z * factor);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard shortcuts (Escape and Tab are handled by useModalDialog)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "+" || e.key === "=") zoomBy(1.25);
      else if (e.key === "-") zoomBy(0.8);
      else if (allowRotate && e.key.toLowerCase() === "r")
        setRotation((r) => (r + 90) % 360);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, go, zoomBy, allowRotate]);

  // React's wheel listener is passive and can't stop the page scrolling,
  // so attach a native one.
  useEffect(() => {
    const stage = stageRef.current;
    if (!isOpen || !stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [isOpen, zoomBy]);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current.startX = e.clientX;
    gesture.current.startY = e.clientY;
    if (pointers.current.size === 2) gesture.current.pinchDistance = distance();
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const d = distance();
      if (gesture.current.pinchDistance)
        zoomBy(d / gesture.current.pinchDistance);
      gesture.current.pinchDistance = d;
    } else if (zoom > 1) {
      setOffset((o) => ({
        x: o.x + e.clientX - previous.x,
        y: o.y + e.clientY - previous.y,
      }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinchDistance = 0;
    if (pointers.current.size === 0) setDragging(false);

    // Horizontal swipe changes image when not zoomed in
    const dx = e.clientX - gesture.current.startX;
    const dy = e.clientY - gesture.current.startY;
    if (
      wasSingle &&
      zoom === 1 &&
      Math.abs(dx) > 50 &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      go(dx < 0 ? 1 : -1);
    }
  };

  if (!isOpen || index === null) return null;
  const current = images[index];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col outline-none"
    >
      <div className="flex items-center justify-between gap-2 p-3 text-white">
        <span className="text-sm px-2" aria-live="polite">
          {index + 1} of {images.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={controlClass}
            onClick={close}
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={controlClass}
            onClick={() => zoomBy(0.8)}
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="text-sm w-12 text-center" aria-hidden="true">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className={controlClass}
            onClick={() => zoomBy(1.25)}
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="w-5 h-5" aria-hidden="true" />
          </button>
          {allowRotate && (
            <button
              type="button"
              className={controlClass}
              onClick={() => setRotation((r) => (r + 90) % 360)}
              aria-label="Rotate"
            >
              <RotateCw className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          {downloadName && (
            <button
              type="button"
              className={controlClass}
              onClick={() =>
                downloadImage(current.src, `${downloadName}-${index + 1}`)
              }
              aria-label="Download image"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden select-none touch-none"
        style={{
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2))}
      >
        <img
          key={current.src}
          src={imageUrl(current.src, { width: 2000, height: 2000 })}
          alt={current.alt}
          draggable={false}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.2s ease-out",
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${controlClass} absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 w-12 h-12`}
              onClick={() => go(-1)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-7 h-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${controlClass} absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 w-12 h-12`}
              onClick={() => go(1)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Next image"
            >
              <ChevronRight className="w-7 h-7" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 p-3 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.src + i}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === index
                  ? "border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={imageUrl(image.src, {
                  width: 112,
                  height: 112,
                  crop: "fill",
                })}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
