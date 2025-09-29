import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useAdminArticles, Article } from "@/hooks/useArticles";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText,
} from "lucide-react";

const ArticlesManagement = () => {
  const { toast } = useToast();
  const { articles, loading, error } = useAdminArticles();
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [exhibitionsLoading, setExhibitionsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch exhibitions
  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const exhibitions = await apiClient.getExhibitions();
        setExhibitions(exhibitions);
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
      } finally {
        setExhibitionsLoading(false);
      }
    };

    fetchExhibitions();
  }, []);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    exhibition_id: "",
    title: "",
    content: "",
    media_files: [] as string[],
    is_published: false,
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      if (!formData.exhibition_id || !formData.title || !formData.content) {
        toast({
          title: "Error",
          description: "Please select an exhibition, add a title, and add content",
          variant: "destructive",
        });
        return;
      }

      const response = await apiClient.createArticle({
        exhibition_id: parseInt(formData.exhibition_id),
        title: formData.title,
        content: formData.content,
        media_files: formData.media_files.length > 0 ? formData.media_files : undefined,
        is_published: formData.is_published,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Article created successfully",
        });
        setIsCreating(false);
        resetForm();
        // Refresh articles list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating article:", error);
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingArticle) return;

    try {
      const response = await apiClient.updateArticle(editingArticle.id, {
        title: formData.title,
        content: formData.content,
        media_files: formData.media_files.length > 0 ? formData.media_files : undefined,
        is_published: formData.is_published,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
        setEditingArticle(null);
        resetForm();
        // Refresh articles list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiClient.deleteArticle(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Article deleted successfully",
        });
        // Refresh articles list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      exhibition_id: "",
      title: "",
      content: "",
      media_files: [],
      is_published: false,
    });
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      exhibition_id: article.exhibition_id.toString(),
      title: article.title,
      content: article.content,
      media_files: article.media_files || [],
      is_published: article.is_published,
    });
  };

  const getExhibitionTitle = (exhibitionId: number) => {
    const exhibition = exhibitions.find(e => e.id === exhibitionId);
    return exhibition?.title || `Exhibition #${exhibitionId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          <p>Error loading articles: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Articles Management</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingArticle) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingArticle ? "Edit Article" : "Create New Article"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exhibition_id">Exhibition *</Label>
              <Select
                value={formData.exhibition_id}
                onValueChange={(value) => handleInputChange("exhibition_id", value)}
                disabled={!!editingArticle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exhibition" />
                </SelectTrigger>
                <SelectContent>
                  {exhibitions.map((exhibition) => (
                    <SelectItem key={exhibition.id} value={exhibition.id.toString()}>
                      {exhibition.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter article title"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="content">Article Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange("content", content)}
                placeholder="Write your article content here... Use the toolbar above to format text, add images, videos, and links."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleInputChange("is_published", checked)}
              />
              <Label htmlFor="is_published">Published</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingArticle ? handleUpdate : handleCreate}
                disabled={!formData.exhibition_id || !formData.title || !formData.content}
              >
                {editingArticle ? "Update Article" : "Create Article"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingArticle(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={article.is_published ? "default" : "secondary"}
                    >
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="line-clamp-1">
                    {getExhibitionTitle(article.exhibition_id)}
                  </span>
                </div>

                {article.author && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="line-clamp-1">{article.author}</span>
                  </div>
                )}

                {article.published_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600 line-clamp-3">
                {article.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(article)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Article</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{article.title}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No articles found. Create your first article!</p>
        </div>
      )}
    </div>
  );
};

export default ArticlesManagement;
