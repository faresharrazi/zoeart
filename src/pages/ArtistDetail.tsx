import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Instagram, Mail, Globe, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const ArtistDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistsData, artworksData] = await Promise.all([
          apiClient.getArtists(),
          apiClient.getArtworks(),
        ]);

        const foundArtist = artistsData.find((art: any) => art.slug === slug);
        if (foundArtist) {
          setArtist(foundArtist);
          // Filter artworks by this artist
          const artistArtworks = artworksData.filter(
            (artwork: any) => artwork.artist_name === foundArtist.name
          );
          setArtworks(artistArtworks);
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArtistData();
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
                <span className="ml-2 text-white/95">Loading artist...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Artist Not Found
              </h1>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                The artist you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => navigate("/artists")}
                className="mt-6"
                variant="secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artists
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleArtworkClick = (artworkSlug: string) => {
    window.location.href = `/artwork/${artworkSlug}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto py-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {artist.name}
            </h1>
            {artist.specialty && (
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                {artist.specialty}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Artist Profile */}
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Artist Info */}
              <div className="lg:col-span-1">
                <Card className="shadow-elegant sticky top-8">
                  <CardHeader className="text-center">
                    {artist.profile_image ? (
                      <img
                        src={artist.profile_image}
                        alt={artist.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-theme-card flex items-center justify-center">
                        <span className="text-2xl font-bold text-theme-text-muted">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-2xl text-theme-text-primary">
                      {artist.name}
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit mx-auto">
                      {artist.specialty}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {artist.bio && (
                      <div>
                        <h4 className="font-semibold text-theme-text-primary mb-2">
                          About
                        </h4>
                        <p className="text-theme-text-muted text-sm leading-relaxed">
                          {artist.bio}
                        </p>
                      </div>
                    )}

                    {/* Social Media */}
                    {artist.social_media &&
                      Object.keys(artist.social_media).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-theme-text-primary mb-3">
                            Connect
                          </h4>
                          <div className="flex space-x-3">
                            {artist.social_media.instagram && (
                              <a
                                href={artist.social_media.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-theme-card hover:bg-theme-primary hover:text-white transition-colors"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {artist.social_media.website && (
                              <a
                                href={artist.social_media.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-theme-card hover:bg-theme-primary hover:text-white transition-colors"
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                            {artist.social_media.email && (
                              <a
                                href={`mailto:${artist.social_media.email}`}
                                className="p-2 rounded-full bg-theme-card hover:bg-theme-primary hover:text-white transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>

              {/* Artist's Works */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
                    Featured Works
                  </h2>
                  <p className="text-theme-text-muted">
                    Explore the artist's collection of {artworks.length}{" "}
                    artworks
                  </p>
                </div>

                {artworks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-theme-text-muted text-lg">
                      No artworks available for this artist.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {artworks.map((artwork) => (
                      <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        onArtworkClick={handleArtworkClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistDetail;
