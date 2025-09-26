import { useState, useMemo, useEffect } from "react";
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
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";

const Collection = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { pageData } = usePageDataFromDB();

  // Check if page is visible
  const isPageVisible = pageData.gallery?.isVisible;

  // If page is not visible, redirect to home
  useEffect(() => {
    if (pageData && isPageVisible === false) {
      window.location.href = "/";
    }
  }, [pageData, isPageVisible]);

  // Don't render anything if page is not visible
  if (pageData && isPageVisible === false) {
    return null;
  }

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await apiClient.getArtworks();
        setArtworks(data as any[]);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Get unique categories and artists for filters
  const categories = useMemo(() => {
    const cats = [...new Set(artworks.map((artwork) => artwork.category))];
    return cats.filter(Boolean);
  }, [artworks]);

  const artists = useMemo(() => {
    const arts = [...new Set(artworks.map((artwork) => artwork.artist_name))];
    return arts.filter(Boolean);
  }, [artworks]);

  // Filter artworks based on search and filters
  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || artwork.category === selectedCategory;

      const matchesArtist =
        selectedArtist === "all" || artwork.artist_name === selectedArtist;

      return matchesSearch && matchesCategory && matchesArtist;
    });
  }, [artworks, searchTerm, selectedCategory, selectedArtist]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedArtist("all");
  };

  const handleArtworkClick = (artworkSlug: string) => {
    window.location.href = `/artwork/${artworkSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto my-24">
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
                {pageData.gallery?.title || "Gallery"}
              </h1>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">
                  Loading collection...
                </span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto my-24">
            <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
              {pageData.gallery?.title || "Gallery"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.gallery?.description || "Explore our collection"}
            </p>
          </div>
        </div>
      </section>

      {/* Only show content sections if there are artworks */}
      {artworks.length > 0 && (
        <>
          {/* Search and Filter Section */}
          <section className="py-12 bg-theme-background">
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" />
                  <Input
                    type="text"
                    placeholder="Search artworks, artists, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg border-2 border-theme-border rounded-xl focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 border-2 border-theme-border hover:border-theme-primary"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>

                  {(searchTerm ||
                    selectedCategory !== "all" ||
                    selectedArtist !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-theme-text-muted hover:text-theme-primary"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-theme-card rounded-xl border border-theme-border">
                    <div>
                      <label className="block text-sm  text-theme-text-primary mb-2">
                        Category
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="border-2 border-theme-border">
                          <SelectValue placeholder="Select category" />
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
                    </div>

                    <div>
                      <label className="block text-sm  text-theme-text-primary mb-2">
                        Artist
                      </label>
                      <Select
                        value={selectedArtist}
                        onValueChange={setSelectedArtist}
                      >
                        <SelectTrigger className="border-2 border-theme-border">
                          <SelectValue placeholder="Select artist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Artists</SelectItem>
                          {artists.map((artist) => (
                            <SelectItem key={artist} value={artist}>
                              {artist}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="mb-8">
                  <p className="text-theme-text-muted">
                    Showing {filteredArtworks.length} of {artworks.length}{" "}
                    artworks
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Artworks Grid */}
          <section className="pb-20 bg-theme-background">
            <div className="container mx-auto px-6">
              {filteredArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-theme-text-muted text-lg">
                    No artworks found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      onArtworkClick={handleArtworkClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Collection;
