import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Eye } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document";
  size: string;
  uploadDate: string;
}

const MediaLibrary = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "image" | "document"
  >("all");
  const { toast } = useToast();

  const handleUpload = () => {
    // In a real implementation, this would open a file picker
    toast({
      title: "Upload Feature",
      description:
        "File upload functionality would be implemented here with your backend storage solution.",
    });
  };

  const handleDelete = (id: string) => {
    setMediaFiles(mediaFiles.filter((file) => file.id !== id));
    toast({
      title: "Success",
      description: "Media file deleted successfully",
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Image URL copied to clipboard",
    });
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl ">Media Library</h2>
        <Button onClick={handleUpload} className="">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden bg-theme-surface">
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl text-muted-foreground">📄</div>
                </div>
              )}
            </div>

            <CardContent className="p-3">
              <h3 className=" text-sm truncate mb-1">{file.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">{file.size}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {new Date(file.uploadDate).toLocaleDateString()}
              </p>

              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(file.url, "_blank")}
                  className="flex-1 text-xs"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(file.url)}
                  className="flex-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(file.id)}
                  className="text-destructive hover:text-destructive text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className=" mb-2">No files found</h3>
              <p className="text-sm">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first media file to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Upload:</strong> Click "Upload Files" to add new images
              or documents
            </p>
            <p>
              • <strong>Copy URL:</strong> Use the copy button to get the file
              URL for use in artwork or page content
            </p>
            <p>
              • <strong>Preview:</strong> Click the eye icon to view the
              full-size image
            </p>
            <p>
              • <strong>Organize:</strong> Use search and filters to find
              specific files quickly
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaLibrary;
