import ArtworkCard from "@/components/ArtworkCard";
import {
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";
import { useSeo } from "@/hooks/useSeo";

const Collection = () => {
  const { pageData } = usePageDataFromDB();
  const { data: artworks = [], loading } = useApi(
    () => apiClient.getArtworks(),
    []
  );
  useSeo({
    title: pageData.gallery?.title || "Collection",
    description: pageData.gallery?.description,
  });

  return (
    <RequireVisiblePage page="gallery">
      <PageLayout>
        <PageHeader
          title={pageData.gallery?.title || "Gallery"}
          description={
            <p>{pageData.gallery?.description || "Explore our collection"}</p>
          }
        />

        <section className="py-20 bg-theme-background">
          <div className="container mx-auto px-6">
            {loading ? (
              <LoadingState label="Loading collection…" />
            ) : artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    headingLevel="h2"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-theme-text-muted">
                No artworks to show yet.
              </p>
            )}
          </div>
        </section>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default Collection;
