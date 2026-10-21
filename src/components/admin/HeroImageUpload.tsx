import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage } from "@/lib/apiClient";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { HeroImage } from "@/types/api";
import { ConfirmDelete, IconAction } from "./AdminUI";
import SlideshowSpeed from "./SlideshowSpeed";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

/**
 * The home page photos: upload (pick or drop files), reorder and delete.
 * Changes are saved straight away.
 */
const HeroImageUpload = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchHeroImages = useCallback(async () => {
    try {
      const response = await apiClient.getHeroImages();
      if (response.success) setHeroImages(response.data);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      toast({
        title: "Couldn't load the photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHeroImages();
  }, [fetchHeroImages]);

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    const tooBig = images.filter((file) => file.size > MAX_FILE_SIZE);
    const toUpload = images.filter((file) => file.size <= MAX_FILE_SIZE);
    if (tooBig.length > 0) {
      toast({
        title: "Some photos are too large",
        description: `${tooBig.map((f) => f.name).join(", ")}: the limit is 4 MB per photo.`,
        variant: "destructive",
      });
    }
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.allSettled(
        toUpload.map(async (file, index) => {
          // Upload the file, then add it to the slider (at the end)
          const uploadResponse = await apiClient.uploadImage(file, "hero");
          return apiClient.uploadHeroImage({
            cloudinary_url: uploadResponse.file.url,
            cloudinary_public_id: String(
              uploadResponse.file.publicId || uploadResponse.file.id
            ),
            original_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            width: uploadResponse.file.width,
            height: uploadResponse.file.height,
            format: uploadResponse.file.format,
            display_order: heroImages.length + index,
          });
        })
      );
      const added = results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length;
      await fetchHeroImages();
      if (added > 0) {
        toast({ title: added === 1 ? "Photo added" : `${added} photos added` });
      }
      if (added < toUpload.length) {
        const failure = results.find((r) => r.status === "rejected");
        toast({
          title:
            added === 0
              ? "Couldn't upload the photos"
              : "Some photos couldn't be uploaded",
          description:
            failure?.status === "rejected"
              ? errorMessage(failure.reason, "Please try again.")
              : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: HeroImage) => {
    try {
      await apiClient.deleteHeroImage(image.id);
      await fetchHeroImages();
      toast({ title: "Photo deleted" });
    } catch (error) {
      console.error("Error deleting hero image:", error);
      toast({
        title: "Couldn't delete the photo",
        variant: "destructive",
      });
    }
  };

  // Swap two neighbours, then save the new position of every photo that moved
  const move = async (index: number, by: -1 | 1) => {
    const reordered = [...heroImages];
    [reordered[index], reordered[index + by]] = [
      reordered[index + by],
      reordered[index],
    ];
    setHeroImages(reordered);
    setMoving(true);
    try {
      await Promise.all(
        reordered
          .map((image, position) => ({ image, position }))
          .filter(({ image, position }) => image.display_order !== position)
          .map(({ image, position }) =>
            apiClient.updateHeroImage(image.id, { display_order: position })
          )
      );
    } catch (error) {
      console.error("Error reordering hero images:", error);
      toast({
        title: "Couldn't change the order",
        variant: "destructive",
      });
    } finally {
      await fetchHeroImages();
      setMoving(false);
    }
  };

  if (loading) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-mist">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading photos…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {heroImages.map((image, index) => (
          <li
            key={image.id}
            className="overflow-hidden rounded-lg border bg-white"
          >
            <div className="relative aspect-[16/9] bg-secondary">
              <img
                src={imageUrl(image.cloudinary_url, {
                  width: 640,
                  height: 360,
                  crop: "fill",
                })}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-md bg-ink/75 px-2 py-0.5 text-xs font-medium tabular-nums text-paper">
                {index + 1}
              </span>
            </div>
            <div className="flex items-center gap-2 py-1.5 pl-3 pr-1.5">
              <p
                className="min-w-0 flex-1 truncate text-[13px] text-stone"
                title={image.original_name}
              >
                {image.original_name}
              </p>
              <IconAction
                label="Move earlier"
                icon={ArrowLeft}
                disabled={index === 0 || moving}
                onClick={() => move(index, -1)}
              />
              <IconAction
                label="Move later"
                icon={ArrowRight}
                disabled={index === heroImages.length - 1 || moving}
                onClick={() => move(index, 1)}
              />
              <ConfirmDelete
                title="Delete this photo?"
                description="It will be removed from the home page. This can't be undone."
                onConfirm={() => handleDelete(image)}
              />
            </div>
          </li>
        ))}

        <li
          className={cn(
            "flex min-h-[12rem] rounded-lg border border-dashed transition-colors",
            dragOver ? "border-ink bg-secondary" : "bg-white"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) uploadFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg px-4 py-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-stone">
              {uploading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-medium text-ink">
              {uploading ? "Uploading…" : "Add photos"}
            </span>
            <span className="text-xs text-mist">
              Click or drop files here. Landscape photos, up to 4 MB each.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              uploadFiles(files);
            }}
          />
        </li>
      </ul>
      {heroImages.length === 0 && (
        <p className="text-sm text-mist">
          No photos yet: the home page shows a plain dark background.
        </p>
      )}
      {heroImages.length === 1 && (
        <p className="text-sm text-mist">
          Add another photo to have them change automatically.
        </p>
      )}
      {heroImages.length > 1 && <SlideshowSpeed />}
    </div>
  );
};

export default HeroImageUpload;
