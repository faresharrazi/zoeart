import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

interface PageData {
  [key: string]: {
    title: string;
    description: string;
    content: any;
    isVisible: boolean;
  };
}

interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  updated_at: string;
}

export const usePageDataFromDB = () => {
  const [pageData, setPageData] = useState<PageData>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [homeSettings, setHomeSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPageContent();

      setPageData(data.pages);
      setContactInfo(data.contactInfo);

      // Extract home settings from page data
      if (data.pages.home) {
        setHomeSettings({
          title: data.pages.home.title,
          description: data.pages.home.description,
          heroImages: data.pages.home.content?.heroImages || [],
          heroImageIds: data.pages.home.content?.heroImageIds || [],
          ...data.pages.home.content,
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching page data:", err);
      setError("Failed to fetch page data");
      // Fallback to empty data
      setPageData({});
      setContactInfo(null);
      setHomeSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  return {
    pageData,
    contactInfo,
    homeSettings,
    loading,
    error,
    refreshPageData: fetchPageData,
  };
};
