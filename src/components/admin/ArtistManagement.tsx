import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Image,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useArtists,
  type Artist,
  type ArtistFormData,
} from "@/hooks/use-artists";
import { fileService } from "@/lib/database";

const ArtistManagement = () => {
  const { artists, loading, createArtist, updateArtist, deleteArtist } =
    useArtists();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ArtistFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEdit = (artist: Artist) => {
    setFormData({
      name: artist.name,
      specialty: artist.specialty,
      bio: artist.bio,
      education: artist.education,
      exhibitions: artist.exhibitions,
      profile_image: artist.profile_image,
      instagram: artist.instagram,
      twitter: artist.twitter,
      website: artist.website,
      email: artist.email,
      is_visible: artist.is_visible,
    });
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
      profile_image: null,
      instagram: null,
      twitter: null,
      website: null,
      email: null,
      is_visible: true,
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.specialty) {
      toast({
        title: "Error",
        description: "Name and Specialty are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        await updateArtist(editingId, formData);
      } else {
        await createArtist(formData as ArtistFormData);
      }

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArtist(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleVisibilityToggle = async (
    id: string,
    currentVisibility: boolean
  ) => {
    try {
      await updateArtist(id, { is_visible: !currentVisibility });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await fileService.uploadImage(file, "artists");
      setFormData((prev) => ({ ...prev, profile_image: imageUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
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
                  {formData.profile_image ? (
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={formData.profile_image} />
                        <AvatarFallback>
                          {formData.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowMediaSelector(true)}
                        >
                          <Image className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          Upload New
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="image-upload-new"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image-upload-new")?.click()
                        }
                        className="w-full py-8 border-dashed"
                      >
                        <Image className="w-6 h-6 mr-2" />
                        Upload Profile Image
                      </Button>
                    </div>
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
                    value={formData.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagram: e.target.value,
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
                    value={formData.website || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: e.target.value,
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
                    value={formData.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        twitter: e.target.value,
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
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="artist@email.com"
                  />
                </div>
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
            </div>

            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-gallery-gold hover:bg-gallery-gold/90"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
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
          <h2 className="text-2xl font-bold">Artist Management</h2>
          <Button
            onClick={handleAdd}
            className="bg-gallery-gold hover:bg-gallery-gold/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Artist
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gallery-gold" />
        </div>
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
                  <AvatarImage
                    src={artist.profile_image || ""}
                    alt={artist.name}
                  />
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
                  onClick={() =>
                    handleVisibilityToggle(artist.id, artist.is_visible)
                  }
                  className={
                    artist.is_visible
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-400 hover:text-gray-600"
                  }
                >
                  {artist.is_visible ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
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
    </div>
  );
};

export default ArtistManagement;
