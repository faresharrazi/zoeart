import { useRef, useState } from "react";
import { Loader2, Star, Upload, X } from "lucide-react";
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
import { AdminPage, FormSection } from "../AdminUI";
import type { Artist } from "@/types/api";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist_id: number;
  artist_name: string;
  year: number;
  medium: string;
  size: string;
  description: string;
  images: string[];
  featured_image?: string;
  isVisible: boolean;
}

interface ArtworkFormProps {
  artwork?: Artwork;
  artists: Artist[];
  onSave: (artwork: Artwork) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ArtworkForm = ({
  artwork,
  artists,
  onSave,
  onCancel,
  isEditing,
}: ArtworkFormProps) => {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Artwork>>(
    artwork || {
      title: "",
      slug: "",
      artist_id: 0,
      artist_name: "",
      year: new Date().getFullYear(),
      medium: "",
      size: "",
      description: "",
      images: [],
      featured_image: "",
      isVisible: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Functional updates, so uploads finishing later don't undo other changes
  const update = (change: Partial<Artwork>) =>
    setFormData((data) => ({ ...data, ...change }));

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({ title: "The artwork needs a title", variant: "destructive" });
      return;
    }

    if (!formData.artist_id) {
      toast({ title: "Choose the artist", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      const artworkData = {
        title: formData.title,
        // Empty: the server builds a unique slug from the title/name
        slug: formData.slug || "",
        artist_id: formData.artist_id,
        year: formData.year || new Date().getFullYear(),
        medium: formData.medium || "",
        size: formData.size || "",
        description: formData.description || "",
        images: formData.images || [],
        featured_image: formData.featured_image || "",
        is_visible: formData.isVisible !== false,
      };

      if (isEditing && artwork?.id) {
        await apiClient.updateArtwork(parseInt(artwork.id), artworkData);
      } else {
        await apiClient.createArtwork(artworkData);
      }

      onSave(formData as Artwork);
      toast({ title: isEditing ? "Artwork saved" : "Artwork created" });
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Couldn't save the artwork",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /** Uploads one image and adds it to the artwork's images. */
  const uploadImage = async (file: File): Promise<string> => {
    const response = await apiClient.uploadImage(file, "artwork");
    const url = response.file.url;
    setFormData((data) => ({ ...data, images: [...(data.images || []), url] }));
    return url;
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    setUploading(true);
    const results = await Promise.allSettled(
      Array.from(files).map((file) => uploadImage(file))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error("Error uploading images:", results);
      toast({
        title:
          failed === files.length
            ? "Couldn't upload the images"
            : `${failed} of ${files.length} images couldn't be uploaded`,
        variant: "destructive",
      });
    } else {
      toast({
        title:
          files.length === 1
            ? "Image uploaded"
            : `${files.length} images uploaded`,
      });
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const removeImage = (index: number) =>
    setFormData((data) => {
      const images = [...(data.images || [])];
      const [removed] = images.splice(index, 1);
      return {
        ...data,
        images,
        // Removing the main image clears it
        featured_image:
          data.featured_image === removed ? "" : data.featured_image,
      };
    });

  const images = formData.images || [];

  const actions = (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={saving || uploading}>
        {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving…" : isEditing ? "Save changes" : "Create artwork"}
      </Button>
    </>
  );

  return (
    <AdminPage
      title={isEditing ? artwork?.title || "Edit artwork" : "New artwork"}
      description={
        isEditing
          ? "Changes show on the website as soon as you save."
          : "Add a work to the Collection and to its artist's page."
      }
      onBack={onCancel}
      backLabel="Back to artworks"
      actions={actions}
    >
      <div className="space-y-10 pt-2">
        <FormSection
          title="Details"
          description="What visitors read on the artwork's page."
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. Under the Sea"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Select
                value={formData.artist_id ? formData.artist_id.toString() : ""}
                onValueChange={(value) => {
                  const artistId = parseInt(value);
                  const artist = artists.find((a) => a.id === artistId);
                  update({
                    artist_id: artistId,
                    artist_name: artist?.name || "",
                  });
                }}
              >
                <SelectTrigger id="artist" aria-required="true">
                  <SelectValue placeholder="Choose an artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id.toString()}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ""}
                  onChange={(e) =>
                    update({
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Input
                  id="medium"
                  value={formData.medium || ""}
                  onChange={(e) => update({ medium: e.target.value })}
                  placeholder="e.g. Oil on canvas"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size || ""}
                onChange={(e) => update({ size: e.target.value })}
                placeholder="e.g. 50 × 70 cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="About the work, its story or technique"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Web address</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="shrink-0 pl-3 text-sm text-mist">
                  /artwork/
                </span>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => update({ slug: e.target.value })}
                  placeholder="made-from-the-title"
                  aria-describedby="slug-hint"
                  className="h-[38px] border-0 pl-0.5 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p id="slug-hint" className="text-xs text-mist">
                Leave empty to create it from the title.
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Images"
          description="Photos of the work, shown on its page. The main image is the one shown in the Collection and in lists; if none is chosen, the first image is used."
        >
          <div className="space-y-4">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) handleMultipleImageUpload(files);
              }}
              className="hidden"
              id="multiple-image-upload"
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
              {uploading ? "Uploading…" : "Upload images"}
            </Button>

            {images.length === 0 ? (
              <p className="rounded-lg bg-secondary px-4 py-6 text-center text-sm text-mist">
                No images yet
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <li key={image + index} className="relative">
                    <img
                      src={imageUrl(image, {
                        width: 320,
                        height: 320,
                        crop: "fill",
                      })}
                      alt={`Image ${index + 1}`}
                      className="aspect-square w-full rounded-lg bg-secondary object-cover"
                    />
                    {formData.featured_image === image ? (
                      <span className="absolute bottom-2 left-2 inline-flex h-6 items-center gap-1 rounded-full bg-ink px-2 text-xs font-medium text-paper shadow-sm">
                        <Star
                          className="size-3 fill-current"
                          aria-hidden="true"
                        />
                        Main
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => update({ featured_image: image })}
                        aria-label={`Set image ${index + 1} as the main image`}
                        className="absolute bottom-2 left-2 inline-flex h-6 items-center gap-1 rounded-full bg-white/95 px-2 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Star className="size-3" aria-hidden="true" />
                        Set as main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition-colors hover:bg-white hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Visibility"
          description="Hidden artworks stay in the admin but don't appear on the website."
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

export default ArtworkForm;
