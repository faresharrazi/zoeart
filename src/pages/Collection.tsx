import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { Loader2 } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";

const Collection = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pageData } = usePageDataFromDB();

  // Check if page is visible
  const isPageVisible = pageData.gallery?.isVisible;

  // If page is not visible, redirect to home
  useEffect(() => {
    if (pageData && isPageVisible === false) {
      window.location.href = "/";
    }
  }, [pageData, isPageVisible]);

  // Don't render anything if page is not visible
  if (pageData && isPageVisible === false) {
    return null;
  }

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const [artworksData, artistsData] = await Promise.all([
          apiClient.getArtworks(),
          apiClient.getArtists(),
        ]);

        // Enrich artworks with artist names
        const enrichedArtworks = (artworksData as any[]).map((artwork) => {
          if (artwork.artist_id) {
            const artist = (artistsData as any[]).find(
              (artist: any) => artist.id.toString() === artwork.artist_id.toString()
            );
            if (artist && artist.name) {
              artwork.artist_name = artist.name;
            }
          }
          return artwork;
        });

        setArtworks(enrichedArtworks);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);


  const handleArtworkClick = (artworkSlug: string) => {
    window.location.href = `/artwork/${artworkSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto my-24">
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
                {pageData.gallery?.title || "Gallery"}
              </h1>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">
                  Loading collection...
                </span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
              {pageData.gallery?.title || "Gallery"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.gallery?.description || "Explore our collection"}
            </p>
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      {artworks.length > 0 && (
        <section className="py-20 bg-theme-background">
          <div className="container mx-auto px-6">
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
      )}

      <Footer />
    </div>
  );
};

export default Collection;
