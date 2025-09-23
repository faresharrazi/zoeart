import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

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
    call_for_artists: true,
    cta_link: "https://forms.google.com/example1",
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
    call_for_artists: false,
    cta_link: "",
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
    call_for_artists: true,
    cta_link: "https://forms.google.com/example3",
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
    call_for_artists: false,
    cta_link: "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gallery-gold/30 overflow-hidden cursor-pointer"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-gallery-gold/20 to-gallery-gold/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gallery-gold text-foreground font-semibold">
                        {exhibition.status}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gallery-gold/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gallery-gold" />
                        </div>
                        <p className="text-sm">Exhibition Image</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gallery-gold transition-colors">
                          {exhibition.title}
                        </h3>
                        <p className="text-sm text-gallery-gold font-medium">
                          Curated by Dr. Sarah Chen
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {exhibition.dates}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {exhibition.location}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {exhibition.description}
                      </p>

                      {exhibition.call_for_artists && (
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-gallery-gold group-hover:text-foreground group-hover:border-gallery-gold transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(exhibition.cta_link, "_blank");
                          }}
                        >
                          Join as an Artist
                        </Button>
                      )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gallery-gold/30 overflow-hidden cursor-pointer"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-gallery-gold/20 to-gallery-gold/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gallery-gold text-foreground font-semibold">
                        {exhibition.status}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gallery-gold/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gallery-gold" />
                        </div>
                        <p className="text-sm">Exhibition Image</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gallery-gold transition-colors">
                          {exhibition.title}
                        </h3>
                        <p className="text-sm text-gallery-gold font-medium">
                          Curated by Dr. Sarah Chen
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {exhibition.dates}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {exhibition.location}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {exhibition.description}
                      </p>

                      {exhibition.call_for_artists && (
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-gallery-gold group-hover:text-foreground group-hover:border-gallery-gold transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(exhibition.cta_link, "_blank");
                          }}
                        >
                          Join as an Artist
                        </Button>
                      )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastExhibitions.map((exhibition, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gallery-gold/30 overflow-hidden cursor-pointer opacity-90 hover:opacity-100"
                  onClick={() => handleExhibitionClick(exhibition.slug)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-gallery-gold/20 to-gallery-gold/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gallery-gold text-foreground font-semibold">
                        {exhibition.status}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gallery-gold/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gallery-gold" />
                        </div>
                        <p className="text-sm">Exhibition Image</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gallery-gold transition-colors">
                          {exhibition.title}
                        </h3>
                        <p className="text-sm text-gallery-gold font-medium">
                          Curated by Dr. Michael Torres
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {exhibition.dates}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {exhibition.location}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {exhibition.description}
                      </p>

                      {exhibition.call_for_artists && (
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-gallery-gold group-hover:text-foreground group-hover:border-gallery-gold transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(exhibition.cta_link, "_blank");
                          }}
                        >
                          Join as an Artist
                        </Button>
                      )}
                    </div>
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
