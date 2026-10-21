import { useRef, useState } from "react";
import { Globe, Loader2, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage } from "@/lib/apiClient";
import { imageUrl } from "@/lib/images";
import { getSocialMediaIcon } from "@/lib/socialMediaIcons";
import { AdminPage, FormSection, IconAction } from "../AdminUI";

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

const PLATFORMS = [
  { name: "Instagram", icon: "instagram" },
  { name: "X", icon: "twitter" },
  { name: "LinkedIn", icon: "linkedin" },
  { name: "YouTube", icon: "youtube" },
  { name: "Website", icon: "website" },
  { name: "Email", icon: "email" },
];

const PLACEHOLDERS: Record<string, string> = {
  email: "artist@example.com",
  website: "https://www.example.com",
  instagram: "@username or https://instagram.com/username",
  twitter: "@username or https://x.com/username",
  x: "@username or https://x.com/username",
  linkedin: "https://linkedin.com/in/username",
  youtube: "https://youtube.com/@username",
};

const ArtistForm = ({
  artist,
  onSave,
  onCancel,
  isEditing,
}: ArtistFormProps) => {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
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
  const [uploading, setUploading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const update = (change: Partial<Artist>) =>
    setFormData((data) => ({ ...data, ...change }));

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "The artist needs a name",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const artistData = {
        name: formData.name,
        // Empty: the server builds a unique slug from the title/name
        slug: formData.slug || "",
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
      toast({ title: isEditing ? "Artist saved" : "Artist created" });
    } catch (error) {
      console.error("Error saving artist:", error);
      toast({
        title: "Couldn't save the artist",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await apiClient.uploadImage(file, "artist");
      update({ profileImage: response.file.url });
      toast({ title: "Photo uploaded" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ title: "Couldn't upload the photo", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const updateSocialMedia = (platform: string, value: string) =>
    setFormData((data) => ({
      ...data,
      socialMedia: { ...data.socialMedia, [platform]: value },
    }));

  const removeSocialMedia = (platform: string) =>
    setFormData((data) => {
      const socialMedia = { ...data.socialMedia };
      delete socialMedia[platform];
      return { ...data, socialMedia };
    });

  const addSocialMedia = () => {
    if (!selectedPlatform) return;
    updateSocialMedia(selectedPlatform, "");
    setSelectedPlatform("");
  };

  const links = Object.entries(formData.socialMedia || {});
  const availablePlatforms = PLATFORMS.filter(
    (platform) =>
      !links.some(([key]) => key.toLowerCase() === platform.name.toLowerCase())
  );

  const actions = (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={saving || uploading}>
        {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving…" : isEditing ? "Save changes" : "Create artist"}
      </Button>
    </>
  );

  return (
    <AdminPage
      title={isEditing ? artist?.name || "Edit artist" : "New artist"}
      description={
        isEditing
          ? "Changes show on the website as soon as you save."
          : "Add an artist to show them on the Artists page."
      }
      onBack={onCancel}
      backLabel="Back to artists"
      actions={actions}
    >
      <div className="space-y-10 pt-2">
        <FormSection
          title="Profile"
          description="The name, specialty and biography shown on the artist's page."
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="e.g. Eleni Markou"
                maxLength={100}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty || ""}
                onChange={(e) => update({ specialty: e.target.value })}
                placeholder="e.g. Painter, Sculptor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => update({ bio: e.target.value })}
                placeholder="A few paragraphs about the artist and their work"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Web address</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="shrink-0 pl-3 text-sm text-mist">
                  /artist/
                </span>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => update({ slug: e.target.value })}
                  placeholder="made-from-the-name"
                  aria-describedby="slug-hint"
                  className="h-[38px] border-0 pl-0.5 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p id="slug-hint" className="text-xs text-mist">
                Leave empty to create it from the name.
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Photo"
          description="A portrait or studio photo, shown on the Artists page and the artist's page."
        >
          <div className="flex flex-wrap items-center gap-5">
            {formData.profileImage ? (
              <img
                src={imageUrl(formData.profileImage, {
                  width: 192,
                  height: 192,
                  crop: "fill",
                })}
                alt=""
                className="size-24 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="size-24 shrink-0 rounded-full bg-secondary"
                aria-hidden="true"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInput}
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
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Upload aria-hidden="true" />
                )}
                {uploading
                  ? "Uploading…"
                  : formData.profileImage
                    ? "Replace photo"
                    : "Upload photo"}
              </Button>
              {formData.profileImage && !uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => update({ profileImage: "" })}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Links"
          description="Website, email and social profiles, shown on the artist's page."
        >
          <div className="space-y-4">
            {links.length === 0 ? (
              <p className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-6 text-center text-sm text-mist">
                <Globe className="size-4" aria-hidden="true" />
                No links yet
              </p>
            ) : (
              <ul className="space-y-4 sm:space-y-2">
                {links.map(([platform, handle]) => (
                  <li
                    key={platform}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex items-center justify-between sm:w-32 sm:shrink-0">
                      <span className="flex items-center gap-2 text-sm font-medium capitalize text-ink">
                        <span className="text-mist">
                          {getSocialMediaIcon(platform, "md")}
                        </span>
                        {platform}
                      </span>
                      <IconAction
                        label={`Remove ${platform}`}
                        icon={X}
                        tone="danger"
                        onClick={() => removeSocialMedia(platform)}
                        className="sm:hidden"
                      />
                    </div>
                    <Input
                      aria-label={platform}
                      placeholder={
                        PLACEHOLDERS[platform.toLowerCase()] ??
                        `${platform} handle or link`
                      }
                      value={handle}
                      onChange={(e) =>
                        updateSocialMedia(platform, e.target.value)
                      }
                      className="flex-1"
                    />
                    <IconAction
                      label={`Remove ${platform}`}
                      icon={X}
                      tone="danger"
                      onClick={() => removeSocialMedia(platform)}
                      className="hidden sm:inline-flex"
                    />
                  </li>
                ))}
              </ul>
            )}

            {availablePlatforms.length > 0 && (
              <div className="flex gap-2">
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger className="sm:w-48" aria-label="Link type">
                    <SelectValue placeholder="Choose a link type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platform) => (
                      <SelectItem key={platform.name} value={platform.name}>
                        <span className="flex items-center gap-2">
                          {getSocialMediaIcon(platform.icon, "sm")}
                          {platform.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialMedia}
                  disabled={!selectedPlatform}
                >
                  <Plus aria-hidden="true" />
                  Add link
                </Button>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Visibility"
          description="Hidden artists stay in the admin but don't appear on the website."
        >
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="isVisible" className="leading-snug">
              Show on the website
            </Label>
            <Switch
              id="isVisible"
              checked={formData.isVisible !== false}
              onCheckedChange={(checked) => update({ isVisible: checked })}
            />
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t pt-6">{actions}</div>
      </div>
    </AdminPage>
  );
};

export default ArtistForm;
