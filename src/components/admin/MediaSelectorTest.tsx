import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fileService } from "@/lib/database";

const MediaSelectorTest = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Test handleFileSelect called");
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
      const fileUrl = await fileService.uploadImage(file, "exhibitions");

      setUploadedUrl(fileUrl);

      toast({
        title: "Image Uploaded",
        description: `${file.name} has been uploaded successfully.`,
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

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Media Selector Test</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="mb-4"
      />
      {isUploading && <p>Uploading...</p>}
      {uploadedUrl && (
        <div>
          <p>Uploaded successfully!</p>
          <img
            src={uploadedUrl}
            alt="Uploaded"
            className="w-32 h-32 object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default MediaSelectorTest;
