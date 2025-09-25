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
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
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
                  className="shadow-elegant hover:shadow-artwork transition-all duration-300 cursor-pointer group"
                  onClick={() => handleArtistClick(artist.slug)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6 mb-6">
                      <Avatar className="w-20 h-20 ring-2 ring-theme-primary/20">
                        <AvatarImage
                          src={artist.profile_image || artist.profileImage}
                          alt={artist.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-theme-primary/10 text-theme-primary font-semibold text-lg">
                          {artist.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {artist.name || "Unknown Artist"}
                        </h3>
                        <p className="text-theme-primary font-semibold text-lg">
                          {artist.specialty || "Artist"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {artist.bio || "No bio available"}
                      </p>

                      {/* Social Media Icons */}
                      <div className="flex flex-wrap gap-2">
                        {artist.social_media?.instagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                artist.social_media.instagram,
                                "_blank"
                              );
                            }}
                          >
                            <Instagram className="w-3 h-3" />
                          </Button>
                        )}
                        {artist.social_media?.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                artist.social_media.website,
                                "_blank"
                              );
                            }}
                          >
                            <Globe className="w-3 h-3" />
                          </Button>
                        )}
                        {artist.social_media?.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `mailto:${artist.social_media.email}`,
                                "_blank"
                              );
                            }}
                          >
                            <Mail className="w-3 h-3" />
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
