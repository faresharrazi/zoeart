import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Calendar, Image } from "lucide-react";
import MediaSelector from "./MediaSelector";
import FeaturedImageSelector from "./FeaturedImageSelector";

interface Exhibition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "current" | "past";
  featuredImage?: string;
  artworks: string[]; // artwork IDs
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
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(mockExhibitions);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Exhibition>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();

  const handleEdit = (exhibition: Exhibition) => {
    setFormData(exhibition);
    setEditingId(exhibition.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      curator: "",
      status: "upcoming",
      featuredImage: "",
      artworks: [],
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Title, Start Date, and End Date are required fields",
        variant: "destructive",
      });
      return;
    }

    // Auto-determine status based on dates
    const now = new Date();
    const start = new Date(formData.startDate!);
    const end = new Date(formData.endDate!);

    let status: Exhibition["status"] = "upcoming";
    if (now >= start && now <= end) {
      status = "current";
    } else if (now > end) {
      status = "past";
    }

    const exhibitionData = { ...formData, status };

    if (editingId) {
      // Update existing exhibition
      setExhibitions(
        exhibitions.map((exhibition) =>
          exhibition.id === editingId
            ? ({ ...exhibition, ...exhibitionData } as Exhibition)
            : exhibition
        )
      );
      toast({
        title: "Success",
        description: "Exhibition updated successfully",
      });
    } else {
      // Add new exhibition
      const newExhibition: Exhibition = {
        ...exhibitionData,
        id: Date.now().toString(),
        artworks: formData.artworks || [],
      } as Exhibition;

      setExhibitions([...exhibitions, newExhibition]);
      toast({
        title: "Success",
        description: "New exhibition added successfully",
      });
    }

    setIsEditing(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setExhibitions(exhibitions.filter((exhibition) => exhibition.id !== id));
    toast({
      title: "Success",
      description: "Exhibition deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800";
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
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
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

            <div>
              <FeaturedImageSelector
                images={formData.galleryImages || []}
                featuredImage={formData.featuredImage || null}
                onFeaturedImageChange={(imageUrl) => {
                  setFormData({ ...formData, featuredImage: imageUrl });
                }}
                onImageUpload={async (file) => {
                  // Mock upload function - in real app, this would upload to your storage
                  return URL.createObjectURL(file);
                }}
              />
            </div>

            <Button onClick={handleSave} className="">
              {editingId ? "Update Exhibition" : "Add Exhibition"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exhibition Management</h2>
        <Button onClick={handleAdd} className="">
          <Plus className="w-4 h-4 mr-2" />
          Add Exhibition
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exhibitions.map((exhibition) => (
          <Card key={exhibition.id}>
            {exhibition.featuredImage && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={exhibition.featuredImage}
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
                  {formatDate(exhibition.startDate)} -{" "}
                  {formatDate(exhibition.endDate)}
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

                <p className="text-sm text-muted-foreground">
                  <strong>Artworks:</strong> {exhibition.artworks.length}{" "}
                  piece(s)
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
                  onClick={() => handleEdit(exhibition)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Exhibition</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{exhibition.title}</strong>? This action cannot
                        be undone and will remove all associated data including
                        images and gallery content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(exhibition.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Exhibition
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showMediaSelector && (
        <MediaSelector
          selectedImage={formData.featuredImage}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, featuredImage: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="exhibition"
        />
      )}
    </div>
  );
};

export default ExhibitionManagement;
