import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Image } from "lucide-react";
import MediaSelector from "./MediaSelector";

// Mock data structure - replace with real API calls later
interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  description: string;
  image: string;
  slug: string;
  status: "available" | "sold" | "reserved";
}

const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Fluid Dynamics",
    artist: "Elena Rodriguez",
    year: 2024,
    medium: "Acrylic on Canvas",
    description:
      "An exploration of movement and form through organic shapes that dance across the canvas in harmonious blues and gold.",
    image: "/src/assets/artwork-abstract-1.jpg",
    slug: "fluid-dynamics",
    status: "available",
  },
  {
    id: "2",
    title: "Intersection",
    artist: "Marcus Chen",
    year: 2023,
    medium: "Mixed Media",
    description:
      "A minimalist composition examining the relationship between structure and space in contemporary urban environments.",
    image: "/src/assets/artwork-geometric-1.jpg",
    slug: "intersection",
    status: "available",
  },
  {
    id: "3",
    title: "Silent Contemplation",
    artist: "Sarah Williams",
    year: 2024,
    medium: "Oil on Canvas",
    description:
      "A powerful portrait capturing the quiet strength and introspective nature of the human spirit.",
    image: "/src/assets/artwork-portrait-1.jpg",
    slug: "silent-contemplation",
    status: "available",
  },
  {
    id: "4",
    title: "Earth Rhythms",
    artist: "David Thompson",
    year: 2023,
    medium: "Acrylic on Canvas",
    description:
      "Bold brushstrokes and earth tones create a dynamic composition celebrating the raw energy of nature.",
    image: "/src/assets/artwork-abstract-2.jpg",
    slug: "earth-rhythms",
    status: "available",
  },
  {
    id: "5",
    title: "Mountain Dreams",
    artist: "Luna Park",
    year: 2024,
    medium: "Oil on Canvas",
    description:
      "A contemporary interpretation of natural landscapes, blending realism with stylized forms and golden highlights.",
    image: "/src/assets/artwork-landscape-1.jpg",
    slug: "mountain-dreams",
    status: "available",
  },
  {
    id: "6",
    title: "Modern Forms",
    artist: "Alex Rivera",
    year: 2024,
    medium: "Steel & Glass Installation",
    description:
      "An innovative sculptural piece that challenges perception through the interplay of light, metal, and transparency.",
    image: "/src/assets/artwork-sculpture-1.jpg",
    slug: "modern-forms",
    status: "available",
  },
];

const ArtworkManagement = () => {
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Artwork>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();

  const handleEdit = (artwork: Artwork) => {
    setFormData(artwork);
    setEditingId(artwork.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      artist: "",
      year: new Date().getFullYear(),
      medium: "",
      description: "",
      image: "",
      slug: "",
      status: "available",
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.artist) {
      toast({
        title: "Error",
        description: "Title and Artist are required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing artwork
      setArtworks(
        artworks.map((artwork) =>
          artwork.id === editingId
            ? ({ ...artwork, ...formData } as Artwork)
            : artwork
        )
      );
      toast({
        title: "Success",
        description: "Artwork updated successfully",
      });
    } else {
      // Add new artwork
      const newArtwork: Artwork = {
        ...formData,
        id: Date.now().toString(),
        slug: formData.title?.toLowerCase().replace(/\s+/g, "-") || "",
      } as Artwork;

      setArtworks([...artworks, newArtwork]);
      toast({
        title: "Success",
        description: "New artwork added successfully",
      });
    }

    setIsEditing(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setArtworks(artworks.filter((artwork) => artwork.id !== id));
    toast({
      title: "Success",
      description: "Artwork deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Artwork" : "Add New Artwork"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter artwork title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Artist *
                </label>
                <Input
                  value={formData.artist || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <Input
                  type="number"
                  value={formData.year || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medium</label>
                <Input
                  value={formData.medium || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, medium: e.target.value })
                  }
                  placeholder="Oil on Canvas, Acrylic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status || "available"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full p-2 border border-input bg-background rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
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
                placeholder="Enter artwork description..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Artwork Image
              </label>
              <div className="space-y-2">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Selected artwork"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowMediaSelector(true)}
                      className="mt-2"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaSelector(true)}
                    className="w-full py-8 border-dashed"
                  >
                    <Image className="w-6 h-6 mr-2" />
                    Select or Upload Image
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-gallery-gold hover:bg-gallery-gold/90"
            >
              {editingId ? "Update Artwork" : "Add Artwork"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Artwork Management</h2>
        <Button
          onClick={handleAdd}
          className="bg-gallery-gold hover:bg-gallery-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{artwork.title}</h3>
                <Badge className={getStatusColor(artwork.status)}>
                  {artwork.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-1">{artwork.artist}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {artwork.year} • {artwork.medium}
              </p>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`/artwork/${artwork.slug}`, "_blank")
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(artwork)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(artwork.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showMediaSelector && (
        <MediaSelector
          selectedImage={formData.image}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, image: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="artwork"
        />
      )}
    </div>
  );
};

export default ArtworkManagement;
