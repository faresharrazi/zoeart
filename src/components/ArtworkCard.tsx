interface ArtworkCardProps {
  artwork: {
    id?: string | number;
    title?: string;
    artist_name?: string;
    year?: number;
    medium?: string;
    size?: string;
    images?: string[];
    description?: string;
    slug?: string;
  } | null;
  onArtworkClick?: (slug: string) => void;
}

const ArtworkCard = ({ artwork, onArtworkClick }: ArtworkCardProps) => {
  // Add safety checks for undefined artwork
  if (!artwork) {
    return (
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden bg-gradient-card shadow-elegant hover:shadow-artwork transition-all duration-500 ease-out">
          <div className="aspect-square overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-slate-600 font-semibold">
                    ?
                  </span>
                </div>
                <p className="text-sm text-slate-500">Artwork unavailable</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Unknown Artwork
            </h3>
            <p className="text-theme-text-primary font-medium">
              Unknown Artist
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (onArtworkClick && artwork.slug) {
      onArtworkClick(artwork.slug);
    } else if (artwork.slug) {
      window.location.href = `/artwork/${artwork.slug}`;
    }
  };

  // Get the first image or show fallback
  const imageUrl =
    artwork.images && artwork.images.length > 0 ? artwork.images[0] : null;
  const hasValidImage = imageUrl && 
                       imageUrl !== "null" && 
                       imageUrl !== "undefined" &&
                       imageUrl.trim() !== "";

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative overflow-hidden bg-gradient-card shadow-elegant hover:shadow-artwork transition-all duration-500 ease-out">
        <div className="aspect-square overflow-hidden">
          {hasValidImage ? (
            <img
              src={imageUrl}
              alt={`${artwork.title} by ${
                artwork.artist_name || "Unknown Artist"
              }`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback for missing/broken images */}
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${
              hasValidImage ? "hidden" : "flex"
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-slate-600 font-semibold">
                  {artwork.title?.charAt(0) || "A"}
                </span>
              </div>
              <p className="text-sm text-slate-500">No image available</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-theme-primary transition-smooth">
            {artwork.title || "Untitled"}
          </h3>
          <div className="space-y-1">
            <p className="text-theme-text-primary font-medium">
              {artwork.artist_name || "Unknown Artist"}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {artwork.year && <span>{artwork.year}</span>}
              {artwork.year && artwork.medium && <span>•</span>}
              {artwork.medium && <span>{artwork.medium}</span>}
              {artwork.size && <span>• {artwork.size}</span>}
            </div>
          </div>
          {artwork.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {artwork.description}
            </p>
          )}
        </div>

        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ArtworkCard;
