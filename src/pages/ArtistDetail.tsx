import { useParams } from "react-router-dom";
import ArtworkCard from "@/components/ArtworkCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  BackLink,
  Container,
  LoadingState,
  NotFoundState,
  PageLayout,
} from "@/components/PageLayout";
import SocialLinks from "@/components/SocialLinks";
import { useApi } from "@/hooks/useApi";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import { imageUrl } from "@/lib/images";

// Social preview images: 1200x630, cropped to fill
const shareImage = (url: string | null | undefined) =>
  url ? imageUrl(url, { width: 1200, height: 630, crop: "fill" }) : null;

const ArtistDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, loading } = useApi(async () => {
    const artist = await apiClient.getArtist(slug);
    const artworks = await apiClient.getArtworks({ artist: artist.id });
    return { artist, artworks };
  }, [slug]);
  const seoArtist = data?.artist;
  useSeo({
    title: seoArtist?.name || (loading ? undefined : "Artist Not Found"),
    description:
      seoArtist?.bio ||
      (seoArtist &&
        `${seoArtist.name}${seoArtist.specialty ? `, ${seoArtist.specialty}` : ""}`),
    image: shareImage(seoArtist?.profile_image),
    type: "profile",
    noIndex: !loading && !seoArtist,
    jsonLd: seoArtist && {
      "@context": "https://schema.org",
      "@type": "Person",
      name: seoArtist.name,
      description: seoArtist.bio || undefined,
      jobTitle: seoArtist.specialty || undefined,
      image: seoArtist.profile_image || undefined,
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <LoadingState label="Loading artist…" />
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout>
        <NotFoundState
          title="Artist not found"
          message="The artist you're looking for doesn't exist or has been removed."
          backTo="/artists"
          backLabel="All artists"
        />
      </PageLayout>
    );
  }

  const { artist, artworks } = data;
  const name = artist.name.trim();

  return (
    <PageLayout>
      <Container className="grid gap-12 py-12 md:py-20 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <ImageWithFallback
            src={imageUrl(artist.profile_image, {
              width: 900,
              height: 1125,
              crop: "fill",
            })}
            alt={`Portrait of ${name}`}
            className="w-full aspect-[4/5] object-cover bg-sand"
            fallback={
              <div className="w-full aspect-[4/5] bg-sand flex items-center justify-center">
                <span className="text-8xl text-mist" aria-hidden="true">
                  {name.charAt(0)}
                </span>
              </div>
            }
          />
        </div>

        <div className="md:col-span-7 space-y-8 md:pt-4">
          <BackLink to="/artists">All artists</BackLink>
          <div className="space-y-4">
            {artist.specialty && (
              <p className="eyebrow text-mist">{artist.specialty}</p>
            )}
            <h1 className="font-medium text-5xl md:text-7xl leading-[1.02]">
              {name}
            </h1>
          </div>
          {artist.bio && (
            <p className="max-w-2xl text-lg leading-relaxed text-stone whitespace-pre-line">
              {artist.bio.trim()}
            </p>
          )}
          <SocialLinks links={artist.social_media} ownerName={name} />
        </div>
      </Container>

      {artworks.length > 0 && (
        <Container as="section" className="pb-16 md:pb-20">
          <div className="border-t border-line pt-10">
            <h2 className="font-medium text-3xl md:text-4xl mb-10">Works</h2>
            <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </div>
        </Container>
      )}
    </PageLayout>
  );
};

export default ArtistDetail;
