import { Link } from "react-router-dom";
import ImageWithFallback from "@/components/ImageWithFallback";
import { imageSrcSet, imageUrl } from "@/lib/images";

interface ArtworkCardProps {
  artwork: {
    id?: string | number;
    title?: string;
    slug?: string;
    artist_name?: string;
    year?: number | null;
    medium?: string;
    size?: string;
    images?: string[];
    featured_image?: string | null;
    description?: string;
  };
  /** Heading level of the title, to fit the page's outline */
  headingLevel?: "h2" | "h3";
}

const ArtworkCard = ({
  artwork,
  headingLevel: Heading = "h3",
}: ArtworkCardProps) => {
  const title = artwork.title || "Untitled";
  const artistName = artwork.artist_name || "Unknown Artist";
  const image = artwork.featured_image || artwork.images?.[0];
  const meta = [artwork.year, artwork.medium, artwork.size].filter(Boolean);

  return (
    <article className="group relative overflow-hidden bg-gradient-card shadow-elegant hover:shadow-artwork transition-all duration-500 ease-out">
      <div className="aspect-square overflow-hidden">
        <ImageWithFallback
          src={imageUrl(image, { width: 600, height: 600, crop: "fill" })}
          srcSet={imageSrcSet(image, [400, 600, 800, 1000], {
            width: 600,
            height: 600,
            crop: "fill",
          })}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          alt={`${title} by ${artistName}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-3">
                  <span
                    className="text-2xl text-slate-600 font-semibold"
                    aria-hidden="true"
                  >
                    {title.charAt(0)}
                  </span>
                </div>
                <p className="text-sm text-slate-500">No image available</p>
              </div>
            </div>
          }
        />
      </div>

      <div className="p-6 space-y-3">
        <Heading className="text-xl font-semibold text-foreground group-hover:text-theme-primary transition-smooth">
          {/* The link covers the whole card */}
          <Link
            to={`/artwork/${artwork.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-theme-primary"
          >
            {title}
          </Link>
        </Heading>
        <div className="space-y-1">
          <p className="text-theme-text-primary font-medium">{artistName}</p>
          {meta.length > 0 && (
            <p className="text-muted-foreground text-sm">{meta.join(" • ")}</p>
          )}
        </div>
        {artwork.description && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {artwork.description}
          </p>
        )}
      </div>
    </article>
  );
};

export default ArtworkCard;
