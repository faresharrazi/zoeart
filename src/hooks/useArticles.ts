import { apiClient, ApiError } from "@/lib/apiClient";
import { useApi } from "./useApi";

export interface Article {
  id: number;
  exhibition_id: number;
  title: string;
  content: string;
  featured_image?: string;
  media_files?: string[];
  author?: string;
  published_at?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  exhibition_title?: string;
  exhibition_slug?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  curator?: string;
}

/** The published article of an exhibition, or null if it has none. */
export const useArticleByExhibition = (exhibitionId: number | undefined) => {
  const { data, loading, error } = useApi<Article | null>(async () => {
    if (!exhibitionId) return null;
    try {
      const response = await apiClient.getArticleByExhibition(exhibitionId);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }, [exhibitionId]);

  return { article: data ?? null, loading, error };
};

/** All articles, published or not (admin). */
export const useAdminArticles = () => {
  const { data, loading, error, refetch } = useApi(
    async () => (await apiClient.getAdminArticles()).data as Article[],
    []
  );

  return {
    articles: data ?? [],
    loading,
    error: error?.message ?? null,
    refetch,
  };
};
