import { useEffect, useState } from "react";
import { fetchPriority, imageSrcSet, imageUrl } from "@/lib/images";

interface HeroImageSliderProps {
  images: string[];
  interval?: number; // in milliseconds
}

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Cross-fading full-bleed photos; pauses on hover, focus and reduced motion. */
const HeroImageSlider = ({ images, interval = 5000 }: HeroImageSliderProps) => {
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
      className="absolute inset-0"
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
          className={`absolute inset-0 h-full w-full object-cover object-[center_35%] transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute top-24 right-6 md:right-10 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroImageSlider;
