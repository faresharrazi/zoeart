import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, X, Search, Loader2 } from "lucide-react";
import { fileService } from "@/lib/database";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document";
}

// Mock media files - updated to match actual website assets
const mockMediaFiles: MediaFile[] = [
  {
    id: "1",
    name: "gallery-hero.jpg",
    url: "/src/assets/gallery-hero.jpg",
    type: "image",
  },
  {
    id: "2",
    name: "artwork-abstract-1.jpg",
    url: "/src/assets/artwork-abstract-1.jpg",
    type: "image",
  },
  {
    id: "3",
    name: "artwork-geometric-1.jpg",
    url: "/src/assets/artwork-geometric-1.jpg",
    type: "image",
  },
  {
    id: "4",
    name: "artwork-portrait-1.jpg",
    url: "/src/assets/artwork-portrait-1.jpg",
    type: "image",
  },
  {
    id: "5",
    name: "artwork-abstract-2.jpg",
    url: "/src/assets/artwork-abstract-2.jpg",
    type: "image",
  },
  {
    id: "6",
    name: "artwork-landscape-1.jpg",
    url: "/src/assets/artwork-landscape-1.jpg",
    type: "image",
  },
  {
    id: "7",
    name: "artwork-sculpture-1.jpg",
    url: "/src/assets/artwork-sculpture-1.jpg",
    type: "image",
  },
  {
    id: "8",
    name: "artist-alex-rivera.jpg",
    url: "/src/assets/artist-alex-rivera.jpg",
    type: "image",
  },
  {
    id: "9",
    name: "artist-david-thompson.jpg",
    url: "/src/assets/artist-david-thompson.jpg",
    type: "image",
  },
  {
    id: "10",
    name: "artist-elena-rodriguez.jpg",
    url: "/src/assets/artist-elena-rodriguez.jpg",
    type: "image",
  },
  {
    id: "11",
    name: "artist-luna-park.jpg",
    url: "/src/assets/artist-luna-park.jpg",
    type: "image",
  },
  {
    id: "12",
    name: "artist-marcus-chen.jpg",
    url: "/src/assets/artist-marcus-chen.jpg",
    type: "image",
  },
  {
    id: "13",
    name: "artist-sarah-williams.jpg",
    url: "/src/assets/artist-sarah-williams.jpg",
    type: "image",
  },
];

interface MediaSelectorProps {
  selectedImage: string | undefined;
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
  type?: "artwork" | "artist" | "exhibition" | "all";
}

const MediaSelector = ({
  selectedImage,
  onSelect,
  onClose,
  type = "all",
}: MediaSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("handleFileSelect called");
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type);
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting upload...");
    setIsUploading(true);

    try {
      // Upload to Supabase storage
      const fileUrl = await fileService.uploadImage(
        file,
        type as "artworks" | "artists" | "exhibitions"
      );

      // Create new media file entry
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name,
        url: fileUrl,
        type: "image",
      };

      // Add to media files and auto-select
      setMediaFiles([newFile, ...mediaFiles]);
      onSelect(fileUrl);

      toast({
        title: "Image Uploaded",
        description: `${file.name} has been uploaded and selected.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }

    // Clear the input
    if (event.target) {
      event.target.value = "";
    }
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (type === "all") return matchesSearch;
    return matchesSearch && file.type === "image";
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Select Media</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleUpload}
                className="bg-gallery-gold hover:bg-gallery-gold/90"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`relative cursor-pointer group ${
                    selectedImage === file.url ? "ring-2 ring-gallery-gold" : ""
                  }`}
                  onClick={() => onSelect(file.url)}
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gallery-light-grey">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {selectedImage === file.url && (
                    <div className="absolute inset-0 bg-gallery-gold/20 flex items-center justify-center rounded-lg">
                      <div className="bg-gallery-gold rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center mt-2 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>

            {filteredFiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No images found. Try uploading a new image or adjusting your
                search.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedImage) {
                  onSelect(selectedImage);
                }
                onClose();
              }}
              className="bg-gallery-gold hover:bg-gallery-gold/90"
            >
              Select
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MediaSelector;
