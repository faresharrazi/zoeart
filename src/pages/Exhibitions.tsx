import ExhibitionGrid from "@/components/ExhibitionGrid";
import { LoadingState, PageHeader, PageLayout } from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";
import { byStartDateDesc } from "@/lib/dates";

const Exhibitions = () => {
  const { pageData } = usePageDataFromDB();
  const { data: exhibitions = [], loading } = useApi(
    () => apiClient.getExhibitions(),
    []
  );

  const withStatus = (status: string) =>
    exhibitions.filter((e) => e.status === status).sort(byStartDateDesc);

  return (
    <PageLayout>
      <PageHeader
        title={pageData.exhibitions?.title || "Exhibitions"}
        description={
          <p>
            {pageData.exhibitions?.description || "Discover our exhibitions"}
          </p>
        }
      />

      <div className="bg-theme-background py-20">
        <div className="container mx-auto px-6 space-y-16">
          {loading ? (
            <LoadingState label="Loading exhibitions…" />
          ) : exhibitions.length === 0 ? (
            <p className="text-center text-theme-text-muted">
              No exhibitions to show yet.
            </p>
          ) : (
            <>
              <ExhibitionGrid
                title="Current Exhibitions"
                exhibitions={withStatus("current")}
              />
              <ExhibitionGrid
                title="Upcoming Exhibitions"
                exhibitions={withStatus("upcoming")}
              />
              <ExhibitionGrid
                title="Past Exhibitions"
                exhibitions={withStatus("past")}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Exhibitions;
