import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkZoom from "@/components/ArtworkZoom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ZoomIn, Loader2 } from "lucide-react";
import { artworkService } from "@/lib/database";

const ArtworkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const data = await artworkService.getBySlug(slug);
        setArtwork(data);
      } catch (err) {
        console.error("Error fetching artwork:", err);
        setError(err instanceof Error ? err.message : "Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error ? "Error Loading Artwork" : "Artwork Not Found"}
          </h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Artwork Image */}
            <div className="space-y-6">
              <Card className="shadow-artwork overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={artwork.image || "/placeholder-artwork.jpg"}
                    alt={`${artwork.title} by ${
                      artwork.artists?.name || "Unknown Artist"
                    }`}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setIsZoomOpen(true)}
                  />
                  {/* Zoom Overlay */}
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center cursor-zoom-in"
                    onClick={() => setIsZoomOpen(true)}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Zoom Instructions */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click the image to view in full detail with zoom controls
                </p>
              </div>
            </div>

            {/* Artwork Details */}
            <div className="space-y-8">
              {/* Title & Basic Info */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {artwork.title}
                </h1>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold text-gallery-gold">
                    {artwork.artists?.name || "Unknown Artist"}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {artwork.year} • {artwork.medium}
                  </p>
                  <p className="text-muted-foreground">{artwork.dimensions}</p>
                </div>
              </div>

              {/* Description */}
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    About This Work
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {artwork.description}
                  </p>
                </CardContent>
              </Card>

              {/* Artist Bio */}
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    About the Artist
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {artwork.artists?.bio ||
                      "Artist information not available."}
                  </p>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-elegant">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gallery-charcoal mb-2">
                      Technique
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {artwork.technique ||
                        "Technique information not available."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gallery-charcoal mb-2">
                      Exhibition
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {artwork.exhibition ||
                        "Exhibition information not available."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Provenance */}
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-foreground">
                    Provenance
                  </h3>
                  <p className="text-muted-foreground">
                    {artwork.provenance ||
                      "Provenance information not available."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Zoom Modal */}
      {artwork && (
        <ArtworkZoom
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={artwork.image || "/placeholder-artwork.jpg"}
          title={artwork.title}
          artist={artwork.artists?.name || "Unknown Artist"}
        />
      )}

      <Footer />
    </div>
  );
};

export default ArtworkDetail;
