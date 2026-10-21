import { useParams } from "react-router-dom";
import ArtworkCard from "@/components/ArtworkCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  LoadingState,
  NotFoundState,
  PageLayout,
} from "@/components/PageLayout";
import SocialLinks from "@/components/SocialLinks";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";
import { imageUrl } from "@/lib/images";

const ArtistDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, loading } = useApi(async () => {
    const artist = await apiClient.getArtist(slug);
    const artworks = await apiClient.getArtworks({ artist: artist.id });
    return { artist, artworks };
  }, [slug]);

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
          title="Artist Not Found"
          message="The artist you're looking for doesn't exist or has been removed."
          backTo="/artists"
          backLabel="Back to Artists"
        />
      </PageLayout>
    );
  }

  const { artist, artworks } = data;

  return (
    <PageLayout>
      <section className="pb-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto py-20">
            <div className="mb-8">
              <ImageWithFallback
                src={imageUrl(artist.profile_image, {
                  width: 320,
                  height: 320,
                  crop: "fill",
                })}
                alt={`Portrait of ${artist.name}`}
                width={160}
                height={160}
                className="w-40 h-40 rounded-full mx-auto object-cover shadow-2xl border-4 border-gray-200"
                fallback={
                  <div className="w-40 h-40 rounded-full mx-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-2xl border-4 border-gray-200">
                    <span
                      className="text-5xl text-gray-600 font-semibold"
                      aria-hidden="true"
                    >
                      {artist.name.charAt(0)}
                    </span>
                  </div>
                }
              />
            </div>

            <h1 className="text-4xl md:text-6xl text-gray-900 mb-6">
              {artist.name}
            </h1>

            {artist.specialty && (
              <p className="mb-8">
                <span className="inline-block px-6 py-3 bg-gray-100 rounded-full text-gray-700 text-lg border border-gray-200">
                  {artist.specialty}
                </span>
              </p>
            )}

            {artist.bio && (
              <p className="max-w-3xl mx-auto mb-12 text-xl text-gray-700 leading-relaxed whitespace-pre-line">
                {artist.bio}
              </p>
            )}

            <SocialLinks
              links={artist.social_media}
              ownerName={artist.name}
              className="flex justify-center space-x-4"
              linkClassName="block p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:scale-110 text-gray-700"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
                Featured Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {artworks.length > 0
                  ? `Explore ${artist.name}'s collection of ${artworks.length} ${
                      artworks.length === 1 ? "artwork" : "artworks"
                    }`
                  : `No artworks available for ${artist.name} at the moment.`}
              </p>
            </div>

            {artworks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ArtistDetail;
