import ExhibitionCard from "@/components/ExhibitionCard";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

const RecentExhibitions = () => {
  const [currentExhibitions, setCurrentExhibitions] = useState<any[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const data = await apiClient.getExhibitions();

        // Separate current and upcoming exhibitions
        const current = data.filter((e: any) => e.status === "current");
        const upcoming = data.filter((e: any) => e.status === "upcoming");

        // Limit to 3 each for home page
        setCurrentExhibitions(current.slice(0, 3));
        setUpcomingExhibitions(upcoming.slice(0, 3));
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExhibitionClick = (exhibitionSlug: string) => {
    window.location.href = `/exhibition/${exhibitionSlug}`;
  };

  if (loading) {
    return (
      <section id="recent-exhibitions" className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto" />
            <p className="text-theme-text-muted mt-4">Loading exhibitions...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render the section if there are no exhibitions at all
  if (currentExhibitions.length === 0 && upcomingExhibitions.length === 0) {
    return null;
  }

  return (
    <section id="recent-exhibitions" className="py-20 bg-theme-background">
      <div className="container mx-auto px-6">
        <div className="space-y-20">
          {/* On View Section */}
          {currentExhibitions.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-4">
                  On View
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentExhibitions.map((exhibition) => (
                  <ExhibitionCard
                    key={exhibition.id}
                    exhibition={exhibition}
                    onExhibitionClick={handleExhibitionClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingExhibitions.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-4">
                  Upcoming
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingExhibitions.map((exhibition) => (
                  <ExhibitionCard
                    key={exhibition.id}
                    exhibition={exhibition}
                    onExhibitionClick={handleExhibitionClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-16">
          <a
            href="/exhibitions"
            className="inline-block bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover transition-smooth px-8 py-3 text-lg "
          >
            View All Exhibitions
          </a>
        </div>
      </div>
    </section>
  );
};

export default RecentExhibitions;
