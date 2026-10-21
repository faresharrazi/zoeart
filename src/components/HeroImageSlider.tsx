import { useEffect, useState } from "react";
import { fetchPriority, imageSrcSet, imageUrl } from "@/lib/images";

interface HeroImageSliderProps {
  images: string[];
  interval?: number; // in milliseconds
}

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const HeroImageSlider = ({ images, interval = 2000 }: HeroImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const timer = setInterval(
      () => setCurrentIndex((i) => (i + 1) % images.length),
      interval
    );
    return () => clearInterval(timer);
  }, [images.length, interval, paused]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(prefersReducedMotion())}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(prefersReducedMotion())}
    >
      {images.map((image, index) => (
        <img
          key={image + index}
          src={imageUrl(image, { width: 1920 })}
          srcSet={imageSrcSet(image, [768, 1280, 1920, 2560])}
          sizes="100vw"
          alt=""
          {...fetchPriority(index === 0 ? "high" : "low")}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`w-2 h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show slide ${index + 1} of ${images.length}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroImageSlider;
