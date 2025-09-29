import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

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

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getArticles();
        if (response.success) {
          setArticles(response.data);
        } else {
          setError("Failed to fetch articles");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
};

export const useArticle = (id: number) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getArticle(id);
        if (response.success) {
          setArticle(response.data);
        } else {
          setError("Failed to fetch article");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error };
};

export const useArticleByExhibition = (exhibitionId: number) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exhibitionId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getArticleByExhibition(exhibitionId);
        if (response.success) {
          setArticle(response.data);
        } else {
          setError("Failed to fetch article");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [exhibitionId]);

  return { article, loading, error };
};

export const useAdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAdminArticles();
        if (response.success) {
          setArticles(response.data);
        } else {
          setError("Failed to fetch articles");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
};
