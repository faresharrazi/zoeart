interface ArtworkCardProps {
  title: string;
  artist: string;
  year: number;
  medium: string;
  image: string;
  description?: string;
  slug: string;
}

const ArtworkCard = ({
  title,
  artist,
  year,
  medium,
  image,
  description,
  slug,
}: ArtworkCardProps) => {
  const handleClick = () => {
    window.location.href = `/artwork/${slug}`;
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative overflow-hidden bg-gradient-card shadow-elegant hover:shadow-artwork transition-all duration-500 ease-out">
        <div className="aspect-square overflow-hidden">
          <img
            src={image}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="p-6 space-y-3">
          <h3 className="text-xl  text-foreground group-hover:text-theme-primary transition-smooth">
            {title}
          </h3>
          <div className="space-y-1">
            <p className="text-theme-text-primary ">{artist}</p>
            <p className="text-muted-foreground text-sm">
              {year} • {medium}
            </p>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ArtworkCard;
