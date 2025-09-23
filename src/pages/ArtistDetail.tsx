import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ArtworkCard from "@/components/ArtworkCard";
import { ArrowLeft, Instagram, Globe, Mail } from "lucide-react";

// Import artist profile images
import elenaProfileImage from "@/assets/artist-elena-rodriguez.jpg";
import marcusProfileImage from "@/assets/artist-marcus-chen.jpg";
import sarahProfileImage from "@/assets/artist-sarah-williams.jpg";
import davidProfileImage from "@/assets/artist-david-thompson.jpg";
import lunaProfileImage from "@/assets/artist-luna-park.jpg";
import alexProfileImage from "@/assets/artist-alex-rivera.jpg";

// Import artwork images
import abstractArt1 from "@/assets/artwork-abstract-1.jpg";
import geometricArt1 from "@/assets/artwork-geometric-1.jpg";
import portraitArt1 from "@/assets/artwork-portrait-1.jpg";
import abstractArt2 from "@/assets/artwork-abstract-2.jpg";
import landscapeArt1 from "@/assets/artwork-landscape-1.jpg";
import sculptureArt1 from "@/assets/artwork-sculpture-1.jpg";

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
    gallery: [
      {
        title: "Fluid Dynamics",
        year: 2024,
        medium: "Acrylic on Canvas",
        image: abstractArt1,
        slug: "fluid-dynamics",
        description:
          "An exploration of movement and form through organic shapes that dance across the canvas in harmonious blues and gold.",
      },
      {
        title: "Emotional Currents",
        year: 2023,
        medium: "Mixed Media",
        image: abstractArt2,
        slug: "emotional-currents",
        description:
          "A powerful expression of inner turmoil and peace through bold brushstrokes and vibrant color combinations.",
      },
    ],
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
    gallery: [
      {
        title: "Intersection",
        year: 2023,
        medium: "Mixed Media",
        image: geometricArt1,
        slug: "intersection",
        description:
          "A minimalist composition examining the relationship between structure and space in contemporary urban environments.",
      },
      {
        title: "Geometric Harmony",
        year: 2024,
        medium: "Acrylic on Canvas",
        image: abstractArt1,
        slug: "geometric-harmony",
        description:
          "An exploration of balance and proportion through precise geometric forms and subtle color relationships.",
      },
    ],
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
    gallery: [
      {
        title: "Silent Contemplation",
        year: 2024,
        medium: "Oil on Canvas",
        image: portraitArt1,
        slug: "silent-contemplation",
        description:
          "A powerful portrait capturing the quiet strength and introspective nature of the human spirit.",
      },
      {
        title: "Inner Light",
        year: 2023,
        medium: "Oil on Canvas",
        image: portraitArt1,
        slug: "inner-light",
        description:
          "A contemporary portrait exploring the interplay of light and shadow in human expression.",
      },
    ],
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
    gallery: [
      {
        title: "Earth Rhythms",
        year: 2023,
        medium: "Acrylic on Canvas",
        image: abstractArt2,
        slug: "earth-rhythms",
        description:
          "Bold brushstrokes and earth tones create a dynamic composition celebrating the raw energy of nature.",
      },
      {
        title: "Natural Forces",
        year: 2024,
        medium: "Oil on Canvas",
        image: landscapeArt1,
        slug: "natural-forces",
        description:
          "An abstract interpretation of natural landscapes through expressive color and movement.",
      },
    ],
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
    gallery: [
      {
        title: "Mountain Dreams",
        year: 2024,
        medium: "Oil on Canvas",
        image: landscapeArt1,
        slug: "mountain-dreams",
        description:
          "A contemporary interpretation of natural landscapes, blending realism with stylized forms and golden highlights.",
      },
      {
        title: "Urban Nature",
        year: 2023,
        medium: "Mixed Media",
        image: landscapeArt1,
        slug: "urban-nature",
        description:
          "Exploring the intersection of urban environments and natural beauty through contemporary landscape painting.",
      },
    ],
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
    gallery: [
      {
        title: "Modern Forms",
        year: 2024,
        medium: "Steel & Glass Installation",
        image: sculptureArt1,
        slug: "modern-forms",
        description:
          "An innovative sculptural piece that challenges perception through the interplay of light, metal, and transparency.",
      },
      {
        title: "Spatial Dynamics",
        year: 2023,
        medium: "Mixed Media Installation",
        image: sculptureArt1,
        slug: "spatial-dynamics",
        description:
          "A large-scale installation exploring the relationship between space, form, and viewer interaction.",
      },
    ],
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

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              <div className="lg:w-1/3">
                <Avatar className="w-48 h-48 ring-4 ring-palette-medium-blue/20 mx-auto lg:mx-0">
                  <AvatarImage
                    src={artist.profileImage}
                    alt={artist.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-palette-medium-blue/10 text-palette-medium-blue font-semibold text-4xl">
                    {artist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="lg:w-2/3 text-white">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {artist.name}
                </h1>
                <p className="text-2xl text-white font-semibold mb-6 drop-shadow-md">
                  {artist.specialty}
                </p>
                <p className="text-xl text-white/95 leading-relaxed mb-8 drop-shadow-md">
                  {artist.bio}
                </p>

                {/* Social Media Icons */}
                <div className="flex flex-wrap gap-2">
                  {artist.socialMedia.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                      onClick={() =>
                        window.open(artist.socialMedia.instagram, "_blank")
                      }
                    >
                      <Instagram className="w-3 h-3" />
                    </Button>
                  )}
                  {artist.socialMedia.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                      onClick={() =>
                        window.open(artist.socialMedia.website, "_blank")
                      }
                    >
                      <Globe className="w-3 h-3" />
                    </Button>
                  )}
                  {artist.socialMedia.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm"
                      onClick={() =>
                        window.open(
                          `mailto:${artist.socialMedia.email}`,
                          "_blank"
                        )
                      }
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Gallery Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            {artist.name}'s Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artist.gallery.map((artwork, index) => (
              <ArtworkCard
                key={index}
                title={artwork.title}
                artist={artist.name}
                year={artwork.year}
                medium={artwork.medium}
                image={artwork.image}
                description={artwork.description}
                slug={artwork.slug}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistDetail;
