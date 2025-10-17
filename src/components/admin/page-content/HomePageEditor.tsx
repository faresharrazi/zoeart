import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// Removed old useHeroImages import - now using HeroImageUpload component
import FileUpload from "../FileUpload";
import HeroImageUpload from "../HeroImageUpload";
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
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [heroImagesLoading, setHeroImagesLoading] = useState(true);

  // Fetch hero images from the new hero_images table
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        setHeroImagesLoading(true);
        const response = await apiClient.getHeroImages();
        setHeroImages(response || []);
      } catch (error) {
        console.error("Error fetching hero images:", error);
        setHeroImages([]);
      } finally {
        setHeroImagesLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

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
                <HeroImageUpload
                  onImagesChange={(images) => {
                    console.log("Hero images changed:", images);
                    // Hero images are now managed by the HeroImageUpload component
                    // No need to save to page_content table anymore
                  }}
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
                {heroImagesLoading ? "Loading..." : `${heroImages.length} image(s) uploaded`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomePageEditor;
