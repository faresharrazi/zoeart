import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ArtworkCard from "@/components/ArtworkCard";
import { FilterBar, FilterSearch, FilterSelect } from "@/components/FilterBar";
import {
  Container,
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
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

const toOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

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
              <FilterBar
                id="collection"
                summary={
                  isFiltered
                    ? `${results.length} of ${artworks.length} artworks`
                    : `${artworks.length} artworks`
                }
                isFiltered={isFiltered}
                onClear={() =>
                  setParams(new URLSearchParams(), { replace: true })
                }
              >
                <form
                  role="search"
                  aria-label="Filter artworks"
                  onSubmit={(e) => e.preventDefault()}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6"
                >
                  <FilterSearch
                    id="collection-search"
                    value={filters.q}
                    onChange={(v) => setFilter("q", v)}
                    placeholder="Title, artist, medium…"
                    className="sm:col-span-2 lg:col-span-1"
                  />
                  <FilterSelect
                    id="filter-artist"
                    label="Artist"
                    value={filters.artist}
                    options={toOptions(options.artists)}
                    onChange={(v) => setFilter("artist", v)}
                  />
                  <FilterSelect
                    id="filter-year"
                    label="Year"
                    value={filters.year}
                    options={toOptions(options.years)}
                    onChange={(v) => setFilter("year", v)}
                  />
                  <FilterSelect
                    id="filter-medium"
                    label="Medium"
                    value={filters.medium}
                    options={toOptions(options.mediums)}
                    onChange={(v) => setFilter("medium", v)}
                  />
                  <FilterSelect
                    id="filter-sort"
                    label="Sort by"
                    value={filters.sort}
                    options={Object.entries(SORT_ORDERS).map(
                      ([value, label]) => ({ value, label })
                    )}
                    onChange={(v) => setFilter("sort", v)}
                    allLabel={null}
                  />
                </form>
              </FilterBar>

              {results.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
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
