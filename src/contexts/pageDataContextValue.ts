import { createContext } from "react";
import type { ContactInfo, OpeningHour, PageEntry, Partner } from "@/types/api";

export interface PageDataValue {
  pageData: Record<string, PageEntry | undefined>;
  contactInfo: ContactInfo | null;
  partners: Partner[];
  openingHours: OpeningHour[];
  /** Home page title and tagline plus its settings (slideSeconds...) */
  homeSettings: {
    title?: string;
    description?: string;
    slideSeconds?: unknown;
  } | null;
  loading: boolean;
  error: string | null;
  refreshPageData: () => Promise<void>;
}

export const PageDataContext = createContext<PageDataValue | null>(null);
