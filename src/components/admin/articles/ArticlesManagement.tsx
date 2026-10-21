import { useEffect, useState } from "react";
import { ExternalLink, Newspaper, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { formatDate } from "@/lib/dates";
import { useAdminArticles, type Article } from "@/hooks/useArticles";
import type { Exhibition } from "@/types/api";
import {
  AdminPage,
  ConfirmDelete,
  EmptyState,
  IconAction,
  IconLink,
  ListPanel,
  ListRow,
  LoadingPanel,
  ResultCount,
  SearchField,
  StatusBadge,
  Thumb,
} from "../AdminUI";
import ArticleForm from "./ArticleForm";

const ArticlesManagement = () => {
  const { toast } = useToast();
  const { articles, loading, error, refetch } = useAdminArticles();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  // null: the list; "new": a new article; otherwise the article being edited
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    apiClient
      .getAdminExhibitions()
      .then(setExhibitions)
      .catch((error) => console.error("Error fetching exhibitions:", error));
  }, []);

  const handleDelete = async (article: Article) => {
    try {
      const response = await apiClient.deleteArticle(article.id);
      if (response.success) {
        toast({ title: `“${article.title}” deleted` });
        refetch();
      } else {
        toast({
          title: "Couldn't delete the article",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "Couldn't delete the article", variant: "destructive" });
    }
  };

  if (editing) {
    return (
      <ArticleForm
        article={editing === "new" ? null : editing}
        exhibitions={exhibitions}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refetch();
        }}
      />
    );
  }

  const newButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus aria-hidden="true" />
      New article
    </Button>
  );

  const exhibitionOf = (article: Article) =>
    exhibitions.find((e) => e.id === article.exhibition_id);

  const search = searchTerm.toLowerCase();
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = [
      article.title,
      article.exhibition_title ?? exhibitionOf(article)?.title ?? "",
    ].some((text) => text.toLowerCase().includes(search));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published") === article.is_published;
    return matchesSearch && matchesStatus;
  });
  const filtered = searchTerm !== "" || statusFilter !== "all";

  return (
    <AdminPage
      title="Articles"
      description="Longer texts about an exhibition, shown on its page once published."
      actions={newButton}
    >
      {loading && articles.length === 0 ? (
        <LoadingPanel label="Loading articles…" />
      ) : error ? (
        <EmptyState
          icon={Newspaper}
          title="Couldn't load the articles"
          description={error}
          action={
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search articles"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white sm:w-40" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <ResultCount
              shown={filteredArticles.length}
              total={articles.length}
              noun="articles"
              onClear={
                filtered
                  ? () => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }
                  : undefined
              }
            />

            {filteredArticles.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title={
                  articles.length === 0
                    ? "No articles yet"
                    : "No articles match"
                }
                description={
                  articles.length === 0
                    ? "Write one to tell the story behind an exhibition."
                    : "Try another search or filter."
                }
                action={articles.length === 0 && newButton}
              />
            ) : (
              <ListPanel>
                {filteredArticles.map((article) => {
                  const exhibition = exhibitionOf(article);
                  const exhibitionTitle =
                    article.exhibition_title ?? exhibition?.title;
                  const slug = article.exhibition_slug ?? exhibition?.slug;
                  const details = [
                    exhibitionTitle,
                    formatDate(article.published_at ?? article.created_at),
                  ].filter(Boolean);
                  return (
                    <ListRow key={article.id}>
                      <Thumb
                        src={
                          article.featured_image || exhibition?.featured_image
                        }
                        shape="poster"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <button
                            type="button"
                            onClick={() => setEditing(article)}
                            className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                          >
                            {article.title}
                          </button>
                          {article.is_published ? (
                            <StatusBadge tone="success">Published</StatusBadge>
                          ) : (
                            <StatusBadge tone="neutral">Draft</StatusBadge>
                          )}
                        </div>
                        {details.length > 0 && (
                          <p className="mt-1 truncate text-[13px] text-mist">
                            {details.join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center">
                        {article.is_published && slug && (
                          <span className="hidden sm:inline-flex">
                            <IconLink
                              label="View on website"
                              icon={ExternalLink}
                              href={`/exhibition/${slug}`}
                            />
                          </span>
                        )}
                        <IconAction
                          label="Edit"
                          icon={Pencil}
                          onClick={() => setEditing(article)}
                        />
                        <ConfirmDelete
                          title="Delete this article?"
                          description={
                            <>
                              “{article.title}” will be removed from the website
                              and the admin. This can't be undone.
                            </>
                          }
                          onConfirm={() => handleDelete(article)}
                        />
                      </div>
                    </ListRow>
                  );
                })}
              </ListPanel>
            )}
          </div>
        </>
      )}
    </AdminPage>
  );
};

export default ArticlesManagement;
