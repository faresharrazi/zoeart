import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkZoom from "@/components/ArtworkZoom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Palette,
  Ruler,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const ArtworkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const [artworks, artists] = await Promise.all([
          apiClient.getArtworks(),
          apiClient.getArtists(),
        ]);

        const foundArtwork = (artworks as any[]).find(
          (art: any) => art.slug === slug
        );
        setArtwork(foundArtwork);

        // Find the artist for this artwork
        if (foundArtwork?.artist_id) {
          const foundArtist = (artists as any[]).find(
            (artist: any) =>
              artist.id.toString() === foundArtwork.artist_id.toString()
          );
          setArtist(foundArtist);
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArtwork();
    }
  }, [slug]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
  };

  const handlePrevImage = () => {
    if (artwork.images && artwork.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? artwork.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (artwork.images && artwork.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === artwork.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 bg-black"></div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">Loading artwork...</span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 bg-black"></div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
              <h1 className="text-4xl md:text-6xl mb-6 text-white drop-shadow-lg">
                Artwork Not Found
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                The artwork you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                onClick={() => navigate("/collection")}
                className="mt-6"
                variant="secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collection
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const hasImages = artwork.images && artwork.images.length > 0;
  const hasValidImages =
    hasImages &&
    artwork.images.some((img: string) => img && !img.startsWith("blob:"));

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-4 bg-black">
        <div className="absolute inset-0 bg-black"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Consistent text overlay background for all cases */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            <h1 className="text-4xl md:text-6xl mb-6 text-white drop-shadow-lg">
              {artwork.title || "Untitled"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              by {artwork.artist_name || "Unknown Artist"}
            </p>
          </div>
        </div>
      </section>

      {/* Artwork Content */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Artwork Images */}
              <div className="space-y-6">
                {/* Main Image */}
                {hasValidImages ? (
                  <div className="relative group">
                    <img
                      src={artwork.images[selectedImageIndex]}
                      alt={artwork.title}
                      className="w-full h-auto rounded-lg shadow-elegant cursor-pointer"
                      onClick={() => handleImageClick(selectedImageIndex)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => handleImageClick(selectedImageIndex)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <ZoomIn className="w-5 h-5 mr-2" />
                        Click to Zoom
                      </Button>
                    </div>

                    {/* Navigation arrows for multiple images */}
                    {artwork.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-elegant flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl text-slate-600 font-semibold">
                          {artwork.title?.charAt(0) || "A"}
                        </span>
                      </div>
                      <p className="text-slate-500">No image available</p>
                    </div>
                  </div>
                )}

                {/* Thumbnail Gallery */}
                {hasValidImages && artwork.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {artwork.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${artwork.title} detail ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all duration-300 ${
                          index === selectedImageIndex
                            ? "ring-2 ring-blue-500 shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Artwork Information */}
              <div className="space-y-6">
                <Card className="shadow-elegant">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Title and Artist */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {artwork.title || "Untitled"}
                        </h2>
                        <p className="text-xl text-gray-600">
                          by {artwork.artist_name || "Unknown Artist"}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-4">
                        {artwork.year && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {artwork.year}
                            </span>
                          </div>
                        )}

                        {artwork.medium && (
                          <div className="flex items-center gap-3">
                            <Palette className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {artwork.medium}
                            </span>
                          </div>
                        )}

                        {artwork.size && (
                          <div className="flex items-center gap-3">
                            <Ruler className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {artwork.size}
                            </span>
                          </div>
                        )}

                        {artwork.artist_name && (
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {artwork.artist_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {artwork.description && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            About This Work
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {artwork.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Artist Section */}
                {artist && (
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Artist
                      </h3>
                      <div className="flex justify-center">
                        <div
                          className={`text-center w-32 ${
                            artist.is_visible !== false
                              ? "cursor-pointer hover:opacity-80 transition-opacity"
                              : ""
                          }`}
                          onClick={() => {
                            if (artist.is_visible !== false && artist.slug) {
                              navigate(`/artist/${artist.slug}`);
                            }
                          }}
                        >
                          {artist.profile_image ? (
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                              <img
                                src={artist.profile_image}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                          <p className="text-gray-900 font-semibold text-lg">
                            {artist.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/collection")}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Collection
                  </Button>
                  <Button
                    onClick={() =>
                      navigate(
                        `/artist/${artwork.artist_name
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                    className="flex-1"
                  >
                    View Artist Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Zoom Modal */}
      {hasValidImages && (
        <ArtworkZoom
          images={artwork.images}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}

      <Footer />
    </div>
  );
};

export default ArtworkDetail;
