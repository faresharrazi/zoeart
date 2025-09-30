import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHeroImages } from "@/hooks/useHeroImages";
import FileUpload from "../FileUpload";
import { apiClient } from "@/lib/apiClient";
import { Edit, Save, X } from "lucide-react";

interface HomePageEditorProps {
  pageData: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  formData: any;
  setFormData: (data: any) => void;
  refreshPageData?: () => void;
}

const HomePageEditor = ({
  pageData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  formData,
  setFormData,
  refreshPageData,
}: HomePageEditorProps) => {
  const { toast } = useToast();
  const { heroImages, refreshHeroImages } = useHeroImages();

  // Debug: Log hero images data
  console.log("HomePageEditor - heroImages:", heroImages);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Home Page
            <Badge variant="outline">Always Visible</Badge>
          </CardTitle>
          {!isEditing && (
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Content
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="home-title">Page Title</Label>
              <Input
                id="home-title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter page title"
              />
            </div>

            <div>
              <Label htmlFor="home-description">Page Description</Label>
              <Textarea
                id="home-description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter page description"
                rows={3}
              />
            </div>

            <div>
              <Label>Hero Images</Label>
              <div className="space-y-4">
                <FileUpload
                  category="hero"
                  existingFiles={heroImages}
                  onFilesChange={async (files) => {
                    // Update form data with new hero images
                    const newImageUrls = files.map((file) => file.url);
                    const newImageIds = files.map((file) => file.id);
                    const updatedFormData = {
                      ...formData,
                      heroImages: newImageUrls,
                      heroImageIds: newImageIds,
                    };

                    setFormData(updatedFormData);

                    // Auto-save the hero images to the home page
                    try {
                      await apiClient.updatePageContent("home", {
                        content: {
                          heroImages: newImageUrls,
                          heroImageIds: newImageIds,
                        },
                      });
                      if (refreshPageData) {
                        await refreshPageData();
                      }
                      toast({
                        title: "Success",
                        description:
                          "Hero images updated and saved successfully",
                      });
                    } catch (error) {
                      console.error("Error updating hero images:", error);
                      toast({
                        title: "Error",
                        description: "Failed to update hero images",
                        variant: "destructive",
                      });
                    }
                  }}
                  accept="image/*"
                  onRefresh={refreshHeroImages}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Title</h3>
              <p className="text-gray-600">{pageData?.title || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-600">
                {pageData?.description || "Not set"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Hero Images</h3>
              <p className="text-gray-600">
                {pageData?.heroImages?.length || 0} image(s) uploaded
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomePageEditor;
