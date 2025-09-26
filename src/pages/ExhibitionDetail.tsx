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
  UserCheck,
  Image as ImageIcon,
  Loader2,
  Clock,
  ExternalLink,
  Share2,
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
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
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

      {/* Hero Section with Featured Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Featured Image Background */}
        {exhibition.featured_image &&
        exhibition.featured_image !== "null" &&
        exhibition.featured_image !== "undefined" ? (
          <div className="absolute inset-0">
            <img
              src={exhibition.featured_image}
              alt={exhibition.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
              {/* Status Badge */}
              <div className="mb-6 md:mb-8">
                <Badge
                  variant={
                    exhibition.status === "upcoming" ? "default" : "secondary"
                  }
                  className="px-6 py-2 text-lg font-semibold"
                >
                  {exhibition.status === "upcoming"
                    ? "Upcoming Exhibition"
                    : "Past Exhibition"}
                </Badge>
              </div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-2xl font-bold">
              {exhibition.title}
            </h1>

            {/* Description */}
            {exhibition.description && (
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
                {exhibition.description}
              </p>
            )}

            {/* Event Details */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {exhibition.start_date && (
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg">
                    {new Date(exhibition.start_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                    {exhibition.end_date &&
                      exhibition.end_date !== exhibition.start_date && (
                        <>
                          {" "}
                          -{" "}
                          {new Date(exhibition.end_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </>
                      )}
                  </span>
                </div>
              )}

              {exhibition.location && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{exhibition.location}</span>
                </div>
              )}
            </div>

              {/* CTA Button */}
              {(exhibition.call_for_artists === true ||
                exhibition.call_for_artists === 1) &&
                exhibition.cta_link && (
                  <div className="mb-8 md:mb-12">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 px-8 py-4 text-lg font-semibold"
                      onClick={() => window.open(exhibition.cta_link, "_blank")}
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Join as an Artist
                    </Button>
                  </div>
                )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-8 md:mt-12">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
                onClick={() => navigate("/exhibitions")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exhibitions
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: exhibition.title,
                      text: exhibition.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibition Details */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Gallery */}
                {exhibition.gallery_images &&
                  exhibition.gallery_images.length > 0 && (
                    <div className="mb-12">
                      <ExhibitionGallery images={exhibition.gallery_images} />
                    </div>
                  )}

                {/* Additional Info */}
                {(exhibition.assigned_artists?.length > 0 ||
                  exhibition.assigned_artworks?.length > 0) && (
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900">
                        Exhibition Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {exhibition.assigned_artists?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Featured Artists
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {exhibition.assigned_artists.map(
                              (artist: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="px-3 py-1"
                                >
                                  {typeof artist === "string"
                                    ? artist
                                    : artist.name || artist}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {exhibition.assigned_artworks?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Featured Artworks
                          </h3>
                          <p className="text-gray-600">
                            This exhibition showcases{" "}
                            {exhibition.assigned_artworks.length} carefully
                            selected artworks.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Info Card */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">
                      Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {exhibition.start_date && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(exhibition.start_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                            {exhibition.end_date &&
                              exhibition.end_date !== exhibition.start_date && (
                                <>
                                  {" "}
                                  -{" "}
                                  {new Date(
                                    exhibition.end_date
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </>
                              )}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-semibold text-gray-900">
                            {exhibition.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.curator && (
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Curator</p>
                          <p className="font-semibold text-gray-900">
                            {exhibition.curator}
                          </p>
                        </div>
                      </div>
                    )}

                    {exhibition.assigned_artworks?.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-theme-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Artworks</p>
                          <p className="font-semibold text-gray-900">
                            {exhibition.assigned_artworks.length} pieces
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CTA Card */}
                {(exhibition.call_for_artists === true ||
                  exhibition.call_for_artists === 1) &&
                  exhibition.cta_link && (
                    <Card className="shadow-elegant bg-gradient-to-br from-theme-primary/5 to-theme-primary/10 border-theme-primary/20">
                      <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Join This Exhibition
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Artists are invited to participate in this exhibition.
                        </p>
                        <Button
                          className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white"
                          onClick={() =>
                            window.open(exhibition.cta_link, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
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

export default ExhibitionDetail;
