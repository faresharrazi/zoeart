import { useState } from "react";
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
import { apiClient } from "@/lib/apiClient";
import { Plus, Search, Filter, User } from "lucide-react";
import ArtistCard from "./ArtistCard";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  profileImage: string;
  socialMedia: Record<string, string>;
  assignedArtworks: string[];
  isVisible: boolean;
}

interface ArtistListProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ArtistList = ({ artists, onEdit, onAdd, onRefresh, onToggleVisibility }: ArtistListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteArtist(parseInt(id));
      onRefresh();
      toast({
        title: "Success",
        description: "Artist deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast({
        title: "Error",
        description: "Failed to delete artist",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await apiClient.updateArtist(parseInt(id), {
        is_visible: isVisible,
      });
      onToggleVisibility(id, isVisible);
      toast({
        title: "Success",
        description: `Artist ${isVisible ? "shown" : "hidden"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling artist visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update artist visibility",
        variant: "destructive",
      });
    }
  };

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && artist.isVisible) ||
      (visibilityFilter === "hidden" && !artist.isVisible);

    const matchesSpecialty =
      specialtyFilter === "all" ||
      artist.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());

    return matchesSearch && matchesVisibility && matchesSpecialty;
  });

  const visibleCount = artists.filter((a) => a.isVisible).length;
  const hiddenCount = artists.filter((a) => !a.isVisible).length;
  const specialties = [
    ...new Set(artists.map((a) => a.specialty).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Artist Management</h2>
          <p className="text-gray-600">
            Manage your artists and their profiles
          </p>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Artist
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {artists.length}
          </div>
          <div className="text-sm text-blue-600">Total Artists</div>
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
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
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

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
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
            Showing {filteredArtists.length} of {artists.length} artists
          </p>
          {(searchTerm ||
            visibilityFilter !== "all" ||
            specialtyFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setVisibilityFilter("all");
                setSpecialtyFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No artists found
            </h3>
            <p className="text-gray-600 mb-4">
              {artists.length === 0
                ? "Get started by adding your first artist."
                : "Try adjusting your search or filter criteria."}
            </p>
            {artists.length === 0 && (
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Artist
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
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

export default ArtistList;
