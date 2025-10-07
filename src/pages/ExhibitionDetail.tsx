import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  UserCheck,
  Image as ImageIcon,
  Loader2,
  FileText,
  User,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useArticleByExhibition } from "@/hooks/useArticles";

const ExhibitionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState<{
    id: string;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    curator: string;
    status: string;
    featured_image: string;
    gallery_images: string[];
    assigned_artists: string[];
    call_for_artists: boolean;
    cta_link: string;
  } | null>(null);
  const [artists, setArtists] = useState<
    {
      id: number;
      name: string;
      slug: string;
      specialty?: string;
      profile_image?: string;
      is_visible?: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Get article for this exhibition
  const { article, loading: articleLoading } = useArticleByExhibition(
    exhibition ? parseInt(exhibition.id) : 0
  );

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        const [exhibitions, artistsData] = await Promise.all([
          apiClient.getExhibitions(),
          apiClient.getArtists(),
        ]);

        const foundExhibition = exhibitions.find((ex) => ex.slug === slug);
        setExhibition(foundExhibition);
        setArtists(artistsData);
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
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-xl text-white">
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

      {/* Featured Image Section */}
      {exhibition.featured_image &&
      exhibition.featured_image !== "null" &&
      exhibition.featured_image !== "undefined" ? (
        <section className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden flex items-center justify-center bg-gray-100">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-110"
            style={{
              backgroundImage: `url(${exhibition.featured_image})`
            }}
          />
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Main Poster Image */}
          <div className="relative z-10 max-w-full max-h-full p-4">
            <img
              src={exhibition.featured_image}
              alt={exhibition.title}
              className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Back Button Overlay */}
          <div className="absolute top-2 left-2 md:top-6 md:left-6 z-20">
            <Button
              onClick={() => navigate("/exhibitions")}
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Back to Exhibitions</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </section>
      ) : (
        <section className="w-full h-[40vh] bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">No featured image</p>
          </div>
          {/* Back Button Overlay */}
          <div className="absolute top-6 left-6 z-10">
            <Button
              onClick={() => navigate("/exhibitions")}
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exhibitions
            </Button>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Status Badge */}
            <div className="mb-6">
              <Badge
                variant={
                  exhibition.status === "upcoming" ? "default" : "secondary"
                }
                className="px-4 py-2 text-base font-semibold"
              >
                {exhibition.status === "upcoming"
                  ? "Upcoming Exhibition"
                  : "Past Exhibition"}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {exhibition.title}
            </h1>

            {/* Description */}
            {exhibition.description && (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {exhibition.description}
                </p>
              </div>
            )}

            {/* Exhibition Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Date */}
              <Card className="p-6">
                <CardContent className="text-center">
                  <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Start Date
                  </p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {formatDate(exhibition.start_date)}
                  </p>
                  {exhibition.end_date && (
                    <p className="text-gray-500 text-sm mt-1">
                      to {formatDate(exhibition.end_date)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              {exhibition.location && (
                <Card className="p-6">
                  <CardContent className="text-center">
                    <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Location
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {exhibition.location}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Curator */}
              {exhibition.curator && (
                <Card className="p-6">
                  <CardContent className="text-center">
                    <UserCheck className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Curator
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {exhibition.curator}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Call for Artists Button */}
            {exhibition.call_for_artists && (
              <div className="text-center mb-12">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold"
                  onClick={() => {
                    if (exhibition.cta_link) {
                      window.open(exhibition.cta_link, "_blank");
                    }
                  }}
                >
                  Join as Artist
                </Button>
              </div>
            )}

            {/* Assigned Artists Section */}
            {exhibition.assigned_artists &&
              Array.isArray(exhibition.assigned_artists) &&
              exhibition.assigned_artists.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Featured Artists
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {exhibition.assigned_artists.map((artistId: string) => {
                      const artist = artists.find(
                        (a) => a.id.toString() === artistId
                      );

                      const isArtistVisible = artist?.is_visible !== false;
                      const handleArtistClick = () => {
                        if (isArtistVisible && artist?.slug) {
                          navigate(`/artist/${artist.slug}`);
                        }
                      };

                      return (
                        <div
                          key={artistId}
                          className={`text-center w-32 ${
                            isArtistVisible
                              ? "cursor-pointer hover:scale-105 transition-all duration-300"
                              : ""
                          }`}
                          onClick={handleArtistClick}
                        >
                          {artist?.profile_image ? (
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                              <img
                                src={artist.profile_image}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserCheck className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                          <p className="text-gray-900 font-semibold text-lg">
                            {artist?.name || `Artist ${artistId}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Gallery Section */}
            {exhibition.gallery_images &&
              Array.isArray(exhibition.gallery_images) &&
              exhibition.gallery_images.length > 0 && (
                <div className="mb-12">
                  <ExhibitionGallery images={exhibition.gallery_images} />
                </div>
              )}

            {/* Article Section */}
            {article && (
              <div className="mb-12">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  {/* Article Title - Centered like Exhibition Gallery */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {article.title}
                    </h2>
                    {article.author && (
                      <div className="text-gray-600 text-sm">
                        By {article.author}
                      </div>
                    )}
                  </div>
                  {/* Featured Image */}
                  {article.featured_image && (
                    <div className="mb-6">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Article Content */}
                  <div
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                    style={
                      {
                        "--tw-prose-headings": "#1f2937",
                        "--tw-prose-links": "#1f2937",
                        "--tw-prose-bold": "#1f2937",
                        "--tw-prose-counters": "#6b7280",
                        "--tw-prose-bullets": "#6b7280",
                      } as React.CSSProperties
                    }
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    ref={(el) => {
                      if (el) {
                        // Convert YouTube markers to actual embeds
                        const html = el.innerHTML;
                        const youtubeRegex = /\[YOUTUBE:([^:]+):([^\]]+)\]/g;

                        if (youtubeRegex.test(html)) {
                          const newHtml = html.replace(
                            youtubeRegex,
                            (match, videoId, youtubeUrl) => {
                              return `
                              <div class="youtube-embed" data-youtube-url="${youtubeUrl}" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px; margin: 1rem 0;">
                                <iframe 
                                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                                  src="https://www.youtube.com/embed/${videoId}" 
                                  frameborder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowfullscreen>
                                </iframe>
                              </div>
                            `;
                            }
                          );
                          el.innerHTML = newHtml;
                        }
                      }
                    }}
                  />

                  {/* Custom CSS for article content */}
                  <style>{`
                    .prose h1 {
                      font-size: 2rem !important;
                      font-weight: bold !important;
                      margin: 1rem 0 0.5rem 0 !important;
                      line-height: 1.2 !important;
                      color: #1f2937 !important;
                    }
                    .prose h2 {
                      font-size: 1.5rem !important;
                      font-weight: bold !important;
                      margin: 0.8rem 0 0.4rem 0 !important;
                      line-height: 1.3 !important;
                      color: #1f2937 !important;
                    }
                    .prose h3 {
                      font-size: 1.25rem !important;
                      font-weight: bold !important;
                      margin: 0.6rem 0 0.3rem 0 !important;
                      line-height: 1.4 !important;
                      color: #1f2937 !important;
                    }
                    .prose ul {
                      list-style-type: disc !important;
                      margin: 0.5rem 0 !important;
                      padding-left: 1.5rem !important;
                    }
                    .prose ol {
                      list-style-type: decimal !important;
                      margin: 0.5rem 0 !important;
                      padding-left: 1.5rem !important;
                    }
                    .prose li {
                      margin: 0.25rem 0 !important;
                    }
                    .prose p {
                      margin: 0.5rem 0 !important;
                    }
                    .prose p:empty {
                      margin: 1rem 0 !important;
                      min-height: 1rem;
                    }
                    .prose strong {
                      font-weight: bold !important;
                    }
                    .prose em {
                      font-style: italic !important;
                    }
                    .prose u {
                      text-decoration: underline !important;
                    }
                    .prose blockquote {
                      border-left: 4px solid #e5e7eb !important;
                      padding-left: 1rem !important;
                      margin: 1rem 0 !important;
                      font-style: italic !important;
                      color: #6b7280 !important;
                    }
                  `}</style>

                  {/* Media Files */}
                  {article.media_files && article.media_files.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Additional Media
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {article.media_files.map((mediaUrl, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden shadow-md"
                          >
                            {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video
                                src={mediaUrl}
                                controls
                                className="w-full h-auto"
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={`Media ${index + 1}`}
                                className="w-full h-auto"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

export default ExhibitionDetail;
