import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Edit, Eye, Image } from "lucide-react";
import MediaSelector from "./MediaSelector";

interface PageContent {
  id: string;
  page: string;
  section: string;
  title?: string;
  content: string;
  imageUrl?: string;
}

const mockPageContent: PageContent[] = [
  {
    id: "1",
    page: "home",
    section: "hero",
    title: "Discover Contemporary Art",
    content:
      "Explore our curated collection of contemporary artworks from emerging and established artists around the world.",
    imageUrl: "/src/assets/gallery-hero.jpg",
  },
  {
    id: "2",
    page: "home",
    section: "subtitle",
    content: "Where Art Meets Innovation",
  },
  {
    id: "3",
    page: "about",
    section: "main",
    title: "About Zωή Art Gallery",
    content:
      "Founded in 2020, Zωή Art Gallery has been at the forefront of contemporary art, showcasing innovative works that challenge and inspire. Our mission is to create a bridge between artists and art lovers, fostering dialogue and appreciation for contemporary artistic expression.\n\nOur carefully curated collection features works from both emerging and established artists, spanning various mediums from traditional painting and sculpture to digital art and multimedia installations. We believe in the power of art to transform perspectives and enrich lives.\n\nLocated in the heart of the cultural district, our gallery provides an intimate yet dynamic space for experiencing art. We regularly host exhibitions, artist talks, and educational programs to engage with our community and promote artistic dialogue.",
  },
  {
    id: "4",
    page: "contact",
    section: "address",
    title: "Visit Us",
    content: "123 Art Street\nCultural District\nNew York, NY 10001",
  },
  {
    id: "5",
    page: "contact",
    section: "hours",
    title: "Gallery Hours",
    content:
      "Tuesday - Saturday: 10:00 AM - 6:00 PM\nSunday: 12:00 PM - 5:00 PM\nMonday: Closed",
  },
  {
    id: "6",
    page: "contact",
    section: "contact",
    title: "Get in Touch",
    content:
      "Phone: (555) 123-4567\nEmail: info@zoheartgallery.com\nGeneral Inquiries: hello@zoheartgallery.com",
  },
];

const PageContentManagement = () => {
  const [pageContent, setPageContent] =
    useState<PageContent[]>(mockPageContent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PageContent>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();

  const handleEdit = (content: PageContent) => {
    setFormData(content);
    setEditingId(content.id);
  };

  const handleSave = () => {
    if (!formData.content) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing content
      setPageContent(
        pageContent.map((content) =>
          content.id === editingId
            ? ({ ...content, ...formData } as PageContent)
            : content
        )
      );
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
    }

    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const groupedContent = pageContent.reduce((acc, content) => {
    if (!acc[content.page]) {
      acc[content.page] = [];
    }
    acc[content.page].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);

  const getPageDisplayName = (page: string) => {
    const names: Record<string, string> = {
      home: "Home Page",
      about: "About Page",
      contact: "Contact Page",
    };
    return names[page] || page;
  };

  const getSectionDisplayName = (section: string) => {
    const names: Record<string, string> = {
      hero: "Hero Section",
      subtitle: "Subtitle",
      main: "Main Content",
      address: "Address",
      hours: "Operating Hours",
      contact: "Contact Information",
    };
    return names[section] || section;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Page Content Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Site
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedContent).map(([page, contents]) => (
          <div key={page}>
            <h3 className="text-xl font-semibold mb-4 text-gallery-gold">
              {getPageDisplayName(page)}
            </h3>

            <div className="space-y-4">
              {contents.map((content) => (
                <Card key={content.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {getSectionDisplayName(content.section)}
                      </CardTitle>
                      {editingId !== content.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {editingId === content.id ? (
                      <div className="space-y-4">
                        {content.title !== undefined && (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Title
                            </label>
                            <Input
                              value={formData.title || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Enter title"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Content
                          </label>
                          <Textarea
                            value={formData.content || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                content: e.target.value,
                              })
                            }
                            placeholder="Enter content"
                            rows={content.section === "main" ? 8 : 4}
                          />
                        </div>

                        {content.imageUrl !== undefined && (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Image
                            </label>
                            <div className="space-y-2">
                              {formData.imageUrl ? (
                                <div className="space-y-2">
                                  <img
                                    src={formData.imageUrl}
                                    alt="Content image"
                                    className="w-32 h-20 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowMediaSelector(true)}
                                    size="sm"
                                  >
                                    <Image className="w-4 h-4 mr-2" />
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowMediaSelector(true)}
                                  className="w-full py-4 border-dashed"
                                  size="sm"
                                >
                                  <Image className="w-4 h-4 mr-2" />
                                  Select Image
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSave}
                            className="bg-gallery-gold hover:bg-gallery-gold/90"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {content.title && (
                          <h4 className="font-semibold text-foreground">
                            {content.title}
                          </h4>
                        )}

                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {content.content}
                        </div>

                        {content.imageUrl && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-2">
                              Current Image:
                            </p>
                            <img
                              src={content.imageUrl}
                              alt="Content"
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showMediaSelector && (
        <MediaSelector
          selectedImage={formData.imageUrl}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, imageUrl: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="all"
        />
      )}
    </div>
  );
};

export default PageContentManagement;
