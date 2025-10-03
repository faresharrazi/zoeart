import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Save, X, Image, Upload, Plus, Globe, ChevronDown } from "lucide-react";
import { getSocialMediaIcon } from "@/lib/socialMediaIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ArtistFormProps {
  artist?: Artist;
  onSave: (artist: Artist) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ArtistForm = ({
  artist,
  onSave,
  onCancel,
  isEditing,
}: ArtistFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Artist>>(
    artist || {
      name: "",
      slug: "",
      specialty: "",
      bio: "",
      profileImage: "",
      socialMedia: {},
      assignedArtworks: [],
      isVisible: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

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
        assigned_artworks: formData.assignedArtworks || [],
        is_visible: formData.isVisible !== false,
      };

      if (isEditing && artist?.id) {
        await apiClient.updateArtist(parseInt(artist.id), artistData);
      } else {
        await apiClient.createArtist(artistData);
      }

      onSave(formData as Artist);
      toast({
        title: "Success",
        description: `Artist ${isEditing ? "updated" : "created"} successfully`,
      });
    } catch (error: any) {
      console.error("Error saving artist:", error);
      const errorMessage = error.message || "Failed to save artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    try {
      // Use new Cloudinary-enabled upload method
      const response = await apiClient.uploadImage(file, "artist");
      
      // The response now contains the Cloudinary URL directly
      const imageUrl = response.file.url;

      setFormData({
        ...formData,
        profileImage: imageUrl,
      });

      toast({
        title: "Success",
        description: "Profile image uploaded to Cloudinary successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [platform]: value,
      },
    });
  };

  const removeSocialMedia = (platform: string) => {
    const newSocialMedia = { ...formData.socialMedia };
    delete newSocialMedia[platform];
    setFormData({
      ...formData,
      socialMedia: newSocialMedia,
    });
  };

  const predefinedPlatforms = [
    { name: "Instagram", icon: "instagram" },
    { name: "X", icon: "twitter" },
    { name: "LinkedIn", icon: "linkedin" },
    { name: "YouTube", icon: "youtube" },
    { name: "Website", icon: "website" },
    { name: "Email", icon: "email" },
  ];

  const addSocialMedia = () => {
    if (selectedPlatform) {
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [selectedPlatform]: "",
        },
      });
      setSelectedPlatform(""); // Reset selection
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Artist" : "Add New Artist"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter artist name"
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="Auto-generated from name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            value={formData.specialty || ""}
            onChange={(e) =>
              setFormData({ ...formData, specialty: e.target.value })
            }
            placeholder="Enter artist specialty"
          />
        </div>

        <div>
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={formData.bio || ""}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Enter artist biography..."
            rows={4}
          />
        </div>

        <div>
          <Label>Profile Image</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfileImageUpload(file);
                  }}
                  className="hidden"
                  id="profile-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("profile-image-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>

            {formData.profileImage && (
              <div className="aspect-square w-32 overflow-hidden rounded-lg">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">
              Social Media Links
            </Label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedPlatform}
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPlatforms.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      <div className="flex items-center gap-2">
                        {getSocialMediaIcon(platform.icon, "sm")}
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialMedia}
                disabled={!selectedPlatform}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(formData.socialMedia || {}).map(
              ([platform, handle]) => (
                <div
                  key={platform}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    {getSocialMediaIcon(platform, "md")}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {platform}
                    </span>
                  </div>
                  <Input
                    placeholder={
                      platform.toLowerCase() === "email"
                        ? "artist@example.com"
                        : platform.toLowerCase() === "website"
                        ? "https://www.example.com"
                        : platform.toLowerCase() === "instagram"
                        ? "@username or https://instagram.com/username"
                        : platform.toLowerCase() === "twitter" ||
                          platform.toLowerCase() === "x"
                        ? "@username or https://x.com/username"
                        : platform.toLowerCase() === "linkedin"
                        ? "https://linkedin.com/in/username"
                        : platform.toLowerCase() === "youtube"
                        ? "https://youtube.com/@username"
                        : `Enter ${platform.toLowerCase()} handle or URL`
                    }
                    value={handle}
                    onChange={(e) =>
                      updateSocialMedia(platform, e.target.value)
                    }
                    className="flex-1 border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialMedia(platform)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            )}

            {Object.keys(formData.socialMedia || {}).length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No social media links added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Add Platform" to get started
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            checked={formData.isVisible !== false}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isVisible: checked })
            }
          />
          <Label htmlFor="isVisible">Visible on Frontend</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : isEditing ? "Update Artist" : "Add Artist"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistForm;
