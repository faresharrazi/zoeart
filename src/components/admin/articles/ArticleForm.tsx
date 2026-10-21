import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import type { Article } from "@/hooks/useArticles";
import type { Exhibition } from "@/types/api";
import { AdminPage, Panel } from "../AdminUI";

interface ArticleFormProps {
  /** The article to edit, or null to write a new one */
  article: Article | null;
  exhibitions: Exhibition[];
  onSaved: () => void;
  onCancel: () => void;
}

/** Write or edit the article shown on an exhibition's page. */
const ArticleForm = ({
  article,
  exhibitions,
  onSaved,
  onCancel,
}: ArticleFormProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    exhibition_id: article ? article.exhibition_id.toString() : "",
    title: article?.title ?? "",
    content: article?.content ?? "",
    media_files: article?.media_files ?? ([] as string[]),
    is_published: article?.is_published ?? false,
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean | string[]
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const complete =
    Boolean(formData.exhibition_id) &&
    Boolean(formData.title) &&
    Boolean(formData.content);

  const handleSave = async () => {
    if (!complete) {
      toast({
        title: "Some details are missing",
        description: "Choose an exhibition and add a title and some content.",
        variant: "destructive",
      });
      return;
    }

    const media_files =
      formData.media_files.length > 0 ? formData.media_files : undefined;
    setSaving(true);
    try {
      const response = article
        ? await apiClient.updateArticle(article.id, {
            title: formData.title,
            content: formData.content,
            media_files,
            is_published: formData.is_published,
          })
        : await apiClient.createArticle({
            exhibition_id: parseInt(formData.exhibition_id),
            title: formData.title,
            content: formData.content,
            media_files,
            is_published: formData.is_published,
          });

      if (response.success) {
        toast({ title: article ? "Article saved" : "Article created" });
        onSaved();
      } else {
        toast({
          title: "Couldn't save the article",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast({ title: "Couldn't save the article", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage
      title={article ? "Edit article" : "New article"}
      description={
        article
          ? article.title
          : "Once published, the article appears on its exhibition's page."
      }
      onBack={onCancel}
      backLabel="Back to articles"
      actions={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!complete || saving}>
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {saving ? "Saving…" : article ? "Save article" : "Create article"}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Panel bodyClassName="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="article-title">Title</Label>
            <Input
              id="article-title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g. A poetic stitch of time"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">Content</p>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => handleInputChange("content", content)}
              placeholder="Write the article here. Use the toolbar to format text and add images, videos and links."
            />
          </div>
        </Panel>

        <Panel title="Settings" bodyClassName="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="article-exhibition">Exhibition</Label>
            <Select
              value={formData.exhibition_id}
              onValueChange={(value) =>
                handleInputChange("exhibition_id", value)
              }
              disabled={!!article}
            >
              <SelectTrigger id="article-exhibition">
                <SelectValue placeholder="Choose an exhibition" />
              </SelectTrigger>
              <SelectContent>
                {exhibitions.map((exhibition) => (
                  <SelectItem
                    key={exhibition.id}
                    value={exhibition.id.toString()}
                  >
                    {exhibition.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {article && (
              <p className="text-xs text-mist">
                Can't be changed once the article is created.
              </p>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 border-t pt-5">
            <div className="space-y-1">
              <Label htmlFor="article-published">Published</Label>
              <p className="text-xs text-mist">Shown on the exhibition page.</p>
            </div>
            <Switch
              id="article-published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                handleInputChange("is_published", checked)
              }
            />
          </div>
        </Panel>
      </div>
    </AdminPage>
  );
};

export default ArticleForm;
