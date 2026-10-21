export interface CollectionArtwork {
  id: number;
  title?: string;
  artist_name?: string;
  artist_slug?: string;
  year?: number | null;
  medium?: string;
  description?: string;
  created_at?: string;
}

export interface CollectionFilters {
  q: string;
  artist: string; // artist name, or "" for all
  year: string; // "" for all
  medium: string; // "" for all
  sort: SortOrder;
}

export const SORT_ORDERS = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title (A–Z)",
} as const;
export type SortOrder = keyof typeof SORT_ORDERS;

// Case- and accent-insensitive text for matching ("Ψυχή" ~ "ψυχη", "café" ~ "cafe")
const fold = (text: string | number | null | undefined) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const uniqueSorted = (values: (string | undefined)[]) =>
  [...new Set(values.map((v) => v?.trim()).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b)
  );

/** Values available in each filter, taken from the artworks themselves. */
export const filterOptions = (artworks: CollectionArtwork[]) => ({
  artists: uniqueSorted(artworks.map((a) => a.artist_name)),
  years: [...new Set(artworks.map((a) => a.year).filter(Boolean) as number[])]
    .sort((a, b) => b - a)
    .map(String),
  mediums: uniqueSorted(artworks.map((a) => a.medium)),
});

export const filterArtworks = <T extends CollectionArtwork>(
  artworks: T[],
  { q, artist, year, medium, sort }: CollectionFilters
): T[] => {
  const words = fold(q).split(/\s+/).filter(Boolean);

  const matches = artworks.filter((artwork) => {
    if (artist && artwork.artist_name?.trim() !== artist) return false;
    if (year && String(artwork.year) !== year) return false;
    if (medium && artwork.medium?.trim() !== medium) return false;
    if (words.length === 0) return true;
    const haystack = fold(
      [
        artwork.title,
        artwork.artist_name,
        artwork.medium,
        artwork.year,
        artwork.description,
      ].join(" ")
    );
    return words.every((word) => haystack.includes(word));
  });

  const byYear = (a: T, b: T) => (a.year ?? 0) - (b.year ?? 0);
  switch (sort) {
    case "oldest":
      return matches.sort(byYear);
    case "title":
      return matches.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    default:
      return matches.sort((a, b) => byYear(b, a));
  }
};
