import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExhibitionCard from "@/components/ExhibitionCard";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pageData } = usePageDataFromDB();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const data = await apiClient.getExhibitions();
        setExhibitions(data);
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const upcomingExhibitions = exhibitions.filter(
    (ex) => ex.status === "upcoming"
  );
  const currentExhibitions = exhibitions.filter(
    (ex) => ex.status === "current"
  );
  const pastExhibitions = exhibitions.filter((ex) => ex.status === "past");

  const handleExhibitionClick = (exhibitionSlug: string) => {
    window.location.href = `/exhibition/${exhibitionSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto my-24">
              <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
                {pageData.exhibitions?.title || "Exhibitions"}
              </h1>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">
                  Loading exhibitions...
                </span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
              {pageData.exhibitions?.title || "Exhibitions"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.exhibitions?.description || "Discover our exhibitions"}
            </p>
          </div>
        </div>
      </section>

      {/* Only show content sections if there are exhibitions */}
      {(upcomingExhibitions.length > 0 || currentExhibitions.length > 0 || pastExhibitions.length > 0) && (
        <div className="bg-theme-background py-20">
          <div className="container mx-auto px-6 space-y-16">
            {/* Current Exhibitions */}
            {currentExhibitions.length > 0 && (
              <section>
                <h2 className="text-3xl  mb-8 text-theme-text-primary">
                  Current Exhibitions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentExhibitions.map((exhibition) => (
                    <ExhibitionCard
                      key={exhibition.id}
                      exhibition={exhibition}
                      onExhibitionClick={handleExhibitionClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Exhibitions */}
            {upcomingExhibitions.length > 0 && (
              <section>
                <h2 className="text-3xl  mb-8 text-theme-text-primary">
                  Upcoming Exhibitions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingExhibitions.map((exhibition) => (
                    <ExhibitionCard
                      key={exhibition.id}
                      exhibition={exhibition}
                      onExhibitionClick={handleExhibitionClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past Exhibitions */}
            {pastExhibitions.length > 0 && (
              <section>
                <h2 className="text-3xl  mb-8 text-theme-text-primary">
                  Past Exhibitions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastExhibitions.map((exhibition) => (
                    <ExhibitionCard
                      key={exhibition.id}
                      exhibition={exhibition}
                      onExhibitionClick={handleExhibitionClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Exhibitions;
