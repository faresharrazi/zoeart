import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Plus, Edit, Trash2, Eye, Image, Loader2, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  profileImage: string;
  socialMedia: {
    instagram?: string;
    website?: string;
    email?: string;
  };
  assignedArtworks: string[]; // Array of artwork IDs
  isVisible: boolean;
}

const ArtistManagement = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const { toast } = useToast();

  // Fetch artists from database
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await apiClient.getArtists();
        console.log("Raw artists data:", data);

        // Transform the data to match our interface
        const transformedArtists = data.map((artist: any) => ({
          id: artist.id.toString(),
          name: artist.name,
          slug: artist.slug,
          specialty: artist.specialty || "",
          bio: artist.bio || "",
          profileImage: artist.profile_image || "",
          socialMedia: artist.social_media || {},
          assignedArtworks: artist.assigned_artworks || [],
          isVisible: artist.is_visible !== false,
        }));

        console.log("Transformed artists:", transformedArtists);
        setArtists(transformedArtists);
      } catch (error) {
        console.error("Error fetching artists:", error);
        toast({
          title: "Error",
          description: "Failed to fetch artists",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [toast]);

  const handleEdit = (artist: Artist) => {
    setFormData(artist);
    setEditingId(artist.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      slug: "",
      specialty: "",
      bio: "",
      profileImage: "",
      socialMedia: {},
      assignedArtworks: [],
      isVisible: true,
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const artistData = {
        name: formData.name,
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        specialty: formData.specialty || "",
        bio: formData.bio || "",
        profile_image: formData.profileImage || "",
        social_media: formData.socialMedia || {},
        is_visible: formData.isVisible !== false,
      };

      console.log("Sending artist data:", artistData);

      if (editingId) {
        // Update existing artist
        await apiClient.updateArtist(parseInt(editingId), artistData);
        toast({
          title: "Success",
          description: "Artist updated successfully",
        });
      } else {
        // Add new artist
        await apiClient.createArtist(artistData);
        toast({
          title: "Success",
          description: "New artist added successfully",
        });
      }

      // Refresh data from database
      const artistsData = await apiClient.getArtists();
      const transformedArtists = artistsData.map((artist: any) => ({
        id: artist.id.toString(),
        name: artist.name,
        slug: artist.slug,
        specialty: artist.specialty || "",
        bio: artist.bio || "",
        profileImage: artist.profile_image || "",
        socialMedia: artist.social_media || {},
        assignedArtworks: artist.assigned_artworks || [],
        isVisible: artist.is_visible !== false,
      }));
      setArtists(transformedArtists);

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving artist:", error);
      toast({
        title: "Error",
        description: "Failed to save artist",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteArtist(parseInt(id));
      setArtists(artists.filter((artist) => artist.id !== id));
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

  const handleProfileImageUpload = async (file: File) => {
    // Mock upload function - in a real app, this would upload to your storage
    return URL.createObjectURL(file);
  };

  const handleAddProfileImage = async (file: File) => {
    const imageUrl = await handleProfileImageUpload(file);
    setFormData({
      ...formData,
      profileImage: imageUrl,
    });
  };

  const handleAssignArtwork = (artistId: string, artworkId: string) => {
    setArtists(
      artists.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              assignedArtworks: [...artist.assignedArtworks, artworkId],
            }
          : artist
      )
    );
    toast({
      title: "Success",
      description: "Artwork assigned to artist",
    });
  };

  const handleUnassignArtwork = (artistId: string, artworkId: string) => {
    setArtists(
      artists.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              assignedArtworks: (artist.assignedArtworks || []).filter(
                (id) => id !== artworkId
              ),
            }
          : artist
      )
    );
    toast({
      title: "Success",
      description: "Artwork unassigned from artist",
    });
  };

  const toggleVisibility = async (
    artistId: string,
    currentVisibility: boolean
  ) => {
    try {
      const newVisibility = !currentVisibility;
      await apiClient.updateArtist(parseInt(artistId), {
        is_visible: newVisibility,
      });

      setArtists(
        artists.map((artist) =>
          artist.id === artistId
            ? { ...artist, isVisible: newVisibility }
            : artist
        )
      );

      toast({
        title: "Success",
        description: `Artist ${
          newVisibility ? "shown" : "hidden"
        } successfully`,
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

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl ">
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
                <label className="block text-sm  mb-2">Name *</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <label className="block text-sm  mb-2">Specialty</label>
                <Input
                  value={formData.specialty || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  placeholder="e.g., Abstract Expressionism"
                />
              </div>
              <div>
                <label className="block text-sm  mb-2">
                  Slug (URL-friendly name)
                </label>
                <Input
                  value={formData.slug || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="auto-generated from name"
                />
                <p className="text-xs text-theme-text-muted mt-1">
                  Leave empty to auto-generate from name
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm  mb-2">Profile Image</label>
                <div className="space-y-4">
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
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAddProfileImage(file);
                            }
                          }}
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="cursor-pointer"
                        >
                          <Button type="button" variant="outline">
                            <Image className="w-4 h-4 mr-2" />
                            Change Image
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-theme-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAddProfileImage(file);
                          }
                        }}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Image className="w-8 h-8 text-theme-text-muted" />
                        <span className="text-theme-text-muted">
                          Click to upload profile image or drag and drop
                        </span>
                        <span className="text-sm text-theme-text-muted">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm  mb-2">Biography</label>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Enter artist biography..."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg ">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm  mb-2">Instagram</label>
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
                  <label className="block text-sm  mb-2">Website</label>
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
                  <label className="block text-sm  mb-2">Email</label>
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

            <Button onClick={handleSave} className="">
              {editingId ? "Update Artist" : "Add Artist"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl ">Artist Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
          <span className="ml-2 text-theme-text-muted">Loading artists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl ">Artist Management</h2>
        <Button onClick={handleAdd} className="">
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
                  <h3 className="text-xl ">{artist.name}</h3>
                  <p className="text-theme-text-muted ">{artist.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {artist.bio}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={artist.isVisible ? "default" : "secondary"}>
                    {artist.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </div>

                <div>
                  <h4 className=" text-sm mb-2">Assigned Artworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {artist.assignedArtworks &&
                    artist.assignedArtworks.length > 0 ? (
                      artist.assignedArtworks.map((artworkId) => (
                        <Badge
                          key={artworkId}
                          variant="secondary"
                          className="text-xs"
                        >
                          Artwork {artworkId}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No artworks assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`/artist/${artist.slug}`, "_blank")
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleVisibility(artist.id, artist.isVisible)}
                  title={artist.isVisible ? "Hide artist" : "Show artist"}
                >
                  {artist.isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(artist)}
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
                      <AlertDialogTitle>Delete Artist</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{artist.name}</strong>? This action cannot be
                        undone and will remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(artist.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Artist
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtistManagement;
