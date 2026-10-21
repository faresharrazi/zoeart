import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";
import { PageDataContext, type PageDataValue } from "./pageDataContextValue";
import type { ContactInfo } from "@/types/api";

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
    () => apiClient.getPageContent(),
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
