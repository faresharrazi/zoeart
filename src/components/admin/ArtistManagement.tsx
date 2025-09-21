import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Image } from "lucide-react";
import MediaSelector from "./MediaSelector";

interface Artist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  education: string;
  exhibitions: string;
  profileImage: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
}

const mockArtists: Artist[] = [
  {
    id: "1",
    name: "Elena Rodriguez",
    specialty: "Abstract Expressionism",
    bio: "Elena Rodriguez is a contemporary abstract artist whose work explores the intersection of emotion and movement. Born in Barcelona, she has exhibited internationally and is known for her dynamic use of color and form.",
    education: "MFA Fine Arts, Barcelona Academy of Art",
    exhibitions:
      "Solo: Gallery Modern (2023), Group: Contemporary Visions (2024)",
    profileImage: "/src/assets/artist-elena-rodriguez.jpg",
    socialMedia: {
      instagram: "https://instagram.com/elenarodriguezart",
      twitter: "https://twitter.com/elenarodriguezart",
      website: "https://elenarodriguezart.com",
      email: "elena@elenarodriguezart.com",
    },
  },
  {
    id: "2",
    name: "Marcus Chen",
    specialty: "Geometric Minimalism",
    bio: "Marcus Chen creates minimalist works that examine the relationship between structure and space. His precise geometric compositions have been featured in major galleries across Asia and Europe.",
    education: "BFA Visual Arts, Central Saint Martins",
    exhibitions: "Solo: White Cube London (2023), Venice Biennale (2024)",
    profileImage: "/src/assets/artist-marcus-chen.jpg",
    socialMedia: {
      instagram: "https://instagram.com/marcuschenart",
      website: "https://marcuschenart.com",
      email: "hello@marcuschenart.com",
    },
  },
  {
    id: "3",
    name: "Sarah Williams",
    specialty: "Contemporary Portraiture",
    bio: "Sarah Williams is renowned for her deeply psychological portraits that capture the complexity of human emotion. Her work bridges traditional portraiture with contemporary artistic expression.",
    education: "MFA Painting, Yale School of Art",
    exhibitions: "Solo: Metropolitan Museum (2023), Whitney Biennial (2024)",
    profileImage: "/src/assets/artist-sarah-williams.jpg",
    socialMedia: {
      instagram: "https://instagram.com/sarahwilliamsart",
      twitter: "https://twitter.com/sarahwilliamsart",
      website: "https://sarahwilliamsportrait.com",
      email: "sarah@sarahwilliamsportrait.com",
    },
  },
  {
    id: "4",
    name: "David Thompson",
    specialty: "Abstract Landscape",
    bio: "David Thompson's abstract landscapes celebrate the raw energy of natural forms. His bold brushwork and earth-tone palette create compositions that are both powerful and meditative.",
    education: "BFA Landscape Painting, Rhode Island School of Design",
    exhibitions:
      "Solo: National Gallery (2023), Group: Nature Reimagined (2024)",
    profileImage: "/src/assets/artist-david-thompson.jpg",
    socialMedia: {
      instagram: "https://instagram.com/davidthompsonart",
      website: "https://davidthompsonlandscapes.com",
    },
  },
  {
    id: "5",
    name: "Luna Park",
    specialty: "Contemporary Landscape",
    bio: "Luna Park reimagines traditional landscape painting for the contemporary world. Her stylized interpretations blend realism with modern artistic sensibilities.",
    education: "MFA Contemporary Art, California Institute of the Arts",
    exhibitions: "Solo: LACMA (2023), Group: New Landscapes (2024)",
    profileImage: "/src/assets/artist-luna-park.jpg",
    socialMedia: {
      instagram: "https://instagram.com/lunaparkart",
      twitter: "https://twitter.com/lunaparkart",
      website: "https://lunaparkart.com",
      email: "luna@lunaparkart.com",
    },
  },
  {
    id: "6",
    name: "Alex Rivera",
    specialty: "Sculptural Installation",
    bio: "Alex Rivera pushes the boundaries of sculptural art through innovative use of materials and space. Their installations challenge viewers' perceptions through light, form, and transparency.",
    education: "MFA Sculpture, Parsons School of Design",
    exhibitions: "Solo: Guggenheim (2024), Group: Material Explorations (2024)",
    profileImage: "/src/assets/artist-alex-rivera.jpg",
    socialMedia: {
      instagram: "https://instagram.com/alexriverasculpture",
      website: "https://alexriverasculpture.com",
      email: "alex@alexriverasculpture.com",
    },
  },
];

const ArtistManagement = () => {
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();

  const handleEdit = (artist: Artist) => {
    setFormData(artist);
    setEditingId(artist.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      specialty: "",
      bio: "",
      education: "",
      exhibitions: "",
      profileImage: "",
      socialMedia: {},
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.specialty) {
      toast({
        title: "Error",
        description: "Name and Specialty are required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing artist
      setArtists(
        artists.map((artist) =>
          artist.id === editingId
            ? ({ ...artist, ...formData } as Artist)
            : artist
        )
      );
      toast({
        title: "Success",
        description: "Artist updated successfully",
      });
    } else {
      // Add new artist
      const newArtist: Artist = {
        ...formData,
        id: Date.now().toString(),
        socialMedia: formData.socialMedia || {},
      } as Artist;

      setArtists([...artists, newArtist]);
      toast({
        title: "Success",
        description: "New artist added successfully",
      });
    }

    setIsEditing(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setArtists(artists.filter((artist) => artist.id !== id));
    toast({
      title: "Success",
      description: "Artist deleted successfully",
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Artist" : "Add New Artist"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Specialty *
                </label>
                <Input
                  value={formData.specialty || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  placeholder="e.g., Abstract Expressionism"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Profile Image
                </label>
                <div className="space-y-2">
                  {formData.profileImage ? (
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={formData.profileImage} />
                        <AvatarFallback>
                          {formData.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMediaSelector(true)}
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
                      Select or Upload Profile Image
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Biography
              </label>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Enter artist biography..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Education
              </label>
              <Input
                value={formData.education || ""}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                placeholder="e.g., MFA Fine Arts, Art Institute"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Exhibitions
              </label>
              <Textarea
                value={formData.exhibitions || ""}
                onChange={(e) =>
                  setFormData({ ...formData, exhibitions: e.target.value })
                }
                placeholder="List recent exhibitions..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instagram
                  </label>
                  <Input
                    value={formData.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website
                  </label>
                  <Input
                    value={formData.socialMedia?.website || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          website: e.target.value,
                        },
                      })
                    }
                    placeholder="https://artistwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Twitter
                  </label>
                  <Input
                    value={formData.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    value={formData.socialMedia?.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="artist@email.com"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-gallery-gold hover:bg-gallery-gold/90"
            >
              {editingId ? "Update Artist" : "Add Artist"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Artist Management</h2>
        <Button
          onClick={handleAdd}
          className="bg-gallery-gold hover:bg-gallery-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Artist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {artists.map((artist) => (
          <Card key={artist.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={artist.profileImage} alt={artist.name} />
                  <AvatarFallback>
                    {artist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{artist.name}</h3>
                  <p className="text-gallery-gold font-medium">
                    {artist.specialty}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {artist.bio}
                </p>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Education</h4>
                  <p className="text-sm text-muted-foreground">
                    {artist.education}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Recent Exhibitions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {artist.exhibitions}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("/artists", "_blank")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(artist)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(artist.id)}
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
          selectedImage={formData.profileImage}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, profileImage: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="artist"
        />
      )}
    </div>
  );
};

export default ArtistManagement;
