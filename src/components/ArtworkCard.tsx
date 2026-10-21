import { Link } from "react-router-dom";
import ImageWithFallback from "@/components/ImageWithFallback";
import { imageSrcSet, imageUrl } from "@/lib/images";
import type { Artwork } from "@/types/api";

interface ArtworkCardProps {
  artwork: Pick<
    Artwork,
    | "id"
    | "title"
    | "slug"
    | "artist_name"
    | "year"
    | "medium"
    | "images"
    | "featured_image"
  >;
  /** Heading level of the title, to fit the page's outline */
  headingLevel?: "h2" | "h3";
}

/** Image, title, artist and details; the whole card links to the artwork. */
const ArtworkCard = ({
  artwork,
  headingLevel: Heading = "h3",
}: ArtworkCardProps) => {
  const title = artwork.title?.trim() || "Untitled";
  const image = artwork.featured_image || artwork.images?.[0];
  const meta = [artwork.year, artwork.medium?.trim()]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group relative flex flex-col gap-4">
      <div className="aspect-[4/5] overflow-hidden bg-sand">
        <ImageWithFallback
          src={imageUrl(image, { width: 640, height: 800, crop: "fill" })}
          srcSet={imageSrcSet(image, [400, 640, 960], {
            width: 640,
            height: 800,
            crop: "fill",
          })}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
          alt={
            artwork.artist_name ? `${title} by ${artwork.artist_name}` : title
          }
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <span
                className="font-display text-6xl text-mist"
                aria-hidden="true"
              >
                {title.charAt(0)}
              </span>
            </div>
          }
        />
      </div>
      <div className="space-y-1">
        <Heading className="font-display text-[22px] leading-snug">
          {/* The link covers the whole card */}
          <Link
            to={`/artwork/${artwork.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"
          >
            {title}
          </Link>
        </Heading>
        {artwork.artist_name && (
          <p className="text-sm text-stone">{artwork.artist_name}</p>
        )}
        {meta && <p className="text-sm text-mist">{meta}</p>}
      </div>
    </article>
  );
};

export default ArtworkCard;
