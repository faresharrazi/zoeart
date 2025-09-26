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
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
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
      <section className="pt-24 pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto py-20">
            {/* Artist Profile Image */}
            <div className="mb-8">
              {artist.profile_image && 
               artist.profile_image !== "null" && 
               artist.profile_image !== "undefined" ? (
                <div className="relative inline-block">
                  <img
                    src={artist.profile_image}
                    alt={artist.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-2xl border-4 border-white/20"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <span className="text-4xl text-white/80">
                    {artist.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Artist Name */}
            <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-2xl">
              {artist.name}
            </h1>

            {/* Specialty */}
            {artist.specialty && (
              <div className="mb-8">
                <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-lg border border-white/20">
                  {artist.specialty}
                </span>
              </div>
            )}

            {/* Bio */}
            {artist.bio && (
              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-xl text-white/90 leading-relaxed drop-shadow-lg">
                  {artist.bio}
                </p>
              </div>
            )}

            {/* Social Media */}
            {artist.social_media &&
              Object.keys(artist.social_media).length > 0 && (
                <div className="flex justify-center space-x-4">
                  {artist.social_media.instagram && (
                    <a
                      href={
                        artist.social_media.instagram.startsWith("http")
                          ? artist.social_media.instagram
                          : `https://instagram.com/${artist.social_media.instagram.replace(
                              "@",
                              ""
                            )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                    >
                      <Instagram className="w-6 h-6 text-white" />
                    </a>
                  )}
                  {artist.social_media.website && (
                    <a
                      href={
                        artist.social_media.website.startsWith("http")
                          ? artist.social_media.website
                          : `https://${artist.social_media.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                    >
                      <Globe className="w-6 h-6 text-white" />
                    </a>
                  )}
                  {artist.social_media.email && (
                    <a
                      href={`mailto:${artist.social_media.email}`}
                      className="p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                    >
                      <Mail className="w-6 h-6 text-white" />
                    </a>
                  )}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Artworks Section */}
      {artworks.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
                  Featured Works
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Explore {artist.name}'s collection of {artworks.length}{" "}
                  {artworks.length === 1 ? "artwork" : "artworks"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onArtworkClick={handleArtworkClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ArtistDetail;
