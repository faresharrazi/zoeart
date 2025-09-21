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
import { Search, Filter, X, Loader2 } from "lucide-react";
import { usePublicArtworks } from "@/hooks/use-public-artworks";

const Collection = () => {
  const { artworks, loading, error } = usePublicArtworks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  // Convert database format to component format
  const formattedArtworks = useMemo(() => {
    return artworks.map((artwork) => ({
      title: artwork.title,
      artist: artwork.artists?.name || "Unknown Artist",
      year: artwork.year,
      medium: artwork.medium,
      image: artwork.image || "/placeholder-artwork.jpg",
      slug: artwork.slug,
      description: artwork.description || "",
      category: artwork.medium, // Using medium as category for now
    }));
  }, [artworks]);

  // Get unique values for filters
  const mediums =
    formattedArtworks.length > 0
      ? [
          ...new Set(
            formattedArtworks.map((artwork) => artwork.medium).filter(Boolean)
          ),
        ]
      : [];
  const years =
    formattedArtworks.length > 0
      ? [
          ...new Set(
            formattedArtworks.map((artwork) => artwork.year).filter(Boolean)
          ),
        ].sort((a, b) => b - a)
      : [];
  const categories =
    formattedArtworks.length > 0
      ? [
          ...new Set(
            formattedArtworks.map((artwork) => artwork.category).filter(Boolean)
          ),
        ]
      : [];

  // Filter and sort artworks
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = formattedArtworks.filter((artwork) => {
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
  }, [
    formattedArtworks,
    searchTerm,
    selectedMedium,
    selectedYear,
    selectedCategory,
    sortBy,
  ]);

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Complete <span className="text-gallery-gold">Collection</span>
            </h1>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-16 bg-gradient-hero">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Complete <span className="text-gallery-gold">Collection</span>
            </h1>
            <p className="text-red-400 text-xl">
              Error loading collection: {error}
            </p>
          </div>
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
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Complete <span className="text-gallery-gold">Collection</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Explore our entire collection of contemporary artworks. Use the
            search and filter tools to discover pieces that speak to you.
          </p>
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

              {categories.length > 0 && (
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
                      <SelectItem key={category} value={category || "unknown"}>
                        {category || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {mediums.length > 0 && (
                <Select
                  value={selectedMedium}
                  onValueChange={setSelectedMedium}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mediums</SelectItem>
                    {mediums.map((medium) => (
                      <SelectItem key={medium} value={medium || "unknown"}>
                        {medium || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {years.length > 0 && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem
                        key={year}
                        value={year?.toString() || "unknown"}
                      >
                        {year || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

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
            Showing {filteredAndSortedArtworks.length} of{" "}
            {formattedArtworks.length} artworks
            {hasActiveFilters && (
              <span className="ml-2 text-gallery-gold">• Filters applied</span>
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
              <Button
                onClick={clearAllFilters}
                className="bg-gallery-gold hover:bg-gallery-gold/90 text-foreground"
              >
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
