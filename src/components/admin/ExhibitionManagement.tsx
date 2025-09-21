import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ImageGalleryManager from "./ImageGalleryManager";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Image,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { fileService } from "@/lib/database";

interface Exhibition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  curator: string;
  status: "upcoming" | "past";
  featured_image?: string;
  gallery_images?: string[];
  exhibition_artworks?: any[];
  is_visible: boolean;
}

interface ExhibitionFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  curator: string;
  status: "upcoming" | "past";
  featured_image?: string;
  gallery_images?: string[];
  is_visible?: boolean;
}

const mockExhibitions: Exhibition[] = [
  {
    id: "1",
    title: "Contemporary Visions 2024",
    description:
      "A curated selection of contemporary works from emerging and established artists exploring themes of identity, technology, and human connection in the digital age.",
    startDate: "2024-03-15",
    endDate: "2024-06-30",
    location: "Main Gallery, First Floor",
    curator: "Sarah Mitchell",
    status: "current",
    featuredImage: "/src/assets/gallery-hero.jpg",
    artworks: ["1", "2"],
  },
  {
    id: "2",
    title: "Abstract Expressions",
    description:
      "An exploration of abstract art featuring works that push the boundaries of form, color, and emotion.",
    startDate: "2024-07-15",
    endDate: "2024-10-15",
    location: "Gallery 2, Second Floor",
    curator: "Michael Chen",
    status: "upcoming",
    artworks: ["1"],
  },
  {
    id: "3",
    title: "Portraits of Time",
    description:
      "A retrospective look at portraiture through the ages, from classical to contemporary interpretations.",
    startDate: "2023-10-01",
    endDate: "2024-01-31",
    location: "Heritage Gallery",
    curator: "Elena Rodriguez",
    status: "past",
    artworks: ["2"],
  },
];

const ExhibitionManagement = () => {
  const {
    exhibitions,
    loading,
    error,
    createExhibition,
    updateExhibition,
    deleteExhibition,
  } = useExhibitions();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExhibitionFormData>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    curator: "",
    status: "upcoming",
    featured_image: "",
    gallery_images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEdit = (exhibition: Exhibition) => {
    setFormData({
      title: exhibition.title,
      description: exhibition.description,
      start_date: exhibition.start_date,
      end_date: exhibition.end_date,
      location: exhibition.location,
      curator: exhibition.curator,
      status: exhibition.status,
      featured_image: exhibition.featured_image || "",
      gallery_images: exhibition.gallery_images || [],
      is_visible: exhibition.is_visible,
    });
    setEditingId(exhibition.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      location: "",
      curator: "",
      status: "upcoming",
      featured_image: "",
      gallery_images: [],
      is_visible: true,
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log("handleSave called with formData:", formData);

    if (!formData.title || !formData.start_date || !formData.end_date) {
      console.log("Validation failed:", {
        title: formData.title,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      toast({
        title: "Error",
        description: "Title, Start Date, and End Date are required fields",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting save process...");
    setIsSubmitting(true);

    try {
      const exhibitionData = { ...formData };
      console.log("Exhibition data being sent:", exhibitionData);

      if (editingId) {
        // Update existing exhibition
        console.log("Updating exhibition with ID:", editingId);
        await updateExhibition(editingId, exhibitionData);
      } else {
        // Add new exhibition
        console.log("Creating new exhibition");
        await createExhibition(exhibitionData);
      }

      setIsEditing(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        curator: "",
        status: "upcoming",
        featured_image: "",
      });
    } catch (error) {
      console.error("Error saving exhibition:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: `Failed to save exhibition: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExhibition(id);
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      toast({
        title: "Error",
        description: "Failed to delete exhibition",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityToggle = async (
    id: string,
    currentVisibility: boolean
  ) => {
    try {
      await updateExhibition(id, { is_visible: !currentVisibility });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Exhibition" : "Add New Exhibition"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter exhibition title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <Select
                    value={formData.status || "upcoming"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "upcoming" | "past",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_visible"
                    checked={formData.is_visible || false}
                    onChange={(e) =>
                      setFormData({ ...formData, is_visible: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="is_visible" className="text-sm font-medium">
                    Visible on website
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Main Gallery, First Floor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Curator
                  </label>
                  <Input
                    value={formData.curator || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, curator: e.target.value })
                    }
                    placeholder="Enter curator name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter exhibition description..."
                  rows={4}
                />
              </div>

              <ImageGalleryManager
                images={formData.gallery_images || []}
                featuredImage={formData.featured_image || null}
                onImagesChange={(images) =>
                  setFormData({ ...formData, gallery_images: images })
                }
                onFeaturedImageChange={(imageUrl) =>
                  setFormData({ ...formData, featured_image: imageUrl || "" })
                }
                type="exhibitions"
              />

              <Button
                type="submit"
                className="bg-gallery-gold hover:bg-gallery-gold/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingId ? "Updating..." : "Adding..."}
                  </>
                ) : editingId ? (
                  "Update Exhibition"
                ) : (
                  "Add Exhibition"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading exhibitions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading exhibitions: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exhibition Management</h2>
        <Button
          onClick={handleAdd}
          className="bg-gallery-gold hover:bg-gallery-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exhibition
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exhibitions.map((exhibition) => (
          <Card key={exhibition.id}>
            {exhibition.featured_image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={exhibition.featured_image}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold">{exhibition.title}</h3>
                <Badge className={getStatusColor(exhibition.status)}>
                  {exhibition.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(exhibition.start_date)} -{" "}
                  {formatDate(exhibition.end_date)}
                </div>

                {exhibition.location && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {exhibition.location}
                  </p>
                )}

                {exhibition.curator && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Curator:</strong> {exhibition.curator}
                  </p>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exhibition.description}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("/exhibitions", "_blank")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleVisibilityToggle(exhibition.id, exhibition.is_visible)
                  }
                  className={
                    exhibition.is_visible
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-400 hover:text-gray-600"
                  }
                >
                  {exhibition.is_visible ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(exhibition)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(exhibition.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExhibitionManagement;
