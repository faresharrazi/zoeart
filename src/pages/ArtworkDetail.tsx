import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  BackLink,
  Container,
  LoadingState,
  NotFoundState,
  PageLayout,
} from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import { imageSrcSet, imageUrl } from "@/lib/images";

// Social preview images: 1200x630, cropped to fill
const shareImage = (url: string | null | undefined) =>
  url ? imageUrl(url, { width: 1200, height: 630, crop: "fill" }) : null;

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

const ArtworkDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: artwork, loading } = useApi(
    () => apiClient.getArtwork(slug),
    [slug]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  useSeo({
    title: artwork?.title || (loading ? undefined : "Artwork Not Found"),
    description:
      artwork?.description ||
      (artwork &&
        [
          artwork.artist_name && `by ${artwork.artist_name}`,
          artwork.year,
          artwork.medium,
        ]
          .filter(Boolean)
          .join(", ")),
    image: shareImage(artwork?.featured_image || artwork?.images?.[0]),
    noIndex: !loading && !artwork,
    jsonLd: artwork && {
      "@context": "https://schema.org",
      "@type": "VisualArtwork",
      name: artwork.title,
      description: artwork.description || undefined,
      image: artwork.images,
      dateCreated: artwork.year ? String(artwork.year) : undefined,
      artMedium: artwork.medium || undefined,
      size: artwork.size || undefined,
      creator: artwork.artist_name
        ? { "@type": "Person", name: artwork.artist_name }
        : undefined,
    },
  });

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
          title="Artwork not found"
          message="The artwork you're looking for doesn't exist or has been removed."
          backTo="/collection"
          backLabel="Collection"
        />
      </PageLayout>
    );
  }

  const images = artwork.images;
  const title = artwork.title?.trim() || "Untitled";
  const artist = artwork.artist;
  const byline = artwork.artist_name || "Unknown artist";
  const current = images[selectedIndex] ?? images[0];
  const step = (delta: number) =>
    setSelectedIndex((i) => (i + delta + images.length) % images.length);

  const facts = [
    { label: "Year", value: artwork.year },
    { label: "Medium", value: artwork.medium?.trim() },
    { label: "Size", value: artwork.size?.trim() },
  ].filter((fact) => fact.value);

  return (
    <PageLayout>
      <Container className="grid gap-12 py-12 md:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7 space-y-4">
          <div className="relative bg-sand">
            <button
              type="button"
              className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              onClick={() => current && setViewerIndex(selectedIndex)}
              aria-label={`Enlarge image of ${title}`}
              disabled={!current}
            >
              <ImageWithFallback
                src={imageUrl(current, { width: 1400 })}
                srcSet={imageSrcSet(current, [700, 1000, 1400, 1800])}
                sizes="(min-width: 1024px) 55vw, 100vw"
                alt={`${title} by ${byline}`}
                className="w-full max-h-[80vh] object-contain"
                fallback={
                  <div className="aspect-[4/5] flex items-center justify-center">
                    <span className="text-7xl text-mist" aria-hidden="true">
                      {title.charAt(0)}
                    </span>
                  </div>
                }
              />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className={`${arrowClass} left-4`}
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className={`${arrowClass} right-4`}
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <ul className="grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <li key={image + index}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === selectedIndex ? "true" : undefined}
                    className={`block w-full aspect-square overflow-hidden transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                      index === selectedIndex
                        ? "ring-1 ring-ink"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imageUrl(image, {
                        width: 200,
                        height: 200,
                        crop: "fill",
                      })}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-8">
          <BackLink to="/collection">Collection</BackLink>
          <div className="space-y-4">
            <h1 className="font-medium text-5xl md:text-6xl leading-[1.02]">
              {title}
            </h1>
            {artist ? (
              <Link
                to={`/artist/${artist.slug}`}
                className="inline-block text-lg text-stone hover:text-ink underline-offset-4 decoration-1 hover:underline"
              >
                {artist.name.trim()}
              </Link>
            ) : (
              <p className="text-lg text-stone">{byline}</p>
            )}
          </div>

          {facts.length > 0 && (
            <dl className="border-t border-line">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[120px_1fr] gap-4 border-b border-line py-4 text-sm"
                >
                  <dt className="text-mist">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {artwork.description && (
            <p className="text-lg leading-relaxed text-stone whitespace-pre-line">
              {artwork.description.trim()}
            </p>
          )}
        </div>
      </Container>

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
