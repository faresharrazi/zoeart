import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
} from "lucide-react";

// Import image assets
import abstractArt1 from "@/assets/artwork-abstract-1.jpg";
import abstractArt2 from "@/assets/artwork-abstract-2.jpg";
import geometricArt1 from "@/assets/artwork-geometric-1.jpg";
import landscapeArt1 from "@/assets/artwork-landscape-1.jpg";
import portraitArt1 from "@/assets/artwork-portrait-1.jpg";
import sculptureArt1 from "@/assets/artwork-sculpture-1.jpg";

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
    curator: "Dr. Sarah Chen",
    featuredImage: "/artwork-abstract-1.jpg",
    galleryImages: [abstractArt1, abstractArt2, geometricArt1, landscapeArt1],
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
    curator: "Alex Martinez",
    featuredImage: "/artwork-sculpture-1.jpg",
    galleryImages: [sculptureArt1, geometricArt1, landscapeArt1],
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
    curator: "Elena Rodriguez",
    featuredImage: "/artwork-portrait-1.jpg",
    galleryImages: [
      abstractArt1,
      abstractArt2,
      geometricArt1,
      landscapeArt1,
      portraitArt1,
    ],
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
    curator: "Dr. Michael Torres",
    featuredImage: "/artwork-geometric-1.jpg",
    galleryImages: [
      portraitArt1,
      abstractArt1,
      landscapeArt1,
      geometricArt1,
      sculptureArt1,
      abstractArt2,
    ],
    call_for_artists: false,
    cta_link: "",
  },
];

const ExhibitionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const exhibition = exhibitions.find((e) => e.slug === slug);

  if (!exhibition) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Exhibition Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The exhibition you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/exhibitions")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exhibitions
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current":
        return "!bg-theme-primary !text-white";
      case "Upcoming":
        return "!bg-theme-primary !text-white";
      case "Past":
        return "!bg-theme-text-muted !text-white";
      default:
        return "!bg-theme-primary !text-white";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${
              exhibition.featuredImage || "/src/assets/artwork-abstract-1.jpg"
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        <div className="container mx-auto px-6 relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate("/exhibitions")}
            className="mb-8 border-white/80 text-white bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exhibitions
          </Button>

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="text-white">
              <div className="flex items-center gap-4 mb-6">
                <Badge
                  className={`${getStatusColor(
                    exhibition.status
                  )} text-lg px-4 py-2`}
                >
                  {exhibition.status}
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                {exhibition.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-white" />
                    <span className="text-xl text-white">
                      {exhibition.dates}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-white" />
                    <span className="text-xl text-white">
                      {exhibition.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-white" />
                    <span className="text-xl text-white">
                      Curated by {exhibition.curator}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="w-6 h-6 text-white" />
                    <span className="text-xl text-white">
                      {exhibition.artworks} artworks
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-white" />
                    <span className="text-xl text-white">
                      {exhibition.artists.length} artists
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xl text-white/95 leading-relaxed max-w-4xl mb-8 drop-shadow-md">
                {exhibition.description}
              </p>

              {exhibition.call_for_artists && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="default"
                    className="font-semibold px-8 py-3 text-lg shadow-lg"
                    onClick={() => window.open(exhibition.cta_link, "_blank")}
                  >
                    Join as an Artist
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Featured Artists */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Featured Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exhibition.artists.map((artist, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-palette-medium-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {artist}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Contributing artist
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exhibition Info */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Exhibition Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-palette-medium-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Duration
                      </h3>
                      <p className="text-muted-foreground">
                        {exhibition.dates}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-palette-medium-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Location
                      </h3>
                      <p className="text-muted-foreground">
                        {exhibition.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-palette-medium-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Curator
                      </h3>
                      <p className="text-muted-foreground">
                        {exhibition.curator}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-palette-medium-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Artworks
                      </h3>
                      <p className="text-muted-foreground">
                        {exhibition.artworks} pieces on display
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <ExhibitionGallery
        title={`${exhibition.title} Gallery`}
        images={exhibition.galleryImages || []}
      />

      <Footer />
    </div>
  );
};

export default ExhibitionDetail;
