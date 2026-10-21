import { createContext, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";

export interface PageEntry {
  title: string;
  description: string;
  // Free-form settings saved by the page editors
  content: Record<string, unknown> & { description?: string };
  isVisible: boolean;
}

export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  updated_at: string;
}

export interface PageDataValue {
  pageData: Record<string, PageEntry | undefined>;
  contactInfo: ContactInfo | null;
  homeSettings: { title?: string; description?: string } | null;
  loading: boolean;
  error: string | null;
  refreshPageData: () => Promise<void>;
}

export const PageDataContext = createContext<PageDataValue | null>(null);

// The API returns {} when no contact info has been saved yet
const isContactInfo = (value: unknown): value is ContactInfo =>
  typeof value === "object" && value !== null && "id" in value;

/** Loads page settings and contact info once for the whole app. */
export const PageDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, loading, error, refetch } = useApi(
    () =>
      apiClient.getPageContent() as Promise<{
        pages: Record<string, PageEntry>;
        contactInfo: ContactInfo | Record<string, never>;
      }>,
    []
  );

  const value = useMemo<PageDataValue>(() => {
    const pages = data?.pages ?? {};
    const contact = data?.contactInfo;
    return {
      pageData: pages,
      contactInfo: isContactInfo(contact) ? contact : null,
      homeSettings: pages.home
        ? {
            title: pages.home.title,
            description: pages.home.description,
            ...pages.home.content,
          }
        : null,
      loading,
      error: error ? "Failed to fetch page data" : null,
      refreshPageData: refetch,
    };
  }, [data, loading, error, refetch]);

  return (
    <PageDataContext.Provider value={value}>
      {children}
    </PageDataContext.Provider>
  );
};
