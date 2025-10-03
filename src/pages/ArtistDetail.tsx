import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getSocialMediaIcon, getSocialMediaUrl } from "@/lib/socialMediaIcons";
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
          
          // Filter artworks by this artist - try multiple matching strategies
          const artistArtworks = artworksData.filter((artwork: any) => {
            // Check if artwork is visible
            if (artwork.is_visible === false) return false;
            
            // Try multiple matching strategies
            const matchesByName = artwork.artist_name && 
              artwork.artist_name.toLowerCase().trim() === foundArtist.name.toLowerCase().trim();
            
            const matchesById = artwork.artist_id && 
              artwork.artist_id === foundArtist.id;
            
            const matchesBySlug = artwork.artist_slug && 
              artwork.artist_slug === foundArtist.slug;
            
            return matchesByName || matchesById || matchesBySlug;
          });
          
          console.log("Artist:", foundArtist.name, "ID:", foundArtist.id);
          console.log("All artworks:", artworksData.length);
          console.log("Filtered artworks:", artistArtworks.length);
          console.log("Artwork details:", artistArtworks.map(a => ({
            title: a.title,
            artist_name: a.artist_name,
            artist_id: a.artist_id,
            is_visible: a.is_visible
          })));
          
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
      <section className="pt-24 pb-20 bg-white relative overflow-hidden">

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
                    className="w-40 h-40 rounded-full mx-auto object-cover shadow-2xl border-4 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full mx-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-2xl border-4 border-gray-200">
                  <span className="text-5xl text-gray-600 font-semibold">
                    {artist.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Artist Name */}
            <h1 className="text-6xl md:text-8xl text-gray-900 mb-6">
              {artist.name}
            </h1>

            {/* Specialty */}
            {artist.specialty && (
              <div className="mb-8">
                <span className="inline-block px-6 py-3 bg-gray-100 rounded-full text-gray-700 text-lg border border-gray-200">
                  {artist.specialty}
                </span>
              </div>
            )}

            {/* Bio */}
            {artist.bio && (
              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {artist.bio}
                </p>
              </div>
            )}

            {/* Social Media */}
            {artist.social_media &&
              Object.keys(artist.social_media).length > 0 && (
                <div className="flex justify-center space-x-4">
                  {Object.entries(artist.social_media).map(
                    ([platform, handle]) => {
                      if (!handle || handle.trim() === "") return null;

                      return (
                        <a
                          key={platform}
                          href={getSocialMediaUrl(platform, handle)}
                          target={
                            platform.toLowerCase() === "email"
                              ? "_self"
                              : "_blank"
                          }
                          rel={
                            platform.toLowerCase() === "email"
                              ? ""
                              : "noopener noreferrer"
                          }
                          className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:scale-110"
                          title={`Visit ${platform} profile`}
                        >
                          <div className="text-gray-700">
                            {getSocialMediaIcon(platform, "lg")}
                          </div>
                        </a>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Artworks Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
                Featured Works
              </h2>
              {artworks.length > 0 ? (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Explore {artist.name}'s collection of {artworks.length}{" "}
                  {artworks.length === 1 ? "artwork" : "artworks"}
                </p>
              ) : (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  No artworks available for {artist.name} at the moment.
                </p>
              )}
            </div>

            {artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onArtworkClick={handleArtworkClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-2xl p-12 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-400">🎨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Artworks Yet
                  </h3>
                  <p className="text-gray-500">
                    Check back later to see {artist.name}'s latest creations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistDetail;
