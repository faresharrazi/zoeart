import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { usePublicExhibitions } from "@/hooks/use-public-exhibitions";
import ExhibitionGallery from "@/components/ExhibitionGallery";

const Exhibitions = () => {
  const { exhibitions, loading, error } = usePublicExhibitions();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Gallery <span className="text-gallery-gold">Exhibitions</span>
            </h1>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Gallery <span className="text-gallery-gold">Exhibitions</span>
            </h1>
            <p className="text-red-400 text-xl">
              Error loading exhibitions: {error}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingExhibitions = exhibitions.filter(
    (ex) => ex.status === "upcoming"
  );
  const pastExhibitions = exhibitions.filter((ex) => ex.status === "past");

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Gallery <span className="text-gallery-gold">Exhibitions</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Discover our curated exhibitions that showcase the finest in
            contemporary art. From solo presentations to thematic group shows,
            each exhibition offers a unique journey through artistic vision.
          </p>
        </div>
      </section>

      <div className="bg-gallery-light-grey py-20">
        <div className="container mx-auto px-6 space-y-16">
          {/* Upcoming Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Upcoming Exhibitions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingExhibitions.map((exhibition, index) => (
                <Link key={index} to={`/exhibition/${exhibition.id}`}>
                  <Card className="shadow-elegant hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                    {exhibition.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={exhibition.featured_image}
                          alt={exhibition.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">
                          {exhibition.title}
                        </CardTitle>
                        <Badge variant="outline">{exhibition.status}</Badge>
                      </div>
                      <p className="text-muted-foreground font-semibold">
                        {new Date(exhibition.start_date).toLocaleDateString()} -{" "}
                        {new Date(exhibition.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exhibition.location || "Location TBD"}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {exhibition.description}
                      </p>
                      <div className="mt-auto">
                        <ExhibitionGallery
                          images={exhibition.gallery_images || []}
                          featuredImage={exhibition.featured_image}
                          exhibitionTitle={exhibition.title}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Past Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Past Exhibitions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastExhibitions.map((exhibition, index) => (
                <Link key={index} to={`/exhibition/${exhibition.id}`}>
                  <Card className="shadow-elegant opacity-90 hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                    {exhibition.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={exhibition.featured_image}
                          alt={exhibition.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">
                          {exhibition.title}
                        </CardTitle>
                        <Badge variant="secondary">{exhibition.status}</Badge>
                      </div>
                      <p className="text-muted-foreground font-semibold">
                        {new Date(exhibition.start_date).toLocaleDateString()} -{" "}
                        {new Date(exhibition.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exhibition.location || "Location TBD"}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {exhibition.description}
                      </p>
                      <div className="mt-auto">
                        <ExhibitionGallery
                          images={exhibition.gallery_images || []}
                          featuredImage={exhibition.featured_image}
                          exhibitionTitle={exhibition.title}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Exhibitions;
