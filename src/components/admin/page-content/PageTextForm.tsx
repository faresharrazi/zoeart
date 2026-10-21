import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient, errorMessage } from "@/lib/apiClient";
import type { PageEntry } from "@/types/api";

interface PageTextFormProps {
  pageId: string;
  page: PageEntry | undefined;
  titleLabel: string;
  descriptionLabel: string;
  descriptionRows?: number;
}

/** A page's title and text, always editable, saved with one button. */
const PageTextForm = ({
  pageId,
  page,
  titleLabel,
  descriptionLabel,
  descriptionRows = 4,
}: PageTextFormProps) => {
  const { refreshPageData } = usePageDataFromDB();
  const { toast } = useToast();
  const savedTitle = page?.title ?? "";
  const savedDescription = page?.description ?? "";
  const [title, setTitle] = useState(savedTitle);
  const [description, setDescription] = useState(savedDescription);
  const [saving, setSaving] = useState(false);

  // Follow the saved text (after saving, or when another page is picked),
  // but not other changes such as the page being shown or hidden
  useEffect(() => {
    setTitle(savedTitle);
    setDescription(savedDescription);
  }, [savedTitle, savedDescription]);

  const dirty = title !== savedTitle || description !== savedDescription;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.updatePageContent(pageId, {
        title: title.trim(),
        description: description.trim(),
      });
      await refreshPageData();
      toast({ title: "Page saved" });
    } catch (error) {
      toast({
        title: "Couldn't save the page",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${pageId}-title`}>{titleLabel}</Label>
        <Input
          id={`${pageId}-title`}
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pageId}-description`}>{descriptionLabel}</Label>
        <Textarea
          id={`${pageId}-description`}
          value={description}
          rows={descriptionRows}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-2 border-t pt-5">
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => {
              setTitle(savedTitle);
              setDescription(savedDescription);
            }}
          >
            Discard
          </Button>
        )}
        <Button type="submit" disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {saving ? "Saving…" : "Save page"}
        </Button>
      </div>
    </form>
  );
};

export default PageTextForm;
