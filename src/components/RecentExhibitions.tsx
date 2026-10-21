import { Link } from "react-router-dom";
import ExhibitionGrid from "@/components/ExhibitionGrid";
import { LoadingState } from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";

const HOME_PAGE_LIMIT = 3;

const RecentExhibitions = () => {
  const { data: exhibitions = [], loading } = useApi(
    () => apiClient.getExhibitions(),
    []
  );

  const current = exhibitions
    .filter((e) => e.status === "current")
    .slice(0, HOME_PAGE_LIMIT);
  const upcoming = exhibitions
    .filter((e) => e.status === "upcoming")
    .slice(0, HOME_PAGE_LIMIT);

  if (!loading && current.length === 0 && upcoming.length === 0) {
    return null;
  }

  return (
    <section id="recent-exhibitions" className="py-20 bg-theme-background">
      <div className="container mx-auto px-6">
        {loading ? (
          <LoadingState label="Loading exhibitions…" />
        ) : (
          <div className="space-y-20">
            <ExhibitionGrid title="On View" exhibitions={current} centered />
            <ExhibitionGrid title="Upcoming" exhibitions={upcoming} centered />
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            to="/exhibitions"
            className="inline-block bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover transition-smooth px-8 py-3 text-lg"
          >
            View All Exhibitions
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentExhibitions;
