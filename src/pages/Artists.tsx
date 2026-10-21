import { Link } from "react-router-dom";
import {
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import SocialLinks from "@/components/SocialLinks";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";

const Artists = () => {
  const { pageData } = usePageDataFromDB();
  const { data: artists = [], loading } = useApi(
    () => apiClient.getArtists(),
    []
  );

  return (
    <RequireVisiblePage page="artists">
      <PageLayout>
        <PageHeader
          title={pageData.artists?.title || "Artists"}
          description={
            <p>
              {pageData.artists?.description || "Meet our talented artists"}
            </p>
          }
        />

        <section className="py-20 bg-theme-background">
          <div className="container mx-auto px-6">
            {loading ? (
              <LoadingState label="Loading artists…" />
            ) : (
              <ul className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                {artists.map((artist) => (
                  <li
                    key={artist.id}
                    className="group relative p-6 text-center"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-theme-primary transition-colors duration-300">
                      {/* The link covers the whole entry; social links sit above it */}
                      <Link
                        to={`/artist/${artist.slug}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-theme-primary focus-visible:after:rounded-lg"
                      >
                        {artist.name}
                      </Link>
                    </h2>
                    <SocialLinks
                      links={artist.social_media}
                      ownerName={artist.name}
                      className="relative z-10 flex justify-center space-x-3"
                      linkClassName="w-8 h-8 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default Artists;
