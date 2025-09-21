import ArtworkCard from "./ArtworkCard";
import abstractArt1 from "@/assets/artwork-abstract-1.jpg";
import geometricArt1 from "@/assets/artwork-geometric-1.jpg";
import portraitArt1 from "@/assets/artwork-portrait-1.jpg";
import abstractArt2 from "@/assets/artwork-abstract-2.jpg";
import landscapeArt1 from "@/assets/artwork-landscape-1.jpg";
import sculptureArt1 from "@/assets/artwork-sculpture-1.jpg";

const artworks = [
  {
    title: "Fluid Dynamics",
    artist: "Elena Rodriguez",
    year: 2024,
    medium: "Acrylic on Canvas",
    image: abstractArt1,
    slug: "fluid-dynamics",
    description:
      "An exploration of movement and form through organic shapes that dance across the canvas in harmonious blues and gold.",
  },
  {
    title: "Intersection",
    artist: "Marcus Chen",
    year: 2023,
    medium: "Mixed Media",
    image: geometricArt1,
    slug: "intersection",
    description:
      "A minimalist composition examining the relationship between structure and space in contemporary urban environments.",
  },
  {
    title: "Silent Contemplation",
    artist: "Sarah Williams",
    year: 2024,
    medium: "Oil on Canvas",
    image: portraitArt1,
    slug: "silent-contemplation",
    description:
      "A powerful portrait capturing the quiet strength and introspective nature of the human spirit.",
  },
  {
    title: "Earth Rhythms",
    artist: "David Thompson",
    year: 2023,
    medium: "Acrylic on Canvas",
    image: abstractArt2,
    slug: "earth-rhythms",
    description:
      "Bold brushstrokes and earth tones create a dynamic composition celebrating the raw energy of nature.",
  },
  {
    title: "Mountain Dreams",
    artist: "Luna Park",
    year: 2024,
    medium: "Oil on Canvas",
    image: landscapeArt1,
    slug: "mountain-dreams",
    description:
      "A contemporary interpretation of natural landscapes, blending realism with stylized forms and golden highlights.",
  },
  {
    title: "Modern Forms",
    artist: "Alex Rivera",
    year: 2024,
    medium: "Steel & Glass Installation",
    image: sculptureArt1,
    slug: "modern-forms",
    description:
      "An innovative sculptural piece that challenges perception through the interplay of light, metal, and transparency.",
  },
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-gallery-light-grey">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Featured <span className="text-gallery-gold">Collection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our curated selection of contemporary artworks from
            talented artists around the world. Each piece tells a unique story
            and offers a window into the creative minds of today's most
            compelling visual artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork, index) => (
            <ArtworkCard key={index} {...artwork} />
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/collection"
            className="inline-block bg-foreground text-background hover:bg-gallery-charcoal transition-smooth px-8 py-3 text-lg font-semibold"
          >
            View Complete Collection
          </a>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
