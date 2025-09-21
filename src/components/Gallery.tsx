import { useState, useEffect } from "react";
import ArtworkCard from "./ArtworkCard";
import { usePublicArtworks } from "@/hooks/use-public-artworks";
import { Loader2 } from "lucide-react";

const Gallery = () => {
  const { artworks, loading, error } = usePublicArtworks();

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Featured <span className="text-gallery-gold">Collection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover our curated selection of contemporary artworks from
              talented artists around the world. Each piece tells a unique story
              and offers a window into the creative minds of today's most
              compelling visual artists.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Featured <span className="text-gallery-gold">Collection</span>
            </h2>
            <p className="text-red-600">Error loading artworks: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Convert database format to component format
  const formattedArtworks =
    artworks?.map((artwork) => ({
      title: artwork.title,
      artist: artwork.artists?.name || "Unknown Artist",
      year: artwork.year,
      medium: artwork.medium,
      image: artwork.image || "/placeholder-artwork.jpg",
      slug: artwork.slug,
      description: artwork.description || "",
    })) || [];

  return (
    <section id="gallery" className="py-20 bg-gallery-light-grey">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Featured <span className="text-gallery-gold">Collection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our curated selection of contemporary artworks from
            talented artists around the world. Each piece tells a unique story
            and offers a window into the creative minds of today's most
            compelling visual artists.
          </p>
        </div>

        {formattedArtworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formattedArtworks.map((artwork, index) => (
              <ArtworkCard key={artwork.slug || index} {...artwork} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No artworks available at the moment. Please check back later.
            </p>
          </div>
        )}

        <div className="text-center mt-16">
          <a
            href="/collection"
            className="inline-block bg-foreground text-background hover:bg-gallery-charcoal transition-smooth px-8 py-3 text-lg font-semibold"
          >
            View Complete Collection
          </a>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
