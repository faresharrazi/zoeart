import { createContext } from "react";
import type { ContactInfo, PageEntry, Partner } from "@/types/api";

export interface PageDataValue {
  pageData: Record<string, PageEntry | undefined>;
  contactInfo: ContactInfo | null;
  partners: Partner[];
  homeSettings: { title?: string; description?: string } | null;
  loading: boolean;
  error: string | null;
  refreshPageData: () => Promise<void>;
}

export const PageDataContext = createContext<PageDataValue | null>(null);
