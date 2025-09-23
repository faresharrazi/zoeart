import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

// Mock data for exhibitions - in a real app, this would come from your database
const upcomingExhibitions = [
  {
    id: 1,
    title: "Contemporary Visions",
    curator: "Dr. Sarah Chen",
    startDate: "2024-03-15",
    endDate: "2024-05-15",
    location: "Main Gallery",
    description:
      "An exploration of contemporary art through the lens of emerging and established artists, showcasing innovative techniques and bold perspectives.",
    featuredImage: "/api/placeholder/400/300",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Digital Realms",
    curator: "Alex Martinez",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    location: "Digital Gallery",
    description:
      "A groundbreaking exhibition featuring digital art, interactive installations, and virtual reality experiences that push the boundaries of traditional art.",
    featuredImage: "/api/placeholder/400/300",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Nature's Canvas",
    curator: "Elena Rodriguez",
    startDate: "2024-05-10",
    endDate: "2024-07-10",
    location: "Garden Pavilion",
    description:
      "Celebrating the intersection of art and nature through environmental installations, sustainable materials, and eco-conscious artistic practices.",
    featuredImage: "/api/placeholder/400/300",
    status: "upcoming",
  },
];

const RecentExhibitions = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExhibitionClick = (exhibitionId: number) => {
    window.location.href = `/exhibition/${exhibitionId}`;
  };

  return (
    <section id="recent-exhibitions" className="py-20 bg-gallery-light-grey">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Upcoming <span className="text-gallery-gold">Exhibitions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our upcoming exhibitions featuring contemporary artists and
            innovative artistic expressions. Join us for these exciting
            showcases of creativity and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingExhibitions.map((exhibition) => (
            <Card
              key={exhibition.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gallery-gold/30 overflow-hidden cursor-pointer"
              onClick={() => handleExhibitionClick(exhibition.id)}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gallery-gold/20 to-gallery-gold/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gallery-gold text-foreground font-semibold">
                    Upcoming
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
                      Curated by {exhibition.curator}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(exhibition.startDate)} -{" "}
                      {formatDate(exhibition.endDate)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {exhibition.location}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {exhibition.description}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-gallery-gold group-hover:text-foreground group-hover:border-gallery-gold transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExhibitionClick(exhibition.id);
                    }}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/exhibitions"
            className="inline-block bg-foreground text-background hover:bg-gallery-charcoal transition-smooth px-8 py-3 text-lg font-semibold"
          >
            View All Exhibitions
          </a>
        </div>
      </div>
    </section>
  );
};

export default RecentExhibitions;
