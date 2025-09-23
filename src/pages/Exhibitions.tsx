import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const exhibitions = [
  {
    id: 1,
    slug: "contemporary-visions-2024",
    title: "Contemporary Visions 2024",
    status: "Current",
    dates: "March 15 - June 30, 2024",
    description:
      "A comprehensive survey of contemporary art featuring works that challenge conventional perspectives and explore new visual languages. This exhibition brings together six exceptional artists whose diverse practices reflect the complexity of our modern world.",
    artists: ["Elena Rodriguez", "Marcus Chen", "Sarah Williams"],
    artworks: 12,
    location: "Main Gallery, Floors 1-2",
  },
  {
    id: 2,
    slug: "material-explorations",
    title: "Material Explorations",
    status: "Upcoming",
    dates: "July 15 - October 30, 2024",
    description:
      "An innovative exhibition examining how contemporary artists push the boundaries of traditional materials. From steel and glass installations to mixed media compositions, explore how material choices shape artistic expression.",
    artists: ["Alex Rivera", "David Thompson"],
    artworks: 8,
    location: "Sculpture Hall & Garden",
  },
  {
    id: 3,
    slug: "intimate-reflections",
    title: "Intimate Reflections",
    status: "Upcoming",
    dates: "November 10, 2024 - February 15, 2025",
    description:
      "A focused exhibition of contemporary portraiture and personal narratives. These works invite viewers into moments of quiet contemplation and human connection, revealing the profound in the everyday.",
    artists: ["Sarah Williams", "Luna Park"],
    artworks: 6,
    location: "Gallery 3",
  },
  {
    id: 4,
    slug: "abstract-futures",
    title: "Abstract Futures",
    status: "Past",
    dates: "September 20 - December 15, 2023",
    description:
      "A groundbreaking exhibition that explored the evolution of abstract art in the digital age. Featured works that bridge traditional abstract expressionism with contemporary digital influences and new media approaches.",
    artists: ["Elena Rodriguez", "Marcus Chen", "David Thompson"],
    artworks: 15,
    location: "Main Gallery, All Floors",
  },
];

const Exhibitions = () => {
  const currentExhibitions = exhibitions.filter(
    (ex) => ex.status === "Current"
  );
  const upcomingExhibitions = exhibitions.filter(
    (ex) => ex.status === "Upcoming"
  );
  const pastExhibitions = exhibitions.filter((ex) => ex.status === "Past");

  const handleExhibitionClick = (exhibitionSlug: string) => {
    window.location.href = `/exhibition/${exhibitionSlug}`;
  };

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
          {/* Current Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Current Exhibitions
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {currentExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="shadow-elegant border-l-4 border-l-gallery-gold cursor-pointer hover:shadow-artwork transition-all duration-300"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {exhibition.title}
                        </CardTitle>
                        <Badge className="bg-gallery-gold text-foreground hover:bg-gallery-gold/90">
                          {exhibition.status}
                        </Badge>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <p className="font-semibold">{exhibition.dates}</p>
                        <p className="text-sm">{exhibition.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {exhibition.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gallery-charcoal mb-2">
                          Featured Artists
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exhibition.artists.join(", ")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gallery-charcoal mb-2">
                          Artworks
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exhibition.artworks} pieces on display
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Upcoming Exhibitions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="shadow-elegant cursor-pointer hover:shadow-artwork transition-all duration-300"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">
                        {exhibition.title}
                      </CardTitle>
                      <Badge variant="outline">{exhibition.status}</Badge>
                    </div>
                    <p className="text-muted-foreground font-semibold">
                      {exhibition.dates}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exhibition.location}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {exhibition.description}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gallery-charcoal">
                          Artists:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {exhibition.artists.join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gallery-charcoal">
                          Works:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {exhibition.artworks} pieces
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Past Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Past Exhibitions
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {pastExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="shadow-elegant opacity-90 cursor-pointer hover:shadow-artwork hover:opacity-100 transition-all duration-300"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {exhibition.title}
                        </CardTitle>
                        <Badge variant="secondary">{exhibition.status}</Badge>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <p className="font-semibold">{exhibition.dates}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {exhibition.description}
                    </p>
                  </CardContent>
                </Card>
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
