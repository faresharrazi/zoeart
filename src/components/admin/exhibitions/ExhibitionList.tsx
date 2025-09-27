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
import { Plus, Search, Filter } from "lucide-react";
import ExhibitionCard from "./ExhibitionCard";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "past";
  featuredImage?: string;
  galleryImages: string[];
  assignedArtists: string[];
  assignedArtworks: string[];
  callForArtists?: boolean;
  ctaLink?: string;
  isVisible?: boolean;
}

interface ExhibitionListProps {
  exhibitions: Exhibition[];
  onEdit: (exhibition: Exhibition) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ExhibitionList = ({
  exhibitions,
  onEdit,
  onAdd,
  onRefresh,
  onToggleVisibility,
}: ExhibitionListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteExhibition(parseInt(id));
      onRefresh();
      toast({
        title: "Success",
        description: "Exhibition deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      toast({
        title: "Error",
        description: "Failed to delete exhibition",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await apiClient.toggleExhibitionVisibility(parseInt(id), isVisible);
      onToggleVisibility(id, isVisible);
      toast({
        title: "Success",
        description: `Exhibition ${
          isVisible ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling exhibition visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update exhibition visibility",
        variant: "destructive",
      });
    }
  };

  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesSearch =
      exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.curator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || exhibition.status === statusFilter;

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && exhibition.isVisible) ||
      (visibilityFilter === "hidden" && !exhibition.isVisible);

    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const upcomingCount = exhibitions.filter(
    (e) => e.status === "upcoming"
  ).length;
  const pastCount = exhibitions.filter((e) => e.status === "past").length;
  const visibleCount = exhibitions.filter((e) => e.isVisible).length;
  const hiddenCount = exhibitions.filter((e) => !e.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Exhibition Management</h2>
          <p className="text-gray-600">
            Manage your exhibitions and showcase your art
          </p>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Exhibition
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {upcomingCount}
          </div>
          <div className="text-sm text-blue-600">Upcoming</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{pastCount}</div>
          <div className="text-sm text-gray-600">Past</div>
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
              placeholder="Search exhibitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
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
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredExhibitions.length} of {exhibitions.length}{" "}
            exhibitions
          </p>
          {(searchTerm ||
            statusFilter !== "all" ||
            visibilityFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setVisibilityFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredExhibitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No exhibitions found
            </h3>
            <p className="text-gray-600 mb-4">
              {exhibitions.length === 0
                ? "Get started by creating your first exhibition."
                : "Try adjusting your search or filter criteria."}
            </p>
            {exhibitions.length === 0 && (
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Create Exhibition
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExhibitions.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.id}
                exhibition={exhibition}
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

export default ExhibitionList;
