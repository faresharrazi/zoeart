import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useHeroImages } from "@/hooks/useHeroImages";
import FileUpload from "./FileUpload";
import { apiClient } from "@/lib/apiClient";
import {
  Save,
  Edit,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Instagram,
} from "lucide-react";

interface PageContent {
  id: string;
  page: string;
  title: string;
  description: string;
  isVisible: boolean;
}

interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  address: string;
}

interface AboutBlock {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
}

interface PageData {
  home: {
    title: string;
    description: string;
    footerDescription: string;
    galleryHours: string;
    heroImages: string[];
    heroImageIds: number[];
    heroImageFiles?: any[];
  };
  exhibition: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  artists: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  gallery: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  about: {
    title: string;
    description: string;
    isVisible: boolean;
    blocks: AboutBlock[];
  };
  contact: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  contactInfo: ContactInfo;
}

const PageContentManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editingContactInfo, setEditingContactInfo] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  const {
    pageData,
    contactInfo,
    loading: pageDataLoading,
    refreshPageData,
  } = usePageDataFromDB();

  useEffect(() => {
    console.log("PageContentManagement - Page data:", pageData);
    console.log("PageContentManagement - Artists page:", pageData.artists);
    console.log("PageContentManagement - About page:", pageData.about);
  }, [pageData]);

  const {
    heroImages,
    loading: heroImagesLoading,
    refreshHeroImages,
  } = useHeroImages();


  // Exhibition and Contact pages are always visible (handled in the UI logic)

  // Data is now fetched from database via usePageDataFromDB hook

  const tabs = [
    { id: "home", label: "Home" },
    { id: "exhibitions", label: "Exhibitions" },
    { id: "artists", label: "Artists" },
    { id: "gallery", label: "Gallery" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const handleEdit = (pageId: string) => {
    setEditingPage(pageId);
    const pageDataToEdit = pageData[pageId as keyof typeof pageData];

    if (pageId === "home") {
      // For home page, include hero images and content fields in form data
      const formDataToSet = {
        ...pageDataToEdit,
        ...pageDataToEdit?.content, // Include content fields (footerDescription, galleryHours, etc.)
        heroImageIds: pageDataToEdit?.content?.heroImageIds || [],
        heroImages: pageDataToEdit?.content?.heroImages || [],
      };
      
      setFormData(formDataToSet);
    } else if (pageId === "contactInfo") {
      // For contact info, combine page data with contact info
      setFormData({
        ...pageDataToEdit,
        ...contactInfo, // Include contact info fields
      });
    } else {
      setFormData(pageDataToEdit);
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;

    console.log("Admin: Saving page", editingPage, "with data", formData);

    try {
      // Update using database API calls
      if (editingPage === "home") {
        console.log("Admin: Updating home settings");
        // Extract content fields for home page
        const { footerDescription, galleryHours, ...otherFields } = formData;
        const homeData = {
          title: formData.title,
          description: formData.description,
          heroImages: formData.heroImages || [],
          heroImageIds: formData.heroImageIds || [],
          content: {
            footerDescription,
            galleryHours,
          },
        };
        await apiClient.updateHomeSettings(homeData);
        toast({
          title: "Success",
          description: "Home settings updated successfully",
        });
      } else if (editingPage === "contactInfo") {
        console.log("Admin: Updating contact info");
        await apiClient.updateContactInfo(formData);
        toast({
          title: "Success",
          description: "Contact info updated successfully",
        });
      } else {
        console.log("Admin: Updating page settings");
        await apiClient.updatePageContent(editingPage, {
          title: formData.title,
          description: formData.description,
          content: formData,
          isVisible:
            pageData[editingPage as keyof typeof pageData]?.isVisible || false,
        });
        toast({
          title: "Success",
          description: "Page content updated successfully",
        });
      }

      // Refresh data from database after successful save
      await refreshPageData();
    } catch (error) {
      console.error("Error updating page content:", error);
      toast({
        title: "Error",
        description: "Failed to update page content",
        variant: "destructive",
      });
    }

    setEditingPage(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingPage(null);
    setEditingContactInfo(false);
    setFormData({});
  };

  const togglePageVisibility = async (pageId: string) => {
    if (pageId === "home" || pageId === "exhibitions" || pageId === "contact")
      return; // These pages cannot be hidden

    const currentVisibility = pageData[pageId as keyof typeof pageData]?.isVisible;
    const newVisibility = !currentVisibility;

    console.log("TogglePageVisibility - Page:", pageId);
    console.log("TogglePageVisibility - Current visibility:", currentVisibility);
    console.log("TogglePageVisibility - New visibility:", newVisibility);

    try {
      // Update using database API
      await apiClient.updatePageContent(pageId, {
        isVisible: newVisibility,
      });

      // Refresh data from database
      await refreshPageData();

      toast({
        title: "Success",
        description: `Page ${pageId} ${
          newVisibility ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling page visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update page visibility",
        variant: "destructive",
      });
    }
  };

  const toggleBlockVisibility = async (blockId: string) => {
    const newBlocks =
      pageData.about?.content?.content?.blocks?.map((block) =>
        block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
      ) || [];

    try {
      // Update using database API
      await apiClient.updatePageContent("about", {
        content: {
          ...pageData.about?.content,
          content: {
            ...pageData.about?.content?.content,
            blocks: newBlocks,
          },
        },
      });

      // Refresh data from database
      await refreshPageData();
    } catch (error) {
      console.error("Error toggling block visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update block visibility",
        variant: "destructive",
      });
    }
  };

  const [blockFormData, setBlockFormData] = useState<Record<string, any>>({});

  const updateBlockContent = (
    blockId: string,
    field: string,
    value: string
  ) => {
    setBlockFormData((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [field]: value,
      },
    }));
  };

  const saveBlockContent = async (blockId: string) => {
    const blockData = blockFormData[blockId];
    if (!blockData) return;

    const newBlocks =
      pageData.about?.content?.content?.blocks?.map((block) =>
        block.id === blockId ? { ...block, ...blockData } : block
      ) || [];

    try {
      // Update using database API
      await apiClient.updatePageContent("about", {
        content: {
          ...pageData.about?.content,
          content: {
            ...pageData.about?.content?.content,
            blocks: newBlocks,
          },
        },
      });

      // Refresh data from database
      await refreshPageData();

      // Clear the form data for this block
      setBlockFormData((prev) => {
        const newData = { ...prev };
        delete newData[blockId];
        return newData;
      });

      toast({
        title: "Success",
        description: "Block content updated successfully",
      });
    } catch (error) {
      console.error("Error saving block content:", error);
      toast({
        title: "Error",
        description: "Failed to update block content",
        variant: "destructive",
      });
    }
  };

  // Function to get neutral block names for admin interface
  const getBlockDisplayName = (blockId: string) => {
    const blockNames: Record<string, string> = {
      block1: "Block 1",
      block2: "Block 2",
      block3: "Block 3",
    };
    return blockNames[blockId] || blockId;
  };

  const renderTabContent = () => {
    const currentData = pageData[activeTab as keyof typeof pageData];
    const isEditing = editingPage === activeTab;

    // Show loading state if data is not yet loaded
    if (pageDataLoading || !currentData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page data...</p>
          </div>
        </div>
      );
    }

    if (activeTab === "home") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Home Page
                <Badge variant="outline">Always Visible</Badge>
              </CardTitle>
              {!isEditing && (
                <Button onClick={() => handleEdit("home")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Hero Title</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter hero title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Hero Description
                  </Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter hero description"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Footer Description
                  </Label>
                  <Textarea
                    value={formData.footerDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footerDescription: e.target.value,
                      })
                    }
                    placeholder="Enter footer description"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Gallery Hours</Label>
                  <Textarea
                    value={formData.galleryHours || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, galleryHours: e.target.value })
                    }
                    placeholder="Enter gallery hours"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Hero Images</Label>
                  <div className="mt-2">
                    <FileUpload
                      category="hero_image"
                      onFilesChange={(files) => {
                        setFormData({
                          ...formData,
                          heroImages: files.map((file) => file.url),
                          heroImageIds: files.map((file) => file.id),
                          heroImageFiles: files,
                        });
                      }}
                      existingFiles={heroImages || []}
                      maxFiles={10}
                      onRefresh={refreshHeroImages}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Add multiple images for a slideshow effect. Single image
                      will show static.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Hero Title
                  </h4>
                  <p className="text-theme-text-muted">
                    {currentData?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Hero Description
                  </h4>
                  <p className="text-theme-text-muted">
                    {currentData?.description || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Footer Description
                  </h4>
                  <p className="text-theme-text-muted whitespace-pre-line">
                    {currentData?.content?.footerDescription || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Gallery Hours
                  </h4>
                  <p className="text-theme-text-muted whitespace-pre-line">
                    {currentData?.content?.galleryHours || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Hero Images ({currentData?.heroImages?.length || 0})
                  </h4>
                  {currentData?.heroImages &&
                  currentData?.heroImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentData?.heroImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Hero image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-theme-text-muted">
                      No hero images configured
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "about") {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  About Page
                  <Badge
                    variant={currentData?.isVisible ? "default" : "secondary"}
                  >
                    {currentData?.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button onClick={() => handleEdit("about")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Page Title</Label>
                    <Input
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter page title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Page Description
                    </Label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter page description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-theme-text-primary mb-2">
                      Page Title
                    </h4>
                    <p className="text-theme-text-muted">
                      {currentData?.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-theme-text-primary mb-2">
                      Page Description
                    </h4>
                    <p className="text-theme-text-muted">
                      {currentData?.description || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-text-primary">
              Content Blocks
            </h3>
            {(currentData?.content?.content?.blocks || []).map((block) => (
              <Card key={block.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getBlockDisplayName(block.id)}
                      <Badge
                        variant={block.isVisible ? "default" : "secondary"}
                      >
                        {block.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBlockVisibility(block.id)}
                        className={
                          block.isVisible ? "text-orange-600" : "text-green-600"
                        }
                      >
                        {block.isVisible ? (
                          <EyeOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {block.isVisible ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Block Title</Label>
                      <Input
                        value={blockFormData[block.id]?.title ?? block.title}
                        onChange={(e) =>
                          updateBlockContent(block.id, "title", e.target.value)
                        }
                        placeholder="Enter block title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Block Content
                      </Label>
                      <Textarea
                        value={
                          blockFormData[block.id]?.content ?? block.content
                        }
                        onChange={(e) =>
                          updateBlockContent(
                            block.id,
                            "content",
                            e.target.value
                          )
                        }
                        placeholder="Enter block content"
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveBlockContent(block.id)}
                        disabled={!blockFormData[block.id]}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Block
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Hide Page Button - Bottom of About Page */}
          <div className="mt-6 pt-4 border-t border-theme-border">
            <Button
              variant="outline"
              onClick={() => togglePageVisibility("about")}
              className={`w-full sm:w-auto ${
                currentData?.isVisible
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
              }`}
            >
              {currentData?.isVisible ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {currentData?.isVisible ? "Hide About Page" : "Show About Page"}
            </Button>
          </div>
        </div>
      );
    }

    // For other pages (exhibition, artists, gallery, contact)
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {tabs.find((tab) => tab.id === activeTab)?.label} Page
                {activeTab === "home" ||
                activeTab === "exhibitions" ||
                activeTab === "contact" ? (
                  <Badge variant="outline">Always Visible</Badge>
                ) : (
                  <Badge
                    variant={currentData?.isVisible ? "default" : "secondary"}
                  >
                    {currentData?.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {!isEditing && (
                  <Button onClick={() => handleEdit(activeTab)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Content
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Page Title</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter page title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Page Description
                  </Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter page description"
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Page Title
                  </h4>
                  <p className="text-theme-text-muted">
                    {currentData?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Page Description
                  </h4>
                  <p className="text-theme-text-muted">
                    {currentData?.description || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information Section - Only for Contact tab */}
        {activeTab === "contact" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Contact Information
                </CardTitle>
                {!editingContactInfo && (
                  <Button
                    onClick={() => {
                      setEditingContactInfo(true);
                      setFormData({
                        ...contactInfo,
                      });
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Contact Info
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingContactInfo ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      value={formData.instagram || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="Enter Instagram handle"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Textarea
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter full address"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          await apiClient.updateContactInfo(formData);
                          await refreshPageData();
                          setEditingContactInfo(false);
                          setFormData({});
                          toast({
                            title: "Success",
                            description: "Contact info updated successfully",
                          });
                        } catch (error) {
                          console.error("Error updating contact info:", error);
                          toast({
                            title: "Error",
                            description: "Failed to update contact info",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingContactInfo(false);
                        setFormData({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          Email
                        </p>
                        <p className="text-theme-text-muted">
                          {contactInfo?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          Phone
                        </p>
                        <p className="text-theme-text-muted">
                          {contactInfo?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          Instagram
                        </p>
                        <p className="text-theme-text-muted">
                          {contactInfo?.instagram || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          Address
                        </p>
                        <p className="text-theme-text-muted">
                          {contactInfo?.address || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hide Page Button - Bottom of Other Pages (exhibition, artists, gallery) */}
        {activeTab !== "home" &&
          activeTab !== "exhibitions" &&
          activeTab !== "contact" && (
            <div className="mt-6 pt-4 border-t border-theme-border">
              <Button
                variant="outline"
                onClick={() => togglePageVisibility(activeTab)}
                className={`w-full sm:w-auto ${
                  currentData?.isVisible
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                }`}
              >
                {currentData?.isVisible ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {currentData?.isVisible
                  ? `Hide ${
                      tabs.find((tab) => tab.id === activeTab)?.label
                    } Page`
                  : `Show ${
                      tabs.find((tab) => tab.id === activeTab)?.label
                    } Page`}
              </Button>
            </div>
          )}
      </div>
    );
  };

  // Show loading state if data is not yet loaded
  if (pageDataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-theme-text-primary">
          Page Content Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Info",
                description: "Exhibition and Contact pages are always visible",
              });
            }}
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4 mr-2" />
            Refresh Core Pages
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Site
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-theme-border">
        <nav className="flex overflow-x-auto space-x-2 sm:space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-theme-text-muted hover:text-theme-text-primary hover:border-theme-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default PageContentManagement;
