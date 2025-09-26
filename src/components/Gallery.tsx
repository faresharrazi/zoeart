import { useState, useEffect } from "react";
import ArtworkCard from "./ArtworkCard";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

interface GalleryProps {
  limit?: number;
  showTitle?: boolean;
}

const Gallery = ({ limit, showTitle = true }: GalleryProps) => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await apiClient.getArtworks();
        setArtworks(limit ? data.slice(0, limit) : data);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [limit]);

  const handleArtworkClick = (artworkSlug: string) => {
    window.location.href = `/artwork/${artworkSlug}`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          {showTitle && (
            <h2 className="text-3xl  mb-8 text-theme-text-primary text-center">
              Featured Collection
            </h2>
          )}
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
            <span className="ml-2 text-theme-text-muted">
              Loading artworks...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (artworks.length === 0) {
    return (
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          {showTitle && (
            <h2 className="text-3xl  mb-8 text-theme-text-primary text-center">
              Featured Collection
            </h2>
          )}
          <div className="text-center py-12">
            <p className="text-theme-text-muted text-lg">
              No artworks available at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-theme-background">
      <div className="container mx-auto px-6">
        {showTitle && (
          <h2 className="text-3xl  mb-8 text-theme-text-primary text-center">
            Featured Collection
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onArtworkClick={handleArtworkClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
