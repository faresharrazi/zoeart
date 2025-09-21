import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, Twitter, Globe, Mail, Loader2 } from "lucide-react";
import { usePublicArtists } from "@/hooks/use-public-artists";

const Artists = () => {
  const { artists, loading, error } = usePublicArtists();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Featured <span className="text-gallery-gold">Artists</span>
            </h1>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Featured <span className="text-gallery-gold">Artists</span>
            </h1>
            <p className="text-red-400 text-xl">
              Error loading artists: {error}
            </p>
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
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Featured <span className="text-gallery-gold">Artists</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Meet the visionary artists whose works define our contemporary
            collection. Each brings a unique perspective and mastery of their
            craft to create pieces that inspire and provoke.
          </p>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {artists.map((artist, index) => (
              <Card
                key={index}
                className="shadow-elegant hover:shadow-artwork transition-all duration-300 h-full flex flex-col"
              >
                <CardContent className="p-8 flex-grow flex flex-col">
                  <div className="flex items-start space-x-6 mb-6">
                    <Avatar className="w-20 h-20 ring-2 ring-gallery-gold/20">
                      <AvatarImage
                        src={artist.profile_image || "/placeholder-artist.jpg"}
                        alt={artist.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gallery-gold/10 text-gallery-gold font-semibold text-lg">
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {artist.name}
                      </h3>
                      <p className="text-gallery-gold font-semibold text-lg">
                        {artist.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <p className="text-muted-foreground leading-relaxed line-clamp-4">
                      {artist.bio}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gallery-charcoal mb-1">
                          Education
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {artist.education ||
                            "Education information not available."}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gallery-charcoal mb-1">
                          Recent Exhibitions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {artist.exhibitions ||
                            "Exhibition information not available."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="pt-4 border-t border-gallery-light-grey mt-auto">
                    <h4 className="font-semibold text-gallery-charcoal mb-3">
                      Connect with the Artist
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {artist.instagram && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold"
                          onClick={() =>
                            window.open(artist.instagram, "_blank")
                          }
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </Button>
                      )}
                      {artist.twitter && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold"
                          onClick={() => window.open(artist.twitter, "_blank")}
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </Button>
                      )}
                      {artist.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold"
                          onClick={() => window.open(artist.website, "_blank")}
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </Button>
                      )}
                      {artist.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold"
                          onClick={() =>
                            window.open(`mailto:${artist.email}`, "_blank")
                          }
                        >
                          <Mail className="w-4 h-4" />
                          Email
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

      <Footer />
    </div>
  );
};

export default Artists;
