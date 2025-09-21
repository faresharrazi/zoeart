import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { exhibitionService } from "@/lib/database";
import ExhibitionGallery from "@/components/ExhibitionGallery";

interface Exhibition {
  id: string;
  title: string;
  status: "upcoming" | "past";
  start_date: string;
  end_date: string;
  description: string | null;
  location: string | null;
  curator: string | null;
  featured_image: string | null;
  gallery_images: string[] | null;
  created_at: string;
  updated_at: string;
  exhibition_artworks?: {
    artworks: {
      id: string;
      title: string;
      image: string | null;
      artists: {
        name: string;
      };
    };
  }[];
}

const ExhibitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibition = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await exhibitionService.getById(id);
        setExhibition(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch exhibition";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Exhibition Not Found
            </h1>
            <p className="text-red-400 text-xl mb-8">
              {error || "The exhibition you're looking for doesn't exist."}
            </p>
            <Link to="/exhibitions">
              <Button className="bg-gallery-gold hover:bg-gallery-gold/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exhibitions
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-8">
            <Link to="/exhibitions">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exhibitions
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {exhibition.title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge
                className={`${getStatusColor(
                  exhibition.status
                )} text-lg px-4 py-2`}
              >
                {exhibition.status}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">
                  {formatDate(exhibition.start_date)} -{" "}
                  {formatDate(exhibition.end_date)}
                </span>
              </div>
              {exhibition.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{exhibition.location}</span>
                </div>
              )}
              {exhibition.curator && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="text-lg">
                    Curated by {exhibition.curator}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {exhibition.featured_image && (
              <div className="mb-12">
                <div className="aspect-video overflow-hidden rounded-lg shadow-elegant">
                  <img
                    src={exhibition.featured_image}
                    alt={exhibition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {exhibition.description && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  About This Exhibition
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {exhibition.description}
                </p>
              </div>
            )}

            {/* Gallery */}
            <div className="mb-12">
              <ExhibitionGallery
                images={exhibition.gallery_images || []}
                featuredImage={exhibition.featured_image}
                exhibitionTitle={exhibition.title}
              />
            </div>

            {/* Featured Artworks */}
            {exhibition.exhibition_artworks &&
              exhibition.exhibition_artworks.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-8 text-foreground">
                    Featured Artworks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibition.exhibition_artworks.map((ea, index) => (
                      <Card key={index} className="shadow-elegant">
                        {ea.artworks.image && (
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={ea.artworks.image}
                              alt={ea.artworks.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {ea.artworks.title}
                          </h3>
                          <p className="text-muted-foreground">
                            by {ea.artworks.artists.name}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExhibitionDetail;
