import { useId, useRef, useState, type ReactNode } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { Artist, Artwork } from "@/types/api";
import { AdminPage, FormSection, IconAction } from "../AdminUI";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "current" | "past";
  featuredImage?: string;
  galleryImages: string[];
  assignedArtists: string[];
  assignedArtworks: string[];
  callForArtists?: boolean;
  ctaLink?: string;
  pressMediaName?: string;
  pressMediaLink?: string;
  isVisible?: boolean;
}

interface ExhibitionFormProps {
  exhibition?: Exhibition;
  artists: Artist[];
  artworks: Artwork[];
  onSave: (exhibition: Exhibition) => void;
  onCancel: () => void;
  isEditing: boolean;
}

/** Label, control and an optional hint underneath. */
const Field = ({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-mist">{hint}</p>}
  </div>
);

/** Scrollable list of checkboxes with a filter once the list gets long. */
const ChecklistField = ({
  label,
  options,
  selected,
  onChange,
  emptyText,
}: {
  label: string;
  options: { id: string; label: string; detail?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  emptyText: string;
}) => {
  const id = useId();
  const [filter, setFilter] = useState("");
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <fieldset className="space-y-2">
      <legend className="flex w-full items-center justify-between gap-3 text-sm font-medium text-ink">
        {label}
        <span className="text-xs font-normal text-mist">
          {selected.length} selected
        </span>
      </legend>
      <div className="overflow-hidden rounded-lg border">
        {options.length > 8 && (
          <div className="border-b p-2">
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Filter ${label.toLowerCase()}`}
              aria-label={`Filter ${label.toLowerCase()}`}
              className="h-8 border-0 bg-secondary shadow-none focus-visible:ring-1"
            />
          </div>
        )}
        {options.length === 0 ? (
          <p className="px-3 py-4 text-sm text-mist">{emptyText}</p>
        ) : (
          <ul className="max-h-56 overflow-y-auto py-1">
            {visible.map((option) => {
              const inputId = `${id}-${option.id}`;
              const checked = selected.includes(option.id);
              return (
                <li key={option.id}>
                  <label
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        onChange(
                          e.target.checked
                            ? [...selected, option.id]
                            : selected.filter((s) => s !== option.id)
                        )
                      }
                      className="size-4 shrink-0 accent-[hsl(var(--ink))]"
                    />
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {option.label}
                    </span>
                    {option.detail && (
                      <span className="shrink-0 truncate text-xs text-mist">
                        {option.detail}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-3 py-3 text-sm text-mist">No matches.</li>
            )}
          </ul>
        )}
      </div>
    </fieldset>
  );
};

const ExhibitionForm = ({
  exhibition,
  artists,
  artworks,
  onSave,
  onCancel,
  isEditing,
}: ExhibitionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Exhibition>>(
    exhibition || {
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
      callForArtists: false,
      ctaLink: "",
      pressMediaName: "",
      pressMediaLink: "",
      isVisible: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const posterInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const update = (change: Partial<Exhibition>) =>
    setFormData((data) => ({ ...data, ...change }));

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({
        title: "Add a title before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const exhibitionData = {
        title: formData.title,
        // Empty: the server builds a unique slug from the title/name
        slug: formData.slug || "",
        description: formData.description || "",
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location || "",
        curator: formData.curator || "",
        status: formData.status || "upcoming",
        featured_image: formData.featuredImage || "",
        gallery_images: formData.galleryImages || [],
        assigned_artists: formData.assignedArtists || [],
        assigned_artworks: formData.assignedArtworks || [],
        call_for_artists: formData.callForArtists || false,
        cta_link: formData.ctaLink || "",
        press_media_name: formData.pressMediaName || "",
        press_media_link: formData.pressMediaLink || "",
        is_visible: formData.isVisible !== false,
      };

      if (isEditing && exhibition?.id) {
        await apiClient.updateExhibition(
          parseInt(exhibition.id),
          exhibitionData
        );
      } else {
        await apiClient.createExhibition(exhibitionData);
      }

      onSave(formData as Exhibition);
      toast({ title: isEditing ? "Exhibition saved" : "Exhibition created" });
    } catch (error) {
      console.error("Error saving exhibition:", error);
      toast({
        title: "Couldn't save the exhibition",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePosterUpload = async (file: File) => {
    setUploadingPoster(true);
    try {
      const response = await apiClient.uploadImage(file, "exhibition");
      update({ featuredImage: response.file.url });
      toast({ title: "Image uploaded" });
    } catch (error) {
      console.error("Error uploading featured image:", error);
      toast({
        title: "Couldn't upload the image",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setUploadingPoster(false);
      // Reset so choosing the same file again still triggers a change
      if (posterInput.current) posterInput.current.value = "";
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      const responses = await Promise.all(
        Array.from(files).map((file) =>
          apiClient.uploadImage(file, "exhibition")
        )
      );
      const urls = responses.map((response) => response.file.url);
      setFormData((data) => ({
        ...data,
        galleryImages: [...(data.galleryImages || []), ...urls],
      }));
      toast({
        title:
          urls.length === 1
            ? "Image uploaded"
            : `${urls.length} images uploaded`,
      });
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      toast({
        title: "Couldn't upload the images",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setUploadingGallery(false);
      if (galleryInput.current) galleryInput.current.value = "";
    }
  };

  const gallery = formData.galleryImages || [];

  const actions = (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving…" : isEditing ? "Save changes" : "Create exhibition"}
      </Button>
    </>
  );

  return (
    <AdminPage
      onBack={onCancel}
      backLabel="Back to exhibitions"
      title={isEditing ? "Edit exhibition" : "New exhibition"}
      description={
        isEditing
          ? exhibition?.title
          : "Fill in the details, then create the exhibition."
      }
      actions={actions}
    >
      <div className="space-y-10 pt-2">
        <FormSection
          title="Basics"
          description="The status and dates decide where the exhibition appears: upcoming and on-view exhibitions are also shown on the home page."
        >
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field
              id="title"
              label={
                <>
                  Title <span className="text-mist">(required)</span>
                </>
              }
              className="sm:col-span-2"
            >
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. Grace in Threads"
                required
              />
            </Field>

            <Field
              id="slug"
              label="Web address"
              hint="Leave empty to create it from the title."
              className="sm:col-span-2"
            >
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-mist"
                  aria-hidden="true"
                >
                  /exhibition/
                </span>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => update({ slug: e.target.value })}
                  placeholder="grace-in-threads"
                  className="pl-[5.6rem]"
                />
              </div>
            </Field>

            <Field id="status" label="Status">
              <Select
                value={formData.status || "upcoming"}
                onValueChange={(value: "upcoming" | "current" | "past") =>
                  update({ status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="current">On view now</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 sm:self-end">
              <Label htmlFor="isVisible" className="cursor-pointer">
                Show on the website
              </Label>
              <Switch
                id="isVisible"
                checked={formData.isVisible !== false}
                onCheckedChange={(checked) => update({ isVisible: checked })}
              />
            </div>

            <Field id="startDate" label="Opens">
              <Input
                id="startDate"
                type="date"
                value={(formData.startDate || "").slice(0, 10)}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </Field>

            <Field id="endDate" label="Closes">
              <Input
                id="endDate"
                type="date"
                value={(formData.endDate || "").slice(0, 10)}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </Field>

            <Field id="location" label="Location">
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => update({ location: e.target.value })}
                placeholder="e.g. Aether Art Space"
              />
            </Field>

            <Field id="curator" label="Curator">
              <Input
                id="curator"
                value={formData.curator || ""}
                onChange={(e) => update({ curator: e.target.value })}
                placeholder="Name of the curator"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Description"
          description="The introduction shown on the exhibition page and in the Cards view of the Exhibitions page."
        >
          <Label htmlFor="description" className="sr-only">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="What the exhibition is about"
            rows={7}
          />
        </FormSection>

        <FormSection
          title="Images"
          description="The main image is used on cards and at the top of the exhibition page; a portrait poster works best. Gallery images appear further down the page."
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Main image</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex aspect-[3/4] w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-secondary">
                  {formData.featuredImage ? (
                    <img
                      src={imageUrl(formData.featuredImage, { width: 320 })}
                      alt="Main image"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      className="size-6 text-mist"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={posterInput}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePosterUpload(file);
                    }}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingPoster}
                    onClick={() => posterInput.current?.click()}
                  >
                    {uploadingPoster ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload aria-hidden="true" />
                    )}
                    {uploadingPoster
                      ? "Uploading…"
                      : formData.featuredImage
                        ? "Replace image"
                        : "Upload image"}
                  </Button>
                  {formData.featuredImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => update({ featuredImage: "" })}
                      className="text-mist hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">
                  Gallery{" "}
                  <span className="font-normal text-mist">
                    ({gallery.length})
                  </span>
                </p>
                <input
                  ref={galleryInput}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleGalleryUpload(files);
                  }}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingGallery}
                  onClick={() => galleryInput.current?.click()}
                >
                  {uploadingGallery ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload aria-hidden="true" />
                  )}
                  {uploadingGallery ? "Uploading…" : "Add images"}
                </Button>
              </div>
              {gallery.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {gallery.map((image, index) => (
                    <li
                      key={`${image}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-md border bg-secondary"
                    >
                      <img
                        src={imageUrl(image, {
                          width: 240,
                          height: 240,
                          crop: "fill",
                        })}
                        alt={`Gallery image ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                      <IconAction
                        label={`Remove gallery image ${index + 1}`}
                        icon={Trash2}
                        tone="danger"
                        onClick={() =>
                          update({
                            galleryImages: gallery.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                        className="absolute right-1.5 top-1.5 bg-white/90 text-ink shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-mist">
                  No gallery images yet. You can select several at once.
                </p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Artists & artworks"
          description="The artists and works taking part, linked from the exhibition page."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <ChecklistField
              label="Artists"
              emptyText="No artists yet. Add them in the Artists section."
              options={artists.map((artist) => ({
                id: artist.id.toString(),
                label: artist.name,
              }))}
              selected={formData.assignedArtists || []}
              onChange={(assignedArtists) => update({ assignedArtists })}
            />
            <ChecklistField
              label="Artworks"
              emptyText="No artworks yet. Add them in the Artworks section."
              options={artworks.map((artwork) => ({
                id: artwork.id.toString(),
                label: artwork.title,
                detail: artwork.artist_name,
              }))}
              selected={formData.assignedArtworks || []}
              onChange={(assignedArtworks) => update({ assignedArtworks })}
            />
          </div>
        </FormSection>

        <FormSection
          title="Links"
          description="Optional buttons on the exhibition page: an open call for artists and a press release to download."
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="callForArtists" className="cursor-pointer">
                    Call for artists
                  </Label>
                  <p className="mt-1 text-xs text-mist">
                    Shows an “Apply as an artist” button linking to the
                    application form.
                  </p>
                </div>
                <Switch
                  id="callForArtists"
                  checked={formData.callForArtists || false}
                  onCheckedChange={(checked) =>
                    update({ callForArtists: checked })
                  }
                />
              </div>
              {formData.callForArtists && (
                <Field id="ctaLink" label="Application link">
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink || ""}
                    onChange={(e) => update({ ctaLink: e.target.value })}
                    placeholder="https://…"
                  />
                </Field>
              )}
            </div>

            <div className="grid gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-2">
              <Field
                id="pressMediaName"
                label="Press release button"
                hint="Leave empty for “Press release”."
              >
                <Input
                  id="pressMediaName"
                  value={formData.pressMediaName || ""}
                  onChange={(e) => update({ pressMediaName: e.target.value })}
                  placeholder="Press release"
                />
              </Field>
              <Field
                id="pressMediaLink"
                label="Press release link"
                hint="A direct link to the PDF."
              >
                <Input
                  id="pressMediaLink"
                  value={formData.pressMediaLink || ""}
                  onChange={(e) => update({ pressMediaLink: e.target.value })}
                  placeholder="https://example.com/press-release.pdf"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t pt-6">{actions}</div>
      </div>
    </AdminPage>
  );
};

export default ExhibitionForm;
