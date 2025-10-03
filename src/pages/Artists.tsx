import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { getSocialMediaIcon, getSocialMediaUrl } from "@/lib/socialMediaIcons";
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
              <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
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
      <section className="bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
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
                  {/* Artist Profile Section */}
                  <div className="relative p-8 text-center">
                    {/* Artist Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-theme-primary transition-colors duration-300">
                      {artist.name}
                    </h3>

                    {/* Social Media Icons */}
                    {artist.social_media &&
                      Object.keys(artist.social_media).length > 0 && (
                        <div className="flex justify-center space-x-3">
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
                                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                  onClick={(e) => e.stopPropagation()}
                                  title={`Visit ${platform} profile`}
                                >
                                  {getSocialMediaIcon(platform, "lg")}
                                </a>
                              );
                            }
                          )}
                        </div>
                      )}
                  </div>
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
