import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Palette,
  Ruler,
  User,
} from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import {
  LoadingState,
  NotFoundState,
  PageHeader,
  PageLayout,
} from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";
import { imageSrcSet, imageUrl } from "@/lib/images";

const ArtworkDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: artwork, loading } = useApi(
    () => apiClient.getArtwork(slug),
    [slug]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <PageLayout>
        <LoadingState label="Loading artwork…" />
      </PageLayout>
    );
  }

  if (!artwork) {
    return (
      <PageLayout>
        <NotFoundState
          title="Artwork Not Found"
          message="The artwork you're looking for doesn't exist or has been removed."
          backTo="/collection"
          backLabel="Back to Collection"
        />
      </PageLayout>
    );
  }

  const images: string[] = artwork.images;
  const title = artwork.title || "Untitled";
  const artist = artwork.artist;
  const byline = artwork.artist_name || "Unknown Artist";
  const current = images[selectedIndex] ?? images[0];
  const step = (delta: number) =>
    setSelectedIndex((i) => (i + delta + images.length) % images.length);

  const details = [
    { icon: Calendar, label: "Year", value: artwork.year },
    { icon: Palette, label: "Medium", value: artwork.medium },
    { icon: Ruler, label: "Size", value: artwork.size },
    { icon: User, label: "Artist", value: artwork.artist_name },
  ].filter((d) => d.value);

  return (
    <PageLayout>
      <PageHeader title={title} description={<p>by {byline}</p>} />

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {current ? (
                <div className="relative">
                  <button
                    type="button"
                    className="block w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                    onClick={() => setViewerIndex(selectedIndex)}
                    aria-label={`Enlarge image of ${title}`}
                  >
                    <img
                      src={imageUrl(current, { width: 1200 })}
                      srcSet={imageSrcSet(current, [600, 900, 1200, 1600])}
                      sizes="(min-width: 1024px) 560px, 100vw"
                      alt={`${title} by ${byline}`}
                      className="w-full h-auto rounded-lg shadow-elegant"
                    />
                  </button>

                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => step(-1)}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      >
                        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => step(1)}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      >
                        <ChevronRight className="w-6 h-6" aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-elegant flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-4">
                      <span
                        className="text-4xl text-slate-600 font-semibold"
                        aria-hidden="true"
                      >
                        {title.charAt(0)}
                      </span>
                    </div>
                    <p className="text-slate-500">No image available</p>
                  </div>
                </div>
              )}

              {images.length > 1 && (
                <ul className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <li key={image + index}>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                        aria-current={
                          index === selectedIndex ? "true" : undefined
                        }
                        className={`block w-full rounded-lg overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary ${
                          index === selectedIndex
                            ? "ring-2 ring-theme-primary shadow-lg"
                            : "hover:shadow-md"
                        }`}
                      >
                        <img
                          src={imageUrl(image, {
                            width: 240,
                            height: 192,
                            crop: "fill",
                          })}
                          alt=""
                          loading="lazy"
                          className="w-full h-24 object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-6">
              <Card className="shadow-elegant">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {title}
                    </h2>
                    <p className="text-xl text-gray-600">by {byline}</p>
                  </div>

                  {details.length > 0 && (
                    <dl className="space-y-4">
                      {details.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <dt>
                            <Icon
                              className="w-5 h-5 text-gray-500"
                              aria-hidden="true"
                            />
                            <span className="sr-only">{label}</span>
                          </dt>
                          <dd className="text-gray-700">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {artwork.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        About This Work
                      </h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {artwork.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {artist && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Artist
                    </h3>
                    <Link
                      to={`/artist/${artist.slug}`}
                      className="block text-center w-32 mx-auto hover:opacity-80 transition-opacity"
                    >
                      {artist.profile_image ? (
                        <img
                          src={imageUrl(artist.profile_image, {
                            width: 160,
                            height: 160,
                            crop: "fill",
                          })}
                          alt=""
                          loading="lazy"
                          className="w-20 h-20 mx-auto mb-3 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                          <User
                            className="w-8 h-8 text-gray-600"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                      <span className="block text-gray-900 font-semibold text-lg">
                        {artist.name}
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/collection">
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to Collection
                  </Link>
                </Button>
                {artist && (
                  <Button asChild className="flex-1">
                    <Link to={`/artist/${artist.slug}`}>
                      View Artist Profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ImageViewer
        images={images.map((src, i) => ({
          src,
          alt: `${title} by ${byline}, image ${i + 1}`,
        }))}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
        label={title}
        downloadName={artwork.slug}
        allowRotate
      />
    </PageLayout>
  );
};

export default ArtworkDetail;
