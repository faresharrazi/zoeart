import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkZoom from "@/components/ArtworkZoom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Palette,
  Ruler,
  User,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const ArtworkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const artworks = await apiClient.getArtworks();
        const foundArtwork = (artworks as any[]).find(
          (art: any) => art.slug === slug
        );
        setArtwork(foundArtwork);
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArtwork();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">Loading artwork...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
                Artwork Not Found
              </h1>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                The artwork you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                onClick={() => navigate("/collection")}
                className="mt-6"
                variant="secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collection
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto py-16">
            <h1 className="text-5xl md:text-7xl text-white mb-6">
              {artwork.title}
            </h1>
            {artwork.artist_name && (
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                by {artwork.artist_name}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Artwork Details */}
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Artwork Image */}
              <div className="space-y-6">
                {artwork.images && artwork.images.length > 0 ? (
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-auto rounded-lg shadow-elegant"
                  />
                ) : (
                  <div className="w-full h-96 bg-theme-card rounded-lg shadow-elegant flex items-center justify-center">
                    <p className="text-theme-text-muted">No image available</p>
                  </div>
                )}

                {/* Additional Images */}
                {artwork.images && artwork.images.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {artwork.images
                      .slice(1, 5)
                      .map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${artwork.title} detail ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-elegant cursor-pointer hover:shadow-artwork transition-all duration-300"
                          onClick={() => window.open(image, "_blank")}
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* Artwork Information */}
              <div className="space-y-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-2xl text-theme-text-primary">
                      {artwork.title}
                    </CardTitle>
                    <p className="text-theme-text-muted text-lg">
                      by {artwork.artist_name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="text-sm text-theme-text-muted">Year</p>
                        <p className=" text-theme-text-primary">
                          {artwork.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Palette className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="text-sm text-theme-text-muted">Medium</p>
                        <p className=" text-theme-text-primary">
                          {artwork.medium}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Ruler className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="text-sm text-theme-text-muted">Size</p>
                        <p className=" text-theme-text-primary">
                          {artwork.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="text-sm text-theme-text-muted">Artist</p>
                        <p className=" text-theme-text-primary">
                          {artwork.artist_name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl text-theme-text-primary">
                      About This Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-theme-text-muted leading-relaxed">
                      {artwork.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => navigate("/collection")}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Collection
                  </Button>
                  <Button
                    onClick={() =>
                      navigate(
                        `/artist/${artwork.artist_name
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                    variant="default"
                    className="flex-1"
                  >
                    View Artist Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtworkDetail;
