import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import {
  getPageSettings,
  getContactInfo,
  getHomeSettings,
  updatePageSettings,
  updateContactInfo,
  updateHomeSettings,
  ensureCorePagesVisible,
} from "@/lib/pageSettings";

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
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  // Ensure Exhibition and Contact pages are always visible
  useEffect(() => {
    ensureCorePagesVisible();
  }, []);

  // Get fresh data from service
  const pageSettings = getPageSettings();
  const contactInfo = getContactInfo();
  const homeSettings = getHomeSettings();

  const pageData: PageData = {
    home: homeSettings,
    exhibition: pageSettings.exhibition,
    artists: pageSettings.artists,
    gallery: pageSettings.gallery,
    about: pageSettings.about,
    contact: pageSettings.contact,
    contactInfo: contactInfo,
  };

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "exhibition", label: "Exhibitions", icon: "🎨" },
    { id: "artists", label: "Artists", icon: "👨‍🎨" },
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "about", label: "About", icon: "ℹ️" },
    { id: "contact", label: "Contact", icon: "📞" },
    { id: "contactInfo", label: "Contact Info", icon: "📋" },
  ];

  const handleEdit = (pageId: string) => {
    setEditingPage(pageId);
    setFormData(pageData[pageId as keyof PageData]);
  };

  const handleSave = () => {
    if (!editingPage) return;

    console.log("Admin: Saving page", editingPage, "with data", formData);

    // Update using direct service calls
    if (editingPage === "home") {
      console.log("Admin: Updating home settings");
      updateHomeSettings(formData);
    } else if (editingPage === "contactInfo") {
      console.log("Admin: Updating contact info");
      updateContactInfo(formData);
    } else {
      console.log("Admin: Updating page settings");
      updatePageSettings({
        [editingPage]: {
          ...pageData[editingPage as keyof PageData],
          ...formData,
        },
      });
    }

    toast({
      title: "Success",
      description: "Page content updated successfully",
    });

    setEditingPage(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingPage(null);
    setFormData({});
  };

  const togglePageVisibility = (pageId: string) => {
    if (pageId === "home" || pageId === "exhibition" || pageId === "contact")
      return; // These pages cannot be hidden

    const newVisibility = !pageData[pageId as keyof PageData].isVisible;

    // Update using direct service call
    updatePageSettings({
      [pageId]: {
        ...pageData[pageId as keyof PageData],
        isVisible: newVisibility,
      },
    });

    toast({
      title: "Success",
      description: `Page ${pageId} ${
        newVisibility ? "shown" : "hidden"
      } successfully`,
    });
  };

  const toggleBlockVisibility = (blockId: string) => {
    const newBlocks = pageData.about.blocks.map((block) =>
      block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
    );

    // Update using direct service call
    updatePageSettings({
      about: {
        ...pageData.about,
        blocks: newBlocks,
      },
    });
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

  const saveBlockContent = (blockId: string) => {
    const blockData = blockFormData[blockId];
    if (!blockData) return;

    const newBlocks = pageData.about.blocks.map((block) =>
      block.id === blockId ? { ...block, ...blockData } : block
    );

    // Update using direct service call
    updatePageSettings({
      about: {
        ...pageData.about,
        blocks: newBlocks,
      },
    });

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
    const currentData = pageData[activeTab as keyof PageData];
    const isEditing = editingPage === activeTab;

    if (activeTab === "home") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🏠 Home Page
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
                  <p className="text-theme-text-muted">{currentData.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Hero Description
                  </h4>
                  <p className="text-theme-text-muted">
                    {currentData.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Footer Description
                  </h4>
                  <p className="text-theme-text-muted whitespace-pre-line">
                    {currentData.footerDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text-primary mb-2">
                    Gallery Hours
                  </h4>
                  <p className="text-theme-text-muted whitespace-pre-line">
                    {currentData.galleryHours}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "contactInfo") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                📋 Contact Information
                <Badge variant="outline">Used in Footer & Contact Page</Badge>
              </CardTitle>
              {!isEditing && (
                <Button onClick={() => handleEdit("contactInfo")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact Info
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-theme-primary" />
                    <div>
                      <p className="font-medium text-theme-text-primary">
                        Email
                      </p>
                      <p className="text-theme-text-muted">
                        {currentData.email}
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
                        {currentData.phone}
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
                        {currentData.instagram}
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
                        {currentData.address}
                      </p>
                    </div>
                  </div>
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
                  ℹ️ About Page
                  <Badge
                    variant={currentData.isVisible ? "default" : "secondary"}
                  >
                    {currentData.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  {activeTab !== "home" && (
                    <Button
                      variant="outline"
                      onClick={() => togglePageVisibility("about")}
                      className={
                        currentData.isVisible
                          ? "text-orange-600"
                          : "text-green-600"
                      }
                    >
                      {currentData.isVisible ? (
                        <EyeOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {currentData.isVisible ? "Hide Page" : "Show Page"}
                    </Button>
                  )}
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
                    <p className="text-theme-text-muted">{currentData.title}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-theme-text-primary mb-2">
                      Page Description
                    </h4>
                    <p className="text-theme-text-muted">
                      {currentData.description}
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
            {currentData.blocks.map((block) => (
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
        </div>
      );
    }

    // For other pages (exhibition, artists, gallery, contact)
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {tabs.find((tab) => tab.id === activeTab)?.icon}{" "}
              {tabs.find((tab) => tab.id === activeTab)?.label} Page
              {activeTab === "home" ||
              activeTab === "exhibition" ||
              activeTab === "contact" ? (
                <Badge variant="outline">Always Visible</Badge>
              ) : (
                <Badge
                  variant={currentData.isVisible ? "default" : "secondary"}
                >
                  {currentData.isVisible ? "Visible" : "Hidden"}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {activeTab !== "home" &&
                activeTab !== "exhibition" &&
                activeTab !== "contact" && (
                  <Button
                    variant="outline"
                    onClick={() => togglePageVisibility(activeTab)}
                    className={
                      currentData.isVisible
                        ? "text-orange-600"
                        : "text-green-600"
                    }
                  >
                    {currentData.isVisible ? (
                      <EyeOff className="w-4 h-4 mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {currentData.isVisible ? "Hide Page" : "Show Page"}
                  </Button>
                )}
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
                <Label className="text-sm font-medium">Page Description</Label>
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
                <p className="text-theme-text-muted">{currentData.title}</p>
              </div>
              <div>
                <h4 className="font-semibold text-theme-text-primary mb-2">
                  Page Description
                </h4>
                <p className="text-theme-text-muted">
                  {currentData.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-theme-text-primary">
          Page Content Management
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              ensureCorePagesVisible();
              toast({
                title: "Success",
                description:
                  "Exhibition and Contact pages refreshed to be visible",
              });
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Refresh Core Pages
          </Button>
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Site
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-theme-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-theme-text-muted hover:text-theme-text-primary hover:border-theme-border"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
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
