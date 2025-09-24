import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { getPageSettings } from "@/lib/pageSettings";
import abstractArt1 from "@/assets/artwork-abstract-1.jpg";
import geometricArt1 from "@/assets/artwork-geometric-1.jpg";
import portraitArt1 from "@/assets/artwork-portrait-1.jpg";
import abstractArt2 from "@/assets/artwork-abstract-2.jpg";
import landscapeArt1 from "@/assets/artwork-landscape-1.jpg";
import sculptureArt1 from "@/assets/artwork-sculpture-1.jpg";

const allArtworks = [
  {
    title: "Fluid Dynamics",
    artist: "Elena Rodriguez",
    year: 2024,
    medium: "Acrylic on Canvas",
    image: abstractArt1,
    slug: "fluid-dynamics",
    description:
      "An exploration of movement and form through organic shapes that dance across the canvas in harmonious blues and gold.",
    category: "Abstract",
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
    category: "Geometric",
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
    category: "Portrait",
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
    category: "Abstract",
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
    category: "Landscape",
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
    category: "Sculpture",
  },
];

const Collection = () => {
  const pageSettings = getPageSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  // Get unique values for filters
  const mediums = [...new Set(allArtworks.map((artwork) => artwork.medium))];
  const years = [...new Set(allArtworks.map((artwork) => artwork.year))].sort(
    (a, b) => b - a
  );
  const categories = [
    ...new Set(allArtworks.map((artwork) => artwork.category)),
  ];

  // Filter and sort artworks
  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = allArtworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMedium =
        selectedMedium === "all" || artwork.medium === selectedMedium;
      const matchesYear =
        selectedYear === "all" || artwork.year.toString() === selectedYear;
      const matchesCategory =
        selectedCategory === "all" || artwork.category === selectedCategory;

      return matchesSearch && matchesMedium && matchesYear && matchesCategory;
    });

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedMedium, selectedYear, selectedCategory, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMedium("all");
    setSelectedYear("all");
    setSelectedCategory("all");
    setSortBy("title");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedMedium !== "all" ||
    selectedYear !== "all" ||
    selectedCategory !== "all";

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/src/assets/artwork-portrait-1.jpg')`,
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {pageSettings.gallery.title}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageSettings.gallery.description}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gallery-light-grey border-b border-gallery-medium-grey">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search artworks, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="text-muted-foreground w-4 h-4" />
                <span className="text-sm font-medium text-muted-foreground">
                  Filter by:
                </span>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mediums</SelectItem>
                  {mediums.map((medium) => (
                    <SelectItem key={medium} value={medium}>
                      {medium}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="artist">Artist A-Z</SelectItem>
                  <SelectItem value="year-desc">Newest First</SelectItem>
                  <SelectItem value="year-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedArtworks.length} of {allArtworks.length}{" "}
            artworks
            {hasActiveFilters && (
              <span className="ml-2 text-white">• Filters applied</span>
            )}
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-20 bg-gallery-light-grey">
        <div className="container mx-auto px-6">
          {filteredAndSortedArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedArtworks.map((artwork, index) => (
                <ArtworkCard key={index} {...artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-muted-foreground mb-4">
                No artworks found
              </h3>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search terms or filters to find more
                artworks.
              </p>
              <Button onClick={clearAllFilters} variant="default">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collection;
