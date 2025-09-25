import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface UploadedFile {
  id: number;
  originalName: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
}

interface FileUploadProps {
  category: string;
  onFilesChange: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
  accept?: string;
  onRefresh?: () => void;
}

const FileUpload = ({
  category,
  onFilesChange,
  existingFiles = [],
  maxFiles = 10,
  accept = "image/*",
  onRefresh,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync internal state with existingFiles prop
  useEffect(() => {
    console.log("FileUpload - Received existingFiles:", existingFiles);
    setFiles(existingFiles);
  }, [existingFiles]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const response = await apiClient.uploadFile(file, category);
        return response.file;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newFiles = [...files, ...uploadedFiles];

      setFiles(newFiles);
      onFilesChange(newFiles);

      toast({
        title: "Upload successful",
        description: `${uploadedFiles.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = async (fileId: number) => {
    try {
      await apiClient.deleteFile(fileId);

      // Update local state immediately
      const newFiles = files.filter((file) => file.id !== fileId);
      setFiles(newFiles);
      onFilesChange(newFiles);

      // Refresh the hero images if callback is provided
      if (onRefresh) {
        await onRefresh();
      }

      toast({
        title: "File deleted",
        description: "File has been removed successfully.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Upload Images</p>
              <p className="text-sm text-gray-500">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-400">
                Max {maxFiles} files, up to 10MB each
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || files.length >= maxFiles}
              className="mt-4"
            >
              {uploading ? "Uploading..." : "Select Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => {
              console.log("FileUpload - Rendering file:", file);
              return (
                <Card key={file.id} className="relative group">
                  <CardContent className="p-4">
                  <div className="aspect-square relative mb-2">
                    {imageLoadingStates[file.id] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-sm text-gray-500">Loading...</div>
                      </div>
                    )}
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover rounded-lg"
                      onLoadStart={() => {
                        setImageLoadingStates(prev => ({ ...prev, [file.id]: true }));
                      }}
                      onError={(e) => {
                        console.error("Image failed to load:", file.url, e);
                        setImageLoadingStates(prev => ({ ...prev, [file.id]: false }));
                        e.currentTarget.src = "https://via.placeholder.com/300x300/393E46/FFFFFF?text=Re-upload+Required";
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", file.url);
                        setImageLoadingStates(prev => ({ ...prev, [file.id]: false }));
                      }}
                    />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Upload images to see them here</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
