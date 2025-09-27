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
import { apiClient } from "@/lib/apiClient";
import { Edit, Eye, EyeOff, Save, X } from "lucide-react";
import HomePageEditor from "./HomePageEditor";
import AboutPageEditor from "./AboutPageEditor";
import ContactPageEditor from "./ContactPageEditor";

const PageContentManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  const {
    pageData,
    contactInfo,
    loading: pageDataLoading,
    refreshPageData,
  } = usePageDataFromDB();

  const tabs = [
    { id: "home", label: "Home", alwaysVisible: true },
    { id: "exhibitions", label: "Exhibitions", alwaysVisible: true },
    { id: "artists", label: "Artists", alwaysVisible: false },
    { id: "gallery", label: "Gallery", alwaysVisible: false },
    { id: "about", label: "About", alwaysVisible: false },
    { id: "contact", label: "Contact", alwaysVisible: true },
  ];

  const handleEdit = (pageId: string) => {
    const currentData = pageData[pageId as keyof typeof pageData];
    if (currentData) {
      setFormData(currentData);
      setEditingPage(pageId);
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;

    try {
      await apiClient.updatePageContent(editingPage, formData);
      await refreshPageData();
      setEditingPage(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
    } catch (error) {
      console.error("Error saving page content:", error);
      toast({
        title: "Error",
        description: "Failed to save page content",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
    setFormData({});
  };

  const togglePageVisibility = async (pageId: string) => {
    const currentData = pageData[pageId as keyof typeof pageData];
    if (!currentData) return;

    try {
      await apiClient.updatePageContent(pageId, {
        ...currentData,
        isVisible: !currentData.isVisible,
      });
      await refreshPageData();
      toast({
        title: "Success",
        description: `Page ${
          !currentData.isVisible ? "shown" : "hidden"
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

  const renderTabContent = () => {
    const currentData = pageData[activeTab as keyof typeof pageData];
    const isEditing = editingPage === activeTab;

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

    // Use specialized components for complex pages
    if (activeTab === "home") {
      return (
        <HomePageEditor
          pageData={currentData}
          isEditing={isEditing}
          onEdit={() => handleEdit("home")}
          onSave={handleSave}
          onCancel={handleCancel}
          formData={formData}
          setFormData={setFormData}
          refreshPageData={refreshPageData}
        />
      );
    }

    if (activeTab === "about") {
      return <AboutPageEditor />;
    }

    if (activeTab === "contact") {
      return (
        <ContactPageEditor
          pageData={currentData}
          contactInfo={contactInfo}
          isEditing={isEditing}
          onEdit={() => handleEdit("contact")}
          onSave={handleSave}
          onCancel={handleCancel}
          formData={formData}
          setFormData={setFormData}
          onRefresh={refreshPageData}
        />
      );
    }

    // Generic page editor for simple pages
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {currentTab?.label} Page
              {!currentTab?.alwaysVisible && (
                <Badge
                  variant={currentData?.isVisible ? "default" : "secondary"}
                >
                  {currentData?.isVisible ? "Visible" : "Hidden"}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!currentTab?.alwaysVisible && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePageVisibility(activeTab)}
                >
                  {currentData?.isVisible ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show
                    </>
                  )}
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
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter page title"
                />
              </div>

              <div>
                <Label htmlFor="page-description">Page Description</Label>
                <Textarea
                  id="page-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              {!currentTab?.alwaysVisible && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="page-visible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVisible: checked })
                    }
                  />
                  <Label htmlFor="page-visible">Page Visible</Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Title</h3>
                <p className="text-gray-600">
                  {currentData?.title || "Not set"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-gray-600">
                  {currentData?.description || "Not set"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <h2 className="text-xl sm:text-2xl text-theme-text-primary">
          Page Content Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
          {tabs.map((tab) => {
            const currentData = pageData[tab.id as keyof typeof pageData];
            const isVisible = currentData?.isVisible;

            return (
              <div key={tab.id} className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-theme-primary text-theme-primary"
                      : "border-transparent text-theme-text-muted hover:text-theme-text-primary hover:border-theme-border"
                  }`}
                >
                  {tab.label}
                </button>
                {!tab.alwaysVisible && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePageVisibility(tab.id);
                      }}
                      className="h-6 w-6 p-0"
                      title={isVisible ? "Hide from menu" : "Show in menu"}
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3 text-green-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default PageContentManagement;
