import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, X, Search, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document";
}

interface MediaSelectorProps {
  selectedImage?: string;
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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load media files on component mount
  useEffect(() => {
    const loadMediaFiles = async () => {
      try {
        setLoading(true);
        const files = await apiClient.getFiles();
        const mediaFiles: MediaFile[] = files.map((file: any) => ({
          id: file.id.toString(),
          name: file.originalName || file.filename,
          url: `/api/file/${file.id}`,
          type: file.mimeType?.startsWith("image/") ? "image" : "document",
        }));
        setMediaFiles(mediaFiles);
      } catch (error) {
        console.error("Error loading media files:", error);
        toast({
          title: "Error",
          description: "Failed to load media files",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMediaFiles();
  }, [toast]);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload file to server
      const response = await apiClient.uploadFile(
        file,
        type === "all" ? "exhibition" : type
      );
      const newFile: MediaFile = {
        id: response.file.id.toString(),
        name: response.file.originalName,
        url: `/api/file/${response.file.id}`,
        type: "image",
      };

      // Add to media files and auto-select
      setMediaFiles([newFile, ...mediaFiles]);
      onSelect(newFile.url);

      toast({
        title: "Image Uploaded",
        description: `${file.name} has been uploaded and added to the media library.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
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
    const matchesType =
      type === "all" ||
      (type === "artwork" && file.name.includes("artwork")) ||
      (type === "artist" && file.name.includes("artist")) ||
      (type === "exhibition" &&
        (file.name.includes("gallery") || file.name.includes("exhibition")));

    return matchesSearch && (type === "all" || matchesType);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg ">Select Image</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleUpload} className="">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
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
                  <div className="absolute inset-0 bg-theme-primary/20 flex items-center justify-center rounded-lg">
                    <div className="bg-theme-primary rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <p className="text-xs text-center mt-2 truncate">{file.name}</p>
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No images found</p>
              <p className="text-sm">
                Try uploading a new image or adjusting your search
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} disabled={!selectedImage} className="">
              Select Image
            </Button>
          </div>

          {/* Hidden file input for uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaSelector;
