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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Image,
  Upload,
  X,
} from "lucide-react";
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
  status: "upcoming" | "past";
  featuredImage?: string;
  galleryImages: string[]; // multiple gallery images
  assignedArtists: string[]; // artist IDs
  assignedArtworks: string[]; // artwork IDs
}

// Mock data for artists and artworks
const mockArtists = [
  { id: "1", name: "Elena Rodriguez", specialty: "Abstract Expressionism" },
  { id: "2", name: "Marcus Chen", specialty: "Digital Art" },
  { id: "3", name: "Sarah Williams", specialty: "Contemporary Sculpture" },
  { id: "4", name: "Alex Rivera", specialty: "Mixed Media" },
  { id: "5", name: "Luna Park", specialty: "Photography" },
  { id: "6", name: "David Thompson", specialty: "Oil Painting" },
];

const mockArtworks = [
  { id: "1", title: "Fluid Dynamics", artist: "Elena Rodriguez" },
  { id: "2", title: "Digital Dreams", artist: "Marcus Chen" },
  { id: "3", title: "Sculptural Forms", artist: "Sarah Williams" },
  { id: "4", title: "Mixed Perspectives", artist: "Alex Rivera" },
  { id: "5", title: "Urban Landscapes", artist: "Luna Park" },
  { id: "6", title: "Classical Revival", artist: "David Thompson" },
];

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
    status: "upcoming",
    featuredImage: "/src/assets/gallery-hero.jpg",
    galleryImages: [
      "/src/assets/artwork-abstract-1.jpg",
      "/src/assets/artwork-abstract-2.jpg",
      "/src/assets/artwork-geometric-1.jpg",
    ],
    assignedArtists: ["1", "2", "3"],
    assignedArtworks: ["1", "2", "3"],
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
    featuredImage: "/src/assets/artwork-geometric-1.jpg",
    galleryImages: [
      "/src/assets/artwork-abstract-1.jpg",
      "/src/assets/artwork-landscape-1.jpg",
    ],
    assignedArtists: ["1", "4"],
    assignedArtworks: ["1", "4"],
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
    featuredImage: "/src/assets/artwork-portrait-1.jpg",
    galleryImages: [
      "/src/assets/artwork-portrait-1.jpg",
      "/src/assets/artwork-sculpture-1.jpg",
    ],
    assignedArtists: ["5", "6"],
    assignedArtworks: ["5", "6"],
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
      galleryImages: [],
      assignedArtists: [],
      assignedArtworks: [],
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.status
    ) {
      toast({
        title: "Error",
        description:
          "Title, Start Date, End Date, and Status are required fields",
        variant: "destructive",
      });
      return;
    }

    const exhibitionData = { ...formData };

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
        galleryImages: formData.galleryImages || [],
        assignedArtists: formData.assignedArtists || [],
        assignedArtworks: formData.assignedArtworks || [],
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

  // Helper functions for image management
  const handleImageUpload = async (file: File) => {
    // Mock upload function - in real app, this would upload to your storage
    return URL.createObjectURL(file);
  };

  const handleGalleryImageUpload = async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    setFormData({
      ...formData,
      galleryImages: [...(formData.galleryImages || []), imageUrl],
    });
  };

  const removeGalleryImage = (index: number) => {
    const newImages =
      formData.galleryImages?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, galleryImages: newImages });
  };

  // Helper functions for assignments
  const toggleArtistAssignment = (artistId: string) => {
    const currentArtists = formData.assignedArtists || [];
    const newArtists = currentArtists.includes(artistId)
      ? currentArtists.filter((id) => id !== artistId)
      : [...currentArtists, artistId];
    setFormData({ ...formData, assignedArtists: newArtists });
  };

  const toggleArtworkAssignment = (artworkId: string) => {
    const currentArtworks = formData.assignedArtworks || [];
    const newArtworks = currentArtworks.includes(artworkId)
      ? currentArtworks.filter((id) => id !== artworkId)
      : [...currentArtworks, artworkId];
    setFormData({ ...formData, assignedArtworks: newArtworks });
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
                  Status *
                </label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value: "upcoming" | "past") =>
                    setFormData({ ...formData, status: value })
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

            {/* Gallery Images Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Gallery Images
              </label>
              <div className="space-y-4">
                {/* Upload new image */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleGalleryImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload gallery images
                    </span>
                  </label>
                </div>

                {/* Display uploaded images */}
                {formData.galleryImages &&
                  formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setFormData({ ...formData, featuredImage: image })
                            }
                            className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${
                              formData.featuredImage === image
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            {formData.featuredImage === image
                              ? "Featured"
                              : "Set Featured"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Artist Assignment Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Artists
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockArtists.map((artist) => (
                  <label
                    key={artist.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedArtists?.includes(artist.id) || false
                      }
                      onChange={() => toggleArtistAssignment(artist.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {artist.name} ({artist.specialty})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Artwork Assignment Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Artworks
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockArtworks.map((artwork) => (
                  <label
                    key={artwork.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedArtworks?.includes(artwork.id) || false
                      }
                      onChange={() => toggleArtworkAssignment(artwork.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {artwork.title} by {artwork.artist}
                    </span>
                  </label>
                ))}
              </div>
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
                  <strong>Gallery Images:</strong>{" "}
                  {exhibition.galleryImages?.length || 0} image(s)
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Assigned Artists:</strong>{" "}
                  {exhibition.assignedArtists?.length || 0} artist(s)
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Assigned Artworks:</strong>{" "}
                  {exhibition.assignedArtworks?.length || 0} piece(s)
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
