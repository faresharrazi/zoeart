import ExhibitionCard from "@/components/ExhibitionCard";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

const RecentExhibitions = () => {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const data = await apiClient.getExhibitions();
        // Get only upcoming exhibitions, limit to 3
        const upcoming = data
          .filter((e: any) => e.status === "upcoming")
          .slice(0, 3);
        setExhibitions(upcoming);
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

  // Don't render the section if there are no exhibitions
  if (exhibitions.length === 0) {
    return null;
  }

  return (
    <section id="recent-exhibitions" className="py-20 bg-theme-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl  mb-6 text-theme-text-primary">
            Upcoming{" "}
            <span className="text-theme-text-primary">Exhibitions</span>
          </h2>
          <p className="text-xl text-theme-text-muted max-w-3xl mx-auto leading-relaxed">
            Discover our upcoming exhibitions featuring contemporary artists and
            innovative artistic expressions. Join us for these exciting
            showcases of creativity and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard
              key={exhibition.id}
              exhibition={exhibition}
              onExhibitionClick={handleExhibitionClick}
            />
          ))}
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
