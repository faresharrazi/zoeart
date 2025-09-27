import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Image } from "lucide-react";
import ArtworkCard from "./ArtworkCard";
import { apiClient } from "@/lib/apiClient";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist_id: number;
  artist_name: string;
  year: number;
  medium: string;
  size: string;
  description: string;
  images: string[];
  isVisible: boolean;
}

interface ArtworkListProps {
  artworks: Artwork[];
  onEdit: (artwork: Artwork) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ArtworkList = ({
  artworks,
  onEdit,
  onAdd,
  onRefresh,
  onDelete,
  onToggleVisibility,
}: ArtworkListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.medium.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArtist =
        artistFilter === "all" || artwork.artist_id.toString() === artistFilter;

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && artwork.isVisible) ||
        (visibilityFilter === "hidden" && !artwork.isVisible);

      const matchesYear =
        yearFilter === "all" || artwork.year.toString() === yearFilter;

      return matchesSearch && matchesArtist && matchesVisibility && matchesYear;
    });
  }, [artworks, searchTerm, artistFilter, visibilityFilter, yearFilter]);

  const availableArtists = useMemo(() => {
    const uniqueArtists = new Map();
    artworks.forEach((artwork) => {
      if (!uniqueArtists.has(artwork.artist_id)) {
        uniqueArtists.set(artwork.artist_id, {
          id: artwork.artist_id,
          name: artwork.artist_name,
        });
      }
    });
    return Array.from(uniqueArtists.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [artworks]);

  const availableYears = useMemo(() => {
    const years = [...new Set(artworks.map((a) => a.year))].sort(
      (a, b) => b - a
    );
    return years;
  }, [artworks]);

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await apiClient.updateArtwork(parseInt(id), {
        is_visible: isVisible,
      });
      onToggleVisibility(id, isVisible);
      toast({
        title: "Success",
        description: `Artwork ${isVisible ? "shown" : "hidden"} successfully`,
      });
    } catch (error) {
      console.error("Error updating artwork visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update artwork visibility",
        variant: "destructive",
      });
    }
  };

  const visibleCount = artworks.filter((a) => a.isVisible).length;
  const hiddenCount = artworks.filter((a) => !a.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Artwork Management</h2>
          <p className="text-gray-600">
            Manage your art collection and showcase pieces
          </p>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {artworks.length}
          </div>
          <div className="text-sm text-blue-600">Total Artworks</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {visibleCount}
          </div>
          <div className="text-sm text-green-600">Visible</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{hiddenCount}</div>
          <div className="text-sm text-red-600">Hidden</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={artistFilter} onValueChange={setArtistFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Artists</SelectItem>
              {availableArtists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id.toString()}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredArtworks.length} of {artworks.length} artworks
          </p>
          {(searchTerm ||
            artistFilter !== "all" ||
            visibilityFilter !== "all" ||
            yearFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setArtistFilter("all");
                setVisibilityFilter("all");
                setYearFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Image className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No artworks found
            </h3>
            <p className="text-gray-600 mb-4">
              {artworks.length === 0
                ? "Get started by adding your first artwork."
                : "Try adjusting your search or filter criteria."}
            </p>
            {artworks.length === 0 && (
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Artwork
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworkList;
