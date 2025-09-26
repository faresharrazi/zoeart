import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, Mail, Globe, Loader2 } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

const Artists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pageData } = usePageDataFromDB();

  // Check if page is visible
  const isPageVisible = pageData.artists?.isVisible;

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
    const fetchArtists = async () => {
      try {
        const data = await apiClient.getArtists();
        setArtists(data as any[]);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistClick = (artistSlug: string) => {
    window.location.href = `/artist/${artistSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto my-24">
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
                {pageData.artists?.title || "Artists"}
              </h1>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">Loading artists...</span>
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
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto my-24">
            <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
              {pageData.artists?.title || "Artists"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.artists?.description || "Meet our talented artists"}
            </p>
          </div>
        </div>
      </section>

      {/* Artists Grid - Only show if there are artists */}
      {artists.length > 0 && (
        <section className="py-20 bg-theme-background">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {artists.map((artist, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden border-0 shadow-lg bg-white"
                  onClick={() => handleArtistClick(artist.slug)}
                >
                  {/* Artist Header with Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 overflow-hidden">
                    {artist.profile_image &&
                    artist.profile_image !== "null" &&
                    artist.profile_image !== "undefined" ? (
                      <img
                        src={artist.profile_image}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling.style.display =
                            "flex";
                        }}
                      />
                    ) : null}

                    {/* Fallback Avatar */}
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        artist.profile_image &&
                        artist.profile_image !== "null" &&
                        artist.profile_image !== "undefined"
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg">
                        <span className="text-3xl text-slate-600 font-semibold">
                          {artist.name?.charAt(0) || "A"}
                        </span>
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Name and Specialty */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {artist.name || "Unknown Artist"}
                        </h3>
                        <p className="text-slate-600 font-medium text-sm">
                          {artist.specialty || "Artist"}
                        </p>
                      </div>

                      {/* Bio */}
                      <div className="text-center">
                        <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
                          {artist.bio || "No bio available"}
                        </p>
                      </div>

                      {/* Social Media Icons */}
                      <div className="flex justify-center gap-3">
                        {artist.social_media?.instagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 p-0 rounded-full hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              const instagramUrl =
                                artist.social_media.instagram.startsWith("http")
                                  ? artist.social_media.instagram
                                  : `https://instagram.com/${artist.social_media.instagram.replace(
                                      "@",
                                      ""
                                    )}`;
                              window.open(instagramUrl, "_blank");
                            }}
                          >
                            <Instagram className="w-4 h-4" />
                          </Button>
                        )}
                        {artist.social_media?.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 p-0 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              const websiteUrl =
                                artist.social_media.website.startsWith("http")
                                  ? artist.social_media.website
                                  : `https://${artist.social_media.website}`;
                              window.open(websiteUrl, "_blank");
                            }}
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        {artist.social_media?.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 p-0 rounded-full hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `mailto:${artist.social_media.email}`,
                                "_blank"
                              );
                            }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Artists;
