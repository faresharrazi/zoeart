import type { Exhibition, ExhibitionStatus } from "@/types/api";

/** How each exhibition status is named on the site. */
export const STATUS_LABELS: Record<ExhibitionStatus, string> = {
  current: "On view now",
  upcoming: "Upcoming exhibition",
  past: "Past exhibition",
};

/** Layouts offered on the Exhibitions page */
export const EXHIBITION_VIEWS = {
  grid: "Grid",
  cards: "Cards",
  list: "List",
} as const;
export type ExhibitionView = keyof typeof EXHIBITION_VIEWS;

export interface ExhibitionFilters {
  q: string;
  status: ExhibitionStatus | "";
  year: string; // "" for all
}

type Searchable = Pick<
  Exhibition,
  "title" | "description" | "location" | "curator" | "status" | "start_date"
>;

// Case- and accent-insensitive text ("Ψυχή" ~ "ψυχη", "café" ~ "cafe")
const fold = (text: string | null | undefined) =>
  (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Years exhibitions opened in, newest first. */
export const exhibitionYears = (exhibitions: Searchable[]) =>
  [
    ...new Set(
      exhibitions
        .map((e) => e.start_date?.slice(0, 4))
        .filter(Boolean) as string[]
    ),
  ].sort((a, b) => b.localeCompare(a));

export const filterExhibitions = <T extends Searchable>(
  exhibitions: T[],
  { q, status, year }: ExhibitionFilters
): T[] => {
  const words = fold(q).split(/\s+/).filter(Boolean);
  return exhibitions.filter((e) => {
    if (status && e.status !== status) return false;
    if (year && e.start_date?.slice(0, 4) !== year) return false;
    if (words.length === 0) return true;
    const haystack = fold(
      [e.title, e.description, e.location, e.curator].join(" ")
    );
    return words.every((word) => haystack.includes(word));
  });
};
