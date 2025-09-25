import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const ExhibitionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        const exhibitions = await apiClient.getExhibitions();
        const foundExhibition = (exhibitions as any[]).find(
          (ex: any) => ex.slug === slug
        );
        setExhibition(foundExhibition);
      } catch (error) {
        console.error("Error fetching exhibition:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchExhibition();
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
                <span className="ml-2 text-white/95">
                  Loading exhibition...
                </span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Exhibition Not Found
              </h1>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                The exhibition you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                onClick={() => navigate("/exhibitions")}
                className="mt-6"
                variant="secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exhibitions
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto py-16">
            <Badge
              className={`mb-6 ${getStatusColor(exhibition.status)}`}
              variant="secondary"
            >
              {exhibition.status}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {exhibition.title}
            </h1>
            {exhibition.description && (
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                {exhibition.description}
              </p>
            )}

            {/* Join as an Artist Button */}
            {exhibition.call_for_artists === 1 && exhibition.cta_link && (
              <div className="mt-8">
                <Button
                  onClick={() => window.open(exhibition.cta_link, "_blank")}
                  className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  Join as an Artist
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Exhibition Details */}
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-2xl text-theme-text-primary">
                      About This Exhibition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-theme-text-muted leading-relaxed">
                      {exhibition.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Gallery */}
                {exhibition.gallery_images &&
                  exhibition.gallery_images.length > 0 && (
                    <div className="mt-8">
                      <ExhibitionGallery images={exhibition.gallery_images} />
                    </div>
                  )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Exhibition Info */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl text-theme-text-primary">
                      Exhibition Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(exhibition.start_date || exhibition.end_date) && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-theme-text-muted">Dates</p>
                          <p className="font-medium text-theme-text-primary">
                            {exhibition.start_date && exhibition.end_date
                              ? `${formatDate(
                                  exhibition.start_date
                                )} - ${formatDate(exhibition.end_date)}`
                              : exhibition.start_date
                              ? formatDate(exhibition.start_date)
                              : formatDate(exhibition.end_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-theme-text-muted">
                            Location
                          </p>
                          <p className="font-medium text-theme-text-primary">
                            {exhibition.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.curator && (
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-theme-text-muted">
                            Curator
                          </p>
                          <p className="font-medium text-theme-text-primary">
                            {exhibition.curator}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.assigned_artworks &&
                      exhibition.assigned_artworks.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <ImageIcon className="w-5 h-5 text-theme-primary" />
                          <div>
                            <p className="text-sm text-theme-text-muted">
                              Artworks
                            </p>
                            <p className="font-medium text-theme-text-primary">
                              {exhibition.assigned_artworks.length} pieces
                            </p>
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExhibitionDetail;
