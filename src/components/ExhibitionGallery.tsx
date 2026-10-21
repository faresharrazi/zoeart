import { useState } from "react";
import { Plus, ZoomIn } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import { imageSrcSet, imageUrl } from "@/lib/images";

interface ExhibitionGalleryProps {
  images: string[];
  title?: string;
}

// Thumbnails shown before the "+N more" tile, per breakpoint
// (2 columns on phones, 3 on tablets, 4 on desktop).
const SHOWN = { base: 3, md: 5, lg: 7 };

// Which breakpoints show the thumbnail at `index`
const visibilityClass = (index: number) =>
  index < SHOWN.base
    ? ""
    : index < SHOWN.md
      ? "hidden md:block"
      : "hidden lg:block";

const MORE_TILES = [
  { shown: SHOWN.base, className: "md:hidden" },
  { shown: SHOWN.md, className: "hidden md:block lg:hidden" },
  { shown: SHOWN.lg, className: "hidden lg:block" },
];

const tileClass =
  "group relative block w-full aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-theme-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary";

const ExhibitionGallery = ({
  images,
  title = "Gallery",
}: ExhibitionGalleryProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const viewerImages = images.map((src, i) => ({
    src,
    alt: `${title}, image ${i + 1} of ${images.length}`,
  }));

  return (
    <section className="py-16 bg-theme-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl text-theme-text-primary mb-12 text-center">
          Gallery
        </h2>

        <ul className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.slice(0, SHOWN.lg).map((image, index) => (
            <li key={image + index} className={visibilityClass(index)}>
              <button
                type="button"
                className={tileClass}
                onClick={() => setOpenIndex(index)}
                aria-label={`Open image ${index + 1} of ${images.length}`}
              >
                <img
                  src={imageUrl(image, {
                    width: 400,
                    height: 400,
                    crop: "fill",
                  })}
                  srcSet={imageSrcSet(image, [300, 400, 600, 800], {
                    width: 400,
                    height: 400,
                    crop: "fill",
                  })}
                  sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 50vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                    <ZoomIn
                      className="w-4 h-4 text-theme-primary"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
            </li>
          ))}

          {MORE_TILES.filter(({ shown }) => images.length > shown).map(
            ({ shown, className }) => (
              <li key={shown} className={className}>
                <button
                  type="button"
                  className={`${tileClass} flex items-center justify-center bg-theme-primary/15`}
                  onClick={() => setOpenIndex(shown)}
                  aria-label={`See ${images.length - shown} more images`}
                >
                  <span className="text-center">
                    <span className="w-12 h-12 mx-auto mb-2 bg-theme-primary/30 rounded-full flex items-center justify-center group-hover:bg-theme-primary/50 transition-colors duration-300">
                      <Plus
                        className="w-6 h-6 text-theme-primary group-hover:text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-theme-primary text-sm">
                      +{images.length - shown}
                    </span>
                  </span>
                </button>
              </li>
            )
          )}
        </ul>

        <ImageViewer
          images={viewerImages}
          index={openIndex}
          onIndexChange={setOpenIndex}
          label={`${title} gallery`}
        />
      </div>
    </section>
  );
};

export default ExhibitionGallery;
