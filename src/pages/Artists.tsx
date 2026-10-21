import { Link } from "react-router-dom";
import {
  Container,
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import SocialLinks from "@/components/SocialLinks";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";

const Artists = () => {
  const { pageData } = usePageDataFromDB();
  const { data: artists = [], loading } = useApi(
    () => apiClient.getArtists(),
    []
  );
  const title = pageData.artists?.title?.trim() || "Artists";
  useSeo({ title, description: pageData.artists?.description });

  return (
    <RequireVisiblePage page="artists">
      <PageLayout>
        <PageHeader
          title={title}
          description={
            pageData.artists?.description && (
              <p>{pageData.artists.description}</p>
            )
          }
        />

        <Container className="pb-16 md:pb-20">
          {loading ? (
            <LoadingState label="Loading artists…" />
          ) : artists.length === 0 ? (
            <p className="border-t border-line py-20 text-mist">
              No artists to show yet.
            </p>
          ) : (
            <ul className="border-t border-line">
              {artists.map((artist) => (
                <li
                  key={artist.id}
                  className="group relative flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-line py-7"
                >
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <h2 className="font-medium text-3xl md:text-4xl">
                      {/* The link covers the whole row; social links sit above it */}
                      <Link
                        to={`/artist/${artist.slug}`}
                        className="after:absolute after:inset-0 group-hover:underline underline-offset-[6px] decoration-1 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-ink"
                      >
                        {artist.name.trim()}
                      </Link>
                    </h2>
                    {artist.specialty && (
                      <p className="text-sm text-mist">{artist.specialty}</p>
                    )}
                  </div>
                  <SocialLinks
                    links={artist.social_media}
                    ownerName={artist.name.trim()}
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default Artists;
