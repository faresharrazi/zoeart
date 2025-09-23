import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, Mail, Globe } from "lucide-react";

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

const Artists = () => {
  const handleArtistClick = (artistSlug: string) => {
    window.location.href = `/artist/${artistSlug}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/src/assets/gallery-hero3.jpg')` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Featured <span className="text-white">Artists</span>
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Meet the visionary artists whose works define our contemporary
              collection. Each brings a unique perspective and mastery of their
              craft to create pieces that inspire and provoke.
            </p>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-20 bg-theme-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {artists.map((artist, index) => (
              <Card
                key={index}
                className="shadow-elegant hover:shadow-artwork transition-all duration-300 cursor-pointer group"
                onClick={() => handleArtistClick(artist.slug)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6 mb-6">
                    <Avatar className="w-20 h-20 ring-2 ring-theme-primary/20">
                      <AvatarImage
                        src={artist.profileImage}
                        alt={artist.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-theme-primary/10 text-theme-primary font-semibold text-lg">
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {artist.name}
                      </h3>
                      <p className="text-theme-primary font-semibold text-lg">
                        {artist.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {artist.bio}
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex flex-wrap gap-2">
                      {artist.socialMedia.instagram && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.instagram, "_blank");
                          }}
                        >
                          <Instagram className="w-3 h-3" />
                        </Button>
                      )}
                      {artist.socialMedia.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.website, "_blank");
                          }}
                        >
                          <Globe className="w-3 h-3" />
                        </Button>
                      )}
                      {artist.socialMedia.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `mailto:${artist.socialMedia.email}`,
                              "_blank"
                            );
                          }}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Artists;
