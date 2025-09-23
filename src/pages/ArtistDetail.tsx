import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Instagram,
  Twitter,
  Globe,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";

// Import artist profile images
import elenaProfileImage from "@/assets/artist-elena-rodriguez.jpg";
import marcusProfileImage from "@/assets/artist-marcus-chen.jpg";
import sarahProfileImage from "@/assets/artist-sarah-williams.jpg";
import davidProfileImage from "@/assets/artist-david-thompson.jpg";
import lunaProfileImage from "@/assets/artist-luna-park.jpg";
import alexProfileImage from "@/assets/artist-alex-rivera.jpg";

const artists = [
  {
    id: 1,
    name: "Elena Rodriguez",
    slug: "elena-rodriguez",
    profileImage: elenaProfileImage,
    specialty: "Abstract Expressionism",
    bio: "Elena Rodriguez is a contemporary abstract artist whose work explores the intersection of emotion and movement. Born in Barcelona, she has exhibited internationally and is known for her dynamic use of color and form.",
    artworks: ["Fluid Dynamics"],
    education: "MFA Fine Arts, Barcelona Academy of Art",
    exhibitions:
      "Solo: Gallery Modern (2023), Group: Contemporary Visions (2024)",
    socialMedia: {
      instagram: "https://instagram.com/elenarodriguezart",
      twitter: "https://twitter.com/elenarodriguezart",
      website: "https://elenarodriguezart.com",
      email: "elena@elenarodriguezart.com",
    },
  },
  {
    id: 2,
    name: "Marcus Chen",
    slug: "marcus-chen",
    profileImage: marcusProfileImage,
    specialty: "Geometric Minimalism",
    bio: "Marcus Chen creates minimalist works that examine the relationship between structure and space. His precise geometric compositions have been featured in major galleries across Asia and Europe.",
    artworks: ["Intersection"],
    education: "BFA Visual Arts, Central Saint Martins",
    exhibitions: "Solo: White Cube London (2023), Venice Biennale (2024)",
    socialMedia: {
      instagram: "https://instagram.com/marcuschenart",
      website: "https://marcuschenart.com",
      email: "hello@marcuschenart.com",
    },
  },
  {
    id: 3,
    name: "Sarah Williams",
    slug: "sarah-williams",
    profileImage: sarahProfileImage,
    specialty: "Contemporary Portraiture",
    bio: "Sarah Williams is renowned for her deeply psychological portraits that capture the complexity of human emotion. Her work bridges traditional portraiture with contemporary artistic expression.",
    artworks: ["Silent Contemplation"],
    education: "MFA Painting, Yale School of Art",
    exhibitions: "Solo: Metropolitan Museum (2023), Whitney Biennial (2024)",
    socialMedia: {
      instagram: "https://instagram.com/sarahwilliamsart",
      twitter: "https://twitter.com/sarahwilliamsart",
      website: "https://sarahwilliamsportrait.com",
      email: "sarah@sarahwilliamsportrait.com",
    },
  },
  {
    id: 4,
    name: "David Thompson",
    slug: "david-thompson",
    profileImage: davidProfileImage,
    specialty: "Abstract Landscape",
    bio: "David Thompson's abstract landscapes celebrate the raw energy of natural forms. His bold brushwork and earth-tone palette create compositions that are both powerful and meditative.",
    artworks: ["Earth Rhythms"],
    education: "BFA Landscape Painting, Rhode Island School of Design",
    exhibitions:
      "Solo: National Gallery (2023), Group: Nature Reimagined (2024)",
    socialMedia: {
      instagram: "https://instagram.com/davidthompsonart",
      website: "https://davidthompsonlandscapes.com",
    },
  },
  {
    id: 5,
    name: "Luna Park",
    slug: "luna-park",
    profileImage: lunaProfileImage,
    specialty: "Contemporary Landscape",
    bio: "Luna Park reimagines traditional landscape painting for the contemporary world. Her stylized interpretations blend realism with modern artistic sensibilities.",
    artworks: ["Mountain Dreams"],
    education: "MFA Contemporary Art, California Institute of the Arts",
    exhibitions: "Solo: LACMA (2023), Group: New Landscapes (2024)",
    socialMedia: {
      instagram: "https://instagram.com/lunaparkart",
      twitter: "https://twitter.com/lunaparkart",
      website: "https://lunaparkart.com",
      email: "luna@lunaparkart.com",
    },
  },
  {
    id: 6,
    name: "Alex Rivera",
    slug: "alex-rivera",
    profileImage: alexProfileImage,
    specialty: "Sculptural Installation",
    bio: "Alex Rivera pushes the boundaries of sculptural art through innovative use of materials and space. Their installations challenge viewers' perceptions through light, form, and transparency.",
    artworks: ["Modern Forms"],
    education: "MFA Sculpture, Parsons School of Design",
    exhibitions: "Solo: Guggenheim (2024), Group: Material Explorations (2024)",
    socialMedia: {
      instagram: "https://instagram.com/alexriverasculpture",
      website: "https://alexriverasculpture.com",
      email: "alex@alexriverasculpture.com",
    },
  },
];

const ArtistDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const artist = artists.find((a) => a.slug === slug);

  if (!artist) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Artist Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The artist you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/artists")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <Button
            variant="outline"
            onClick={() => navigate("/artists")}
            className="mb-8 border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Button>

          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="lg:w-1/3">
              <Avatar className="w-48 h-48 ring-4 ring-gallery-gold/20 mx-auto lg:mx-0">
                <AvatarImage
                  src={artist.profileImage}
                  alt={artist.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gallery-gold/10 text-gallery-gold font-semibold text-4xl">
                  {artist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="lg:w-2/3 text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {artist.name}
              </h1>
              <p className="text-2xl text-gallery-gold font-semibold mb-6">
                {artist.specialty}
              </p>
              <p className="text-xl text-gray-200 leading-relaxed mb-8">
                {artist.bio}
              </p>

              {/* Social Media Links */}
              <div className="flex flex-wrap gap-4">
                {artist.socialMedia.instagram && (
                  <Button
                    variant="outline"
                    className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                    onClick={() =>
                      window.open(artist.socialMedia.instagram, "_blank")
                    }
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                )}
                {artist.socialMedia.twitter && (
                  <Button
                    variant="outline"
                    className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                    onClick={() =>
                      window.open(artist.socialMedia.twitter, "_blank")
                    }
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                )}
                {artist.socialMedia.website && (
                  <Button
                    variant="outline"
                    className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                    onClick={() =>
                      window.open(artist.socialMedia.website, "_blank")
                    }
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
                {artist.socialMedia.email && (
                  <Button
                    variant="outline"
                    className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                    onClick={() =>
                      window.open(
                        `mailto:${artist.socialMedia.email}`,
                        "_blank"
                      )
                    }
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Featured Works */}
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Featured Works
                </h2>
                <div className="space-y-4">
                  {artist.artworks.map((artwork, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gallery-gold/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gallery-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {artwork}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Featured in our collection
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education & Exhibitions */}
            <div className="space-y-8">
              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Education
                  </h2>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gallery-gold/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-gallery-gold" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {artist.education}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Recent Exhibitions
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gallery-gold/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-gallery-gold" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {artist.exhibitions}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistDetail;
