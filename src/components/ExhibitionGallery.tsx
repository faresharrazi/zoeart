import { useState } from "react";
import ImageViewer from "@/components/ImageViewer";
import { imageSrcSet, imageUrl } from "@/lib/images";

interface ExhibitionGalleryProps {
  images: string[];
  /** Exhibition title, used in image descriptions */
  title: string;
}

/** Grid of exhibition photos; each opens the full-screen viewer. */
const ExhibitionGallery = ({ images, title }: ExhibitionGalleryProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        {images.map((image, index) => (
          <li key={image + index}>
            <button
              type="button"
              className="group block w-full aspect-square overflow-hidden bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              onClick={() => setOpenIndex(index)}
              aria-label={`Open image ${index + 1} of ${images.length}`}
            >
              <img
                src={imageUrl(image, { width: 480, height: 480, crop: "fill" })}
                srcSet={imageSrcSet(image, [320, 480, 720], {
                  width: 480,
                  height: 480,
                  crop: "fill",
                })}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      <ImageViewer
        images={images.map((src, i) => ({
          src,
          alt: `${title}, image ${i + 1} of ${images.length}`,
        }))}
        index={openIndex}
        onIndexChange={setOpenIndex}
        label={`${title} gallery`}
      />
    </>
  );
};

export default ExhibitionGallery;
