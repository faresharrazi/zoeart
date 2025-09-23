import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkZoom from "@/components/ArtworkZoom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ZoomIn } from "lucide-react";
import abstractArt1 from "@/assets/artwork-abstract-1.jpg";
import geometricArt1 from "@/assets/artwork-geometric-1.jpg";
import portraitArt1 from "@/assets/artwork-portrait-1.jpg";
import abstractArt2 from "@/assets/artwork-abstract-2.jpg";
import landscapeArt1 from "@/assets/artwork-landscape-1.jpg";
import sculptureArt1 from "@/assets/artwork-sculpture-1.jpg";

const artworksData = {
  "fluid-dynamics": {
    title: "Fluid Dynamics",
    artist: "Elena Rodriguez",
    year: 2024,
    medium: "Acrylic on Canvas",
    dimensions: "48 x 60 inches",
    image: abstractArt1,
    description:
      "Fluid Dynamics represents a profound exploration of movement and organic form, where Rodriguez masterfully captures the essence of natural flow through bold brushstrokes and harmonious color relationships. The piece invites viewers into a world where blues and gold dance across the canvas in perfect synchronization, creating a sense of perpetual motion that speaks to the fundamental forces that shape our natural world.",
    artistBio:
      "Elena Rodriguez is a contemporary abstract artist whose work explores the intersection of emotion and movement. Born in Barcelona, she has exhibited internationally and is known for her dynamic use of color and form.",
    technique:
      "Using traditional acrylic techniques combined with modern color theory, Rodriguez layered translucent glazes to achieve the luminous quality that defines this piece.",
    exhibition: "Currently on display in 'Contemporary Visions 2024'",
    provenance: "Created in the artist's Barcelona studio, 2024",
  },
  intersection: {
    title: "Intersection",
    artist: "Marcus Chen",
    year: 2023,
    medium: "Mixed Media on Panel",
    dimensions: "36 x 36 inches",
    image: geometricArt1,
    description:
      "Intersection examines the precise relationship between structure and negative space in contemporary urban environments. Chen's minimalist approach strips away the unnecessary to reveal essential geometric truths, creating a composition that speaks to both architectural precision and philosophical contemplation about our place within constructed spaces.",
    artistBio:
      "Marcus Chen creates minimalist works that examine the relationship between structure and space. His precise geometric compositions have been featured in major galleries across Asia and Europe.",
    technique:
      "Combining traditional painting with digital precision, Chen uses laser-cut stencils and carefully mixed pigments to achieve perfect geometric harmony.",
    exhibition: "Featured in 'Contemporary Visions 2024'",
    provenance: "Completed in London studio, 2023",
  },
  "silent-contemplation": {
    title: "Silent Contemplation",
    artist: "Sarah Williams",
    year: 2024,
    medium: "Oil on Canvas",
    dimensions: "30 x 40 inches",
    image: portraitArt1,
    description:
      "Silent Contemplation captures a moment of profound introspection, revealing the quiet strength that lies beneath the surface of human experience. Williams' masterful use of light and shadow creates an intimate psychological portrait that invites viewers to pause and reflect on their own inner landscapes and the universal human experience of contemplation.",
    artistBio:
      "Sarah Williams is renowned for her deeply psychological portraits that capture the complexity of human emotion. Her work bridges traditional portraiture with contemporary artistic expression.",
    technique:
      "Executed in classical oil painting techniques with contemporary psychological insights, using multiple glazing layers to achieve luminous skin tones.",
    exhibition: "Centerpiece of 'Contemporary Visions 2024'",
    provenance: "Painted in New Haven studio, 2024",
  },
  "earth-rhythms": {
    title: "Earth Rhythms",
    artist: "David Thompson",
    year: 2023,
    medium: "Acrylic on Canvas",
    dimensions: "42 x 54 inches",
    image: abstractArt2,
    description:
      "Earth Rhythms celebrates the raw, untamed energy of natural forces through bold gestural brushwork and an earth-tone palette that speaks to our primal connection with the land. Thompson's dynamic composition creates a visual symphony that echoes the geological processes that shape our planet, inviting viewers to reconnect with the fundamental rhythms of the natural world.",
    artistBio:
      "David Thompson's abstract landscapes celebrate the raw energy of natural forms. His bold brushwork and earth-tone palette create compositions that are both powerful and meditative.",
    technique:
      "Applied with palette knives and brushes in alla prima style, capturing the spontaneous energy of natural creation processes.",
    exhibition: "On display in 'Contemporary Visions 2024'",
    provenance: "Created en plein air in Colorado, 2023",
  },
  "mountain-dreams": {
    title: "Mountain Dreams",
    artist: "Luna Park",
    year: 2024,
    medium: "Oil on Canvas",
    dimensions: "40 x 50 inches",
    image: landscapeArt1,
    description:
      "Mountain Dreams offers a contemporary reinterpretation of landscape painting, where Park masterfully blends realistic representation with stylized interpretation. The golden highlights that accent the composition speak to the transformative power of light and the sublime experience of witnessing natural grandeur, creating a work that is both grounded in reality and elevated by artistic vision.",
    artistBio:
      "Luna Park reimagines traditional landscape painting for the contemporary world. Her stylized interpretations blend realism with modern artistic sensibilities.",
    technique:
      "Combining traditional oil painting methods with contemporary color relationships, achieving a balance between realism and stylization.",
    exhibition: "Featured in upcoming 'Intimate Reflections' exhibition",
    provenance: "Inspired by Sierra Nevada landscapes, painted in studio 2024",
  },
  "modern-forms": {
    title: "Modern Forms",
    artist: "Alex Rivera",
    year: 2024,
    medium: "Steel & Glass Installation",
    dimensions: "72 x 48 x 24 inches",
    image: sculptureArt1,
    description:
      "Modern Forms challenges traditional perceptions of sculptural space through the innovative interplay of steel and glass elements. Rivera's installation creates a dialogue between transparency and opacity, weight and lightness, inviting viewers to walk around and through the work to discover how changing perspectives alter the entire visual experience of the piece.",
    artistBio:
      "Alex Rivera pushes the boundaries of sculptural art through innovative use of materials and space. Their installations challenge viewers' perceptions through light, form, and transparency.",
    technique:
      "Fabricated using industrial materials and techniques, with custom-blown glass elements integrated into precision-cut steel framework.",
    exhibition: "Will be featured in 'Material Explorations' exhibition",
    provenance: "Fabricated in Brooklyn metalworking studio, 2024",
  },
};

const ArtworkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const artwork = slug ? artworksData[slug as keyof typeof artworksData] : null;

  if (!artwork) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="hover:bg-theme-primary hover:text-theme-primary-text hover:border-theme-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Artwork Image */}
            <div className="space-y-6">
              <Card className="shadow-artwork overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={artwork.image}
                    alt={`${artwork.title} by ${artwork.artist}`}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setIsZoomOpen(true)}
                  />
                  {/* Zoom Overlay */}
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center cursor-zoom-in"
                    onClick={() => setIsZoomOpen(true)}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Zoom Instructions */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click the image to view in full detail with zoom controls
                </p>
              </div>
            </div>

            {/* Artwork Details */}
            <div className="space-y-8">
              {/* Title & Basic Info */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {artwork.title}
                </h1>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold text-theme-primary">
                    {artwork.artist}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {artwork.year} • {artwork.medium}
                  </p>
                  <p className="text-muted-foreground">{artwork.dimensions}</p>
                </div>
              </div>

              {/* Description */}
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    About This Work
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {artwork.description}
                  </p>
                </CardContent>
              </Card>

              {/* Artist Bio */}
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    About the Artist
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {artwork.artistBio}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Zoom Modal */}
      {artwork && (
        <ArtworkZoom
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={artwork.image}
          title={artwork.title}
          artist={artwork.artist}
        />
      )}

      <Footer />
    </div>
  );
};

export default ArtworkDetail;
