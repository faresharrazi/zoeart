import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import ArtworkCard from "@/components/ArtworkCard";
import {
  Container,
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import {
  filterArtworks,
  filterOptions,
  SORT_ORDERS,
  type CollectionFilters,
  type SortOrder,
} from "@/lib/collection";

// Radix Select items can't have an empty value
const ALL = "all";

// Underlined fields, matching the site's forms
const fieldClass =
  "h-11 rounded-none border-0 border-b border-ink/40 bg-transparent px-0 shadow-none focus:border-ink focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0";

const FilterSelect = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm text-mist">
      {label}
    </label>
    <Select
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger id={id} className={fieldClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const Collection = () => {
  const { pageData } = usePageDataFromDB();
  const { data: artworks = [], loading } = useApi(
    () => apiClient.getArtworks(),
    []
  );
  useSeo({
    title: pageData.gallery?.title || "Collection",
    description: pageData.gallery?.description,
  });

  // Filters live in the URL so a filtered view can be shared or bookmarked
  const [params, setParams] = useSearchParams();
  const sortParam = params.get("sort") || "";
  const filters: CollectionFilters = {
    q: params.get("q") || "",
    artist: params.get("artist") || "",
    year: params.get("year") || "",
    medium: params.get("medium") || "",
    sort: sortParam in SORT_ORDERS ? (sortParam as SortOrder) : "newest",
  };
  const setFilter = (key: keyof CollectionFilters, value: string) => {
    const next = new URLSearchParams(params);
    if (value && !(key === "sort" && value === "newest")) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const isFiltered = Boolean(
    filters.q || filters.artist || filters.year || filters.medium
  );

  const options = useMemo(() => filterOptions(artworks), [artworks]);
  const results = useMemo(
    () => filterArtworks([...artworks], filters),
    // filters is derived from params
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artworks, params.toString()]
  );

  return (
    <RequireVisiblePage page="gallery">
      <PageLayout>
        <PageHeader
          title={pageData.gallery?.title?.trim() || "Collection"}
          description={
            pageData.gallery?.description && (
              <p>{pageData.gallery.description}</p>
            )
          }
        />

        <Container className="pb-16 md:pb-20">
          {loading ? (
            <LoadingState label="Loading collection…" />
          ) : artworks.length === 0 ? (
            <p className="text-center text-mist">No artworks to show yet.</p>
          ) : (
            <>
              <form
                role="search"
                aria-label="Filter artworks"
                onSubmit={(e) => e.preventDefault()}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6 border-t border-line pt-10 mb-8"
              >
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                  <label
                    htmlFor="collection-search"
                    className="text-sm text-mist"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-mist"
                      aria-hidden="true"
                    />
                    <Input
                      id="collection-search"
                      type="search"
                      value={filters.q}
                      onChange={(e) => setFilter("q", e.target.value)}
                      placeholder="Title, artist, medium…"
                      className={`${fieldClass} pl-7`}
                    />
                  </div>
                </div>
                <FilterSelect
                  id="filter-artist"
                  label="Artist"
                  value={filters.artist}
                  options={options.artists}
                  onChange={(v) => setFilter("artist", v)}
                />
                <FilterSelect
                  id="filter-year"
                  label="Year"
                  value={filters.year}
                  options={options.years}
                  onChange={(v) => setFilter("year", v)}
                />
                <FilterSelect
                  id="filter-medium"
                  label="Medium"
                  value={filters.medium}
                  options={options.mediums}
                  onChange={(v) => setFilter("medium", v)}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-sort" className="text-sm text-mist">
                    Sort by
                  </label>
                  <Select
                    value={filters.sort}
                    onValueChange={(v) => setFilter("sort", v)}
                  >
                    <SelectTrigger id="filter-sort" className={fieldClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SORT_ORDERS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>

              <div className="flex items-center justify-between gap-4 mb-10 min-h-10">
                <p className="text-mist" role="status" aria-live="polite">
                  {isFiltered
                    ? `${results.length} of ${artworks.length} artworks`
                    : `${artworks.length} artworks`}
                </p>
                {isFiltered && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm border-b border-ink pb-0.5 hover:text-stone"
                    onClick={() =>
                      setParams(new URLSearchParams(), { replace: true })
                    }
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    Clear filters
                  </button>
                )}
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      headingLevel="h2"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-mist py-12">
                  No artworks match these filters.
                </p>
              )}
            </>
          )}
        </Container>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default Collection;
